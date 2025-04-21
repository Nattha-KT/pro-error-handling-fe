import React, { useState, useCallback } from 'react';
import ErrorDisplay from '../components/ui/ErrorDisplay';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import ErrorBoundary from '../errors/boundaries/ErrorBoundary';
import { 
  AuthenticationError, AuthorizationError, NetworkError, 
  NotFoundError, ServerError, ValidationError 
} from '../errors/classes';
import useErrorStore from '../store/errorStore';
import { isFeatureEnabled, updateFeatureFlag } from '../features/featureFlags';
import useApi from '../hooks/useApi';
import { logErrorToMonitoring } from '../services/errorLogging';
import { withErrorHandling, retryWithBackoff } from '../utils/errorDecorator';

/**
 * Component that deliberately throws an error
 */
const BuggyComponent: React.FC = () => {
  throw new Error('This component has a render error');
};

/**
 * Error handling demo page showing various error patterns
 */
const ErrorDemo: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState<Error | null>(null);
  const [buggyVisible, setBuggyVisible] = useState(false);
  const { setError } = useErrorStore();
  const { execute, loading, error } = useApi<{ data: string }>();

  /**
   * Demo: Trigger different types of errors
   */
  const triggerError = (errorType: string) => {
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      
      let error;
      switch (errorType) {
        case 'network':
          error = new NetworkError('Failed to connect to API');
          break;
        case 'auth':
          error = new AuthenticationError('Your session has expired');
          break;
        case 'forbidden':
          error = new AuthorizationError('You do not have permission to access this resource');
          break;
        case 'validation':
          error = new ValidationError('Form validation failed', {
            email: ['Invalid email format'],
            password: ['Password must be at least 8 characters']
          });
          break;
        case 'notfound':
          error = new NotFoundError('Resource not found');
          break;
        case 'server':
          error = new ServerError('Internal Server Error', 500);
          break;
        default:
          error = new Error('Unknown error occurred');
      }
      
      // Set the error in global store
      setError(error);
      
      // Also store locally for display
      setLocalError(error);
      
      // Log the error to monitoring
      logErrorToMonitoring(error);
    }, 1000);
  };

  /**
   * Demo: Simulate API call with error handling
   */
  const simulateApiCall = async () => {
    const result = await execute('/api/data');
    console.log('API result:', result);
  };

  /**
   * Demo: Error middleware pattern
   */
  const apiWithErrorHandling = withErrorHandling(
    async (id: string) => {
      // Simulate API call
      if (id === '404') {
        throw new NotFoundError('User not found');
      }
      
      if (id === '500') {
        throw new ServerError('Database connection error');
      }
      
      return { id, name: 'Test User' };
    },
    {
      context: 'UserService.getUser',
    }
  );

  /**
   * Demo: Call decorated API function
   */
  const callDecoratedApi = async (id: string) => {
    setIsLoading(true);
    const result = await apiWithErrorHandling(id);
    setIsLoading(false);
    
    if (result.error) {
      setLocalError(result.error);
    } else {
      setLocalError(null);
      console.log('Success:', result.data);
    }
  };

  /**
   * Demo: Retry pattern with backoff
   */
  const simulateRetry = async () => {
    setIsLoading(true);
    let attempts = 0;
    
    try {
      const result = await retryWithBackoff(
        async () => {
          attempts++;
          if (attempts < 3) {
            throw new NetworkError('Connection failed (attempt ' + attempts + ')');
          }
          return { success: true, attempts };
        },
        {
          maxRetries: 5,
          initialDelayMs: 500, // Shorter for demo purposes
          shouldRetry: (error) => error instanceof NetworkError
        }
      );
      
      console.log('Retry succeeded after', attempts, 'attempts:', result);
      setLocalError(null);
    } catch (error) {
      setLocalError(error as Error);
      setError(error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Demo: Toggle feature flag
   */
  const toggleFeatureFlag = (flagName: string) => {
    const isEnabled = isFeatureEnabled(flagName);
    updateFeatureFlag(flagName, !isEnabled);
    // Force re-render
    setLocalError(null);
    setLocalError(null);
  };

  /**
   * Reset demo state
   */
  const resetDemo = useCallback(() => {
    setLocalError(null);
    setBuggyVisible(false);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white shadow-sm rounded-lg p-6">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error Handling Patterns</h1>
          <p className="text-gray-600">
            Demonstrating professional error handling techniques for React applications
          </p>
        </div>

        {/* Section: Error Display */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">
            Error Display Patterns
          </h2>

          <div className="grid gap-4 mb-4">
            {localError && (
              <ErrorDisplay 
                error={localError} 
                onRetry={resetDemo} 
                onDismiss={resetDemo} 
              />
            )}

            {isLoading && (
              <div className="p-4 bg-gray-50 rounded-md">
                <SkeletonLoader height={100} rounded />
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => triggerError('network')}
              className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
            >
              Network Error
            </button>
            <button
              onClick={() => triggerError('auth')}
              className="px-3 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 text-sm"
            >
              Auth Error
            </button>
            <button
              onClick={() => triggerError('validation')}
              className="px-3 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
            >
              Validation Error
            </button>
            <button
              onClick={() => triggerError('server')}
              className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
            >
              Server Error
            </button>
          </div>
        </section>

        {/* Section: Error Boundary */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">
            Error Boundary Pattern
          </h2>

          <div className="p-4 bg-gray-50 rounded-lg mb-4">
            <ErrorBoundary
              resetKeys={[buggyVisible]}
              fallback={(error) => (
                <div className="p-4 bg-red-50 rounded border border-red-200">
                  <h3 className="text-md font-medium text-red-800 mb-2">
                    Component Error Caught
                  </h3>
                  <p className="text-sm text-red-600 mb-3">
                    {error.message}
                  </p>
                  <button
                    onClick={() => setBuggyVisible(false)}
                    className="px-3 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200 text-sm"
                  >
                    Reset Component
                  </button>
                </div>
              )}
            >
              {buggyVisible ? <BuggyComponent /> : <p className="text-gray-600">Component working correctly</p>}
            </ErrorBoundary>
          </div>

          <button
            onClick={() => setBuggyVisible(true)}
            className="px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 text-sm"
          >
            Trigger Component Error
          </button>
        </section>

        {/* Section: API Error Handling */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">
            API Error Handling
          </h2>

          <div className="grid gap-4 mb-4">
            {loading && (
              <div className="p-4 bg-gray-50 rounded-md">
                <div className="flex items-center space-x-4">
                  <SkeletonLoader width={40} height={40} circle />
                  <div className="space-y-2 flex-1">
                    <SkeletonLoader height={20} width="60%" />
                    <SkeletonLoader height={16} width="40%" />
                  </div>
                </div>
              </div>
            )}
            
            {error && !loading && (
              <ErrorDisplay 
                error={error} 
                onRetry={simulateApiCall}
                onDismiss={() => setLocalError(null)}
              />
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={simulateApiCall}
              className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
              disabled={loading}
            >
              Simulate API Call
            </button>
            <button
              onClick={() => callDecoratedApi('123')}
              className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
              disabled={loading}
            >
              Successful API
            </button>
            <button
              onClick={() => callDecoratedApi('404')}
              className="px-3 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
              disabled={loading}
            >
              404 Not Found
            </button>
            <button
              onClick={() => callDecoratedApi('500')}
              className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
              disabled={loading}
            >
              500 Server Error
            </button>
          </div>
        </section>

        {/* Section: Advanced Patterns */}
        <section>
          <h2 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">
            Advanced Patterns
          </h2>

          <div className="grid gap-4 mb-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">Feature Flags</h3>
              <div className="flex items-center mb-2">
                <span className="text-sm mr-3">Error Stack Traces:</span>
                <button
                  onClick={() => toggleFeatureFlag('ENABLE_ERROR_STACK_TRACES')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                    isFeatureEnabled('ENABLE_ERROR_STACK_TRACES') ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    isFeatureEnabled('ENABLE_ERROR_STACK_TRACES') ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
              <div className="flex items-center">
                <span className="text-sm mr-3">Auto-Retry:</span>
                <button
                  onClick={() => toggleFeatureFlag('ENABLE_AUTOMATIC_RETRY')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                    isFeatureEnabled('ENABLE_AUTOMATIC_RETRY') ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    isFeatureEnabled('ENABLE_AUTOMATIC_RETRY') ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">Retry Pattern</h3>
              <button
                onClick={simulateRetry}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                disabled={isLoading}
              >
                {isLoading ? 'Retrying...' : 'Simulate Retry Logic'}
              </button>
              <p className="text-xs text-gray-500 mt-2">
                Will fail twice then succeed on third try
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ErrorDemo;