import { ErrorCategory, ErrorSeverity } from '../../types';

/**
 * BaseError: Foundation for all custom error classes
 * Extends the native Error class with additional properties for better error handling
 */
export class BaseError extends Error {
  category: ErrorCategory;
  severity: ErrorSeverity;
  timestamp: string;
  code?: string | number;
  data?: unknown;
  retry?: boolean;

  constructor(
    message: string, 
    category: ErrorCategory = ErrorCategory.UNKNOWN,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    code?: string | number,
    data?: unknown,
    retry = false
  ) {
    super(message);
    
    // Set error name to the constructor name for better error identification
    this.name = this.constructor.name;
    
    // Set custom properties
    this.category = category;
    this.severity = severity;
    this.timestamp = new Date().toISOString();
    this.code = code;
    this.data = data;
    this.retry = retry;
    
    // Maintains proper stack trace for where error was thrown (V8 only)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Format the error for display to users
   */
  getUserMessage(): string {
    // Default implementation, can be overridden by child classes
    return this.message;
  }

  /**
   * Format the error for logging
   */
  getLogMessage(): string {
    return JSON.stringify({
      name: this.name,
      message: this.message,
      category: this.category,
      severity: this.severity,
      code: this.code,
      timestamp: this.timestamp,
      stack: this.stack,
    }, null, 2);
  }

  /**
   * Checks if the error can be retried
   */
  canRetry(): boolean {
    return this.retry === true;
  }
}