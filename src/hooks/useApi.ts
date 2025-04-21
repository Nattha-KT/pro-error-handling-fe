import { useState, useCallback } from 'react';
import ErrorManager from '../errors/ErrorManager';
import { ApiResponse } from '../types';
import useErrorStore from '../store/errorStore';
import { logErrorToMonitoring } from '../services/errorLogging';
import { isFeatureEnabled } from '../features/featureFlags';
import axios, { AxiosError, AxiosRequestConfig } from 'axios';

/**
 * Hook for making API requests with built-in error handling
 */
function useApi<T>() {
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<ApiResponse<T>['error']>(undefined);
  const { setError: setGlobalError } = useErrorStore();

  /**
   * Execute an API request with comprehensive error handling
   */
  const execute = useCallback(
    async (
      url: string,
      options?: AxiosRequestConfig,
      showGlobalError = true
    ): Promise<ApiResponse<T>> => {
      setLoading(true);
      setError(undefined);

      try {
        const response = await axios<T>({
          url,
          ...options,
        });

        const result: ApiResponse<T> = {
          data: response.data,
          status: response.status,
        };

        setData(response.data);
        return result;
      } catch (err) {
        let processedError;

        if (axios.isAxiosError(err)) {
          processedError = handleAxiosError(err);
        } else {
          processedError = ErrorManager.handle(err);
        }

        setError(processedError);

        // Set global error state if requested
        if (showGlobalError) {
          setGlobalError(processedError);
        }

        // Log error to monitoring service based on feature flag
        if (isFeatureEnabled('ENABLE_ERROR_REPORTING') && 
            ErrorManager.shouldReport(processedError)) {
          logErrorToMonitoring(processedError, {
            url,
            method: options?.method || 'GET',
          });
        }

        return {
          error: processedError,
          status: (err as AxiosError)?.response?.status || 500,
        };
      } finally {
        setLoading(false);
      }
    },
    [setGlobalError]
  );

  /**
   * Handle Axios specific errors
   */
  const handleAxiosError = (error: AxiosError): ReturnType<typeof ErrorManager.handle> => {
    const status = error.response?.status || 0;
    const data = error.response?.data;
    const message = 
      typeof data === 'string' ? data : 
      typeof data === 'object' && data && 'message' in data ? String(data.message) : 
      error.message;

    return ErrorManager.handle(
      ErrorManager.createFromHttpStatus(status, message, data)
    );
  };

  /**
   * Reset the hook state
   */
  const reset = useCallback(() => {
    setData(null);
    setError(undefined);
    setLoading(false);
  }, []);

  return {
    execute,
    loading,
    data,
    error,
    reset,
  };
}

export default useApi;