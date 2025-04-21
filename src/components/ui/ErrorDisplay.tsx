import React from 'react';
import { AlertCircle, AlertTriangle, XCircle, Info } from 'lucide-react';
import { ErrorCategory, ErrorResponse, ErrorSeverity } from '../../types';
import { isFeatureEnabled } from '../../features/featureFlags';

interface ErrorDisplayProps {
  error: ErrorResponse;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

/**
 * Component for displaying error messages with appropriate styling based on severity
 */
const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onRetry,
  onDismiss,
  className = '',
}) => {
  const { message, severity, category, retry, stack } = error;
  
  // Determine styling based on severity
  const getSeverityStyles = (): { bg: string; border: string; text: string; icon: JSX.Element } => {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
        return {
          bg: 'bg-red-50',
          border: 'border-red-300',
          text: 'text-red-800',
          icon: <XCircle className="h-5 w-5 text-red-600" />,
        };
      case ErrorSeverity.HIGH:
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-700',
          icon: <AlertCircle className="h-5 w-5 text-red-500" />,
        };
      case ErrorSeverity.MEDIUM:
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-800',
          icon: <AlertTriangle className="h-5 w-5 text-yellow-600" />,
        };
      case ErrorSeverity.LOW:
      default:
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-800',
          icon: <Info className="h-5 w-5 text-blue-500" />,
        };
    }
  };

  const styles = getSeverityStyles();
  
  // Show stack traces only if feature flag is enabled
  const showStackTrace = isFeatureEnabled('ENABLE_ERROR_STACK_TRACES') && stack;

  return (
    <div className={`rounded-md p-4 ${styles.bg} border ${styles.border} ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">{styles.icon}</div>
        
        <div className="ml-3 flex-1">
          <h3 className={`text-sm font-medium ${styles.text}`}>
            {message}
          </h3>
          
          {category && (
            <p className={`mt-1 text-xs ${styles.text} opacity-80`}>
              {category.toUpperCase()} ERROR
              {error.code && ` (${error.code})`}
            </p>
          )}
          
          {showStackTrace && (
            <details className="mt-2">
              <summary className={`text-xs ${styles.text} cursor-pointer`}>
                Stack Trace
              </summary>
              <pre className={`mt-1 whitespace-pre-wrap text-xs ${styles.text} opacity-75 overflow-auto max-h-40 p-2 rounded bg-white bg-opacity-50`}>
                {stack}
              </pre>
            </details>
          )}
          
          <div className="mt-3 flex space-x-2">
            {retry && onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md ${styles.text} bg-white hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2`}
              >
                Retry
              </button>
            )}
            
            {onDismiss && (
              <button
                type="button"
                onClick={onDismiss}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;