/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, ErrorInfo, ReactNode } from 'react';
import ErrorManager from '../ErrorManager';
import { ErrorResponse } from '../../types';
import { logErrorToMonitoring } from '../../services/errorLogging';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: ErrorResponse) => ReactNode);
  onError?: (error: ErrorResponse) => void;
  resetKeys?: any[];
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: ErrorResponse | null;
}

/**
 * ErrorBoundary: Component that catches JavaScript errors in child component tree
 * Provides fallback UI and error reporting capabilities
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null 
    };
  }

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    // Process the error through the ErrorManager
    const processedError = ErrorManager.handle(error);
    
    // Update state to trigger fallback UI
    return { 
      hasError: true, 
      error: processedError 
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Process the error
    const processedError = ErrorManager.handle(error);
    
    // Log to console in development
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error caught by ErrorBoundary:', error);
      console.error('Component stack:', errorInfo.componentStack);
    }
    
    // Report to monitoring service if appropriate
    if (ErrorManager.shouldReport(processedError)) {
      logErrorToMonitoring(processedError, {
        componentStack: errorInfo.componentStack
      });
    }
    
    // Call onError callback if provided
    this.props.onError?.(processedError);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    // If any resetKeys have changed, reset the error state
    if (this.props.resetKeys && 
        prevProps.resetKeys &&
        this.state.hasError &&
        this.hasResetKeysChanged(prevProps.resetKeys, this.props.resetKeys)) {
      this.reset();
    }
  }

  hasResetKeysChanged(prevKeys: any[], nextKeys: any[]): boolean {
    return prevKeys.length !== nextKeys.length || 
      prevKeys.some((key, index) => key !== nextKeys[index]);
  }

  /**
   * Reset the error state, allowing the component to re-render normally
   */
  reset = (): void => {
    this.setState({ 
      hasError: false, 
      error: null 
    });
  };

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (hasError && error) {
      // If a fallback was provided, render it
      if (fallback) {
        // If fallback is a function, call it with the error
        if (typeof fallback === 'function') {
          return fallback(error);
        }
        // Otherwise render the fallback directly
        return fallback;
      }

      // Default fallback UI if none provided
      return (
        <div className="p-6 rounded-lg bg-red-50 border border-red-100">
          <h2 className="text-lg font-semibold text-red-800 mb-2">
            Something went wrong
          </h2>
          <p className="text-red-600 mb-4">
            {error.message || 'An unexpected error occurred.'}
          </p>
          <button
            onClick={this.reset}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Try again
          </button>
        </div>
      );
    }

    // If there's no error, render children normally
    return children;
  }
}

export default ErrorBoundary;