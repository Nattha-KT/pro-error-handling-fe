import { ErrorCategory, ErrorResponse, ErrorSeverity } from '../types';
import { 
  AuthenticationError, AuthorizationError, BaseError, NetworkError, 
  NotFoundError, RateLimitError, ServerError, ValidationError 
} from './classes';

/**
 * ErrorManager: Centralized error handling utility
 * Processes, classifies, and formats errors for consistent handling
 */
class ErrorManager {
  /**
   * Process any error and convert it to a standardized ErrorResponse
   */
  handle(error: unknown): ErrorResponse {
    // If it's already our custom error type, use its properties
    if (error instanceof BaseError) {
      return this.formatErrorResponse(error);
    }
    
    // Handle standard Error objects
    if (error instanceof Error) {
      return this.handleStandardError(error);
    }
    
    // Handle string errors
    if (typeof error === 'string') {
      return this.handleStringError(error);
    }
    
    // Handle other types of errors
    return this.handleUnknownError(error);
  }

  /**
   * Format a BaseError into an ErrorResponse
   */
  private formatErrorResponse(error: BaseError): ErrorResponse {
    return {
      message: error.getUserMessage(),
      severity: error.severity,
      category: error.category,
      code: error.code,
      timestamp: error.timestamp,
      data: error.data,
      retry: error.retry,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
    };
  }

  /**
   * Handle standard JS Error objects
   */
  private handleStandardError(error: Error): ErrorResponse {
    // Try to extract information from the error message for better categorization
    let category = ErrorCategory.UNKNOWN;
    let severity = ErrorSeverity.MEDIUM;
    let retry = true;
    
    const lowerMessage = error.message.toLowerCase();
    
    // Attempt to categorize based on error message patterns
    if (lowerMessage.includes('network') || lowerMessage.includes('fetch') || lowerMessage.includes('connection')) {
      category = ErrorCategory.NETWORK;
      severity = ErrorSeverity.HIGH;
    } else if (lowerMessage.includes('timeout') || lowerMessage.includes('timed out')) {
      category = ErrorCategory.NETWORK;
      severity = ErrorSeverity.MEDIUM;
    } else if (lowerMessage.includes('auth') || lowerMessage.includes('login') || lowerMessage.includes('permission')) {
      category = ErrorCategory.AUTHENTICATION;
      severity = ErrorSeverity.HIGH;
      retry = false;
    } else if (lowerMessage.includes('validate') || lowerMessage.includes('invalid')) {
      category = ErrorCategory.VALIDATION;
      severity = ErrorSeverity.LOW;
    } else if (lowerMessage.includes('server') || lowerMessage.includes('500')) {
      category = ErrorCategory.SERVER;
      severity = ErrorSeverity.HIGH;
    }
    
    return {
      message: error.message,
      severity,
      category,
      timestamp: new Date().toISOString(),
      retry,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
    };
  }

  /**
   * Handle string errors
   */
  private handleStringError(error: string): ErrorResponse {
    return {
      message: error,
      severity: ErrorSeverity.MEDIUM,
      category: ErrorCategory.UNKNOWN,
      timestamp: new Date().toISOString(),
      retry: true
    };
  }

  /**
   * Handle unknown error types
   */
  private handleUnknownError(error: unknown): ErrorResponse {
    return {
      message: 'An unknown error occurred',
      severity: ErrorSeverity.MEDIUM,
      category: ErrorCategory.UNKNOWN,
      timestamp: new Date().toISOString(),
      data: error,
      retry: true
    };
  }

  /**
   * Create appropriate error instance from HTTP status code and response data
   */
  createFromHttpStatus(status: number, message?: string, data?: unknown): BaseError {
    switch (true) {
      case status === 400:
        return new ValidationError(message || 'Bad Request', {}, status, data);
      case status === 401:
        return new AuthenticationError(message || 'Unauthorized', status, data);
      case status === 403:
        return new AuthorizationError(message || 'Forbidden', status, data);
      case status === 404:
        return new NotFoundError(message || 'Not Found', status, data);
      case status === 429:
        return new RateLimitError(message || 'Too Many Requests', undefined, status, data);
      case status >= 500:
        return new ServerError(message || 'Server Error', status, data);
      default:
        return new BaseError(
          message || `HTTP Error ${status}`, 
          ErrorCategory.UNKNOWN, 
          ErrorSeverity.MEDIUM, 
          status, 
          data
        );
    }
  }

  /**
   * Determine if an error should be reported to the monitoring service
   */
  shouldReport(error: ErrorResponse): boolean {
    // Don't report validation errors or 404s in production
    if (process.env.NODE_ENV === 'production') {
      if (error.category === ErrorCategory.VALIDATION) return false;
      if (error.code === 404) return false;
    }
    
    // Always report high and critical severity errors
    if (error.severity === ErrorSeverity.HIGH || error.severity === ErrorSeverity.CRITICAL) {
      return true;
    }
    
    // Report medium severity errors except client validation
    if (error.severity === ErrorSeverity.MEDIUM && error.category !== ErrorCategory.VALIDATION) {
      return true;
    }
    
    // Don't report low severity errors by default
    return false;
  }
}

// Export as singleton for consistent usage throughout the app
export default new ErrorManager();