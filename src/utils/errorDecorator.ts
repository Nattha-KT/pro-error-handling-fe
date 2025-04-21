import ErrorManager from '../errors/ErrorManager';
import { ApiResponse, ErrorResponse } from '../types';
import { logErrorToMonitoring } from '../services/errorLogging';
import { isFeatureEnabled } from '../features/featureFlags';

/**
 * Higher-order function to wrap API calls with error handling
 * Provides consistent error handling for all service functions
 */
export function withErrorHandling<T, Args extends any[]>(
  fn: (...args: Args) => Promise<T>,
  options: {
    context?: string;
    shouldReport?: (error: ErrorResponse) => boolean;
    transformError?: (error: ErrorResponse) => ErrorResponse;
  } = {}
): (...args: Args) => Promise<ApiResponse<T>> {
  return async (...args: Args): Promise<ApiResponse<T>> => {
    try {
      // Execute the original function
      const result = await fn(...args);
      
      // Return successful response
      return {
        data: result,
        status: 200
      };
    } catch (error) {
      // Process the error through ErrorManager
      let processedError = ErrorManager.handle(error);
      
      // Apply custom error transformation if provided
      if (options.transformError) {
        processedError = options.transformError(processedError);
      }
      
      // Determine if error should be reported
      const shouldReport = options.shouldReport
        ? options.shouldReport(processedError)
        : ErrorManager.shouldReport(processedError);
      
      // Log error to monitoring service if enabled and appropriate
      if (isFeatureEnabled('ENABLE_ERROR_REPORTING') && shouldReport) {
        logErrorToMonitoring(processedError, {
          context: options.context,
          args: process.env.NODE_ENV !== 'production' ? args : undefined
        });
      }
      
      // Return error response
      return {
        error: processedError,
        status: processedError.code as number || 500
      };
    }
  };
}

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelayMs?: number;
    maxDelayMs?: number;
    backoffFactor?: number;
    shouldRetry?: (error: unknown, attempts: number) => boolean;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelayMs = 1000,
    maxDelayMs = 10000,
    backoffFactor = 2,
    shouldRetry = () => true
  } = options;
  
  let attempts = 0;
  
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      return await fn();
    } catch (error) {
      attempts++;
      
      // If max retries reached or shouldn't retry, throw the error
      if (attempts >= maxRetries || !shouldRetry(error, attempts)) {
        throw error;
      }
      
      // Calculate delay with exponential backoff
      const delay = Math.min(
        initialDelayMs * Math.pow(backoffFactor, attempts - 1),
        maxDelayMs
      );
      
      // Wait before next retry
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}