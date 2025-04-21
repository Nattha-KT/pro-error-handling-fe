import { ErrorCategory, ErrorSeverity } from '../../types';
import { BaseError } from './BaseError';

/**
 * ServerError: Represents server-side failures (5xx status codes)
 */
export class ServerError extends BaseError {
  constructor(
    message = 'Server error occurred',
    code?: string | number,
    data?: unknown,
    retry = true
  ) {
    super(
      message,
      ErrorCategory.SERVER,
      ErrorSeverity.HIGH,
      code,
      data,
      retry
    );
  }

  getUserMessage(): string {
    return 'An unexpected server error occurred. Our team has been notified.';
  }
}

/**
 * NotFoundError: Represents 404 Not Found responses
 */
export class NotFoundError extends BaseError {
  constructor(
    message = 'Resource not found',
    code?: string | number,
    data?: unknown,
    retry = false
  ) {
    super(
      message,
      ErrorCategory.SERVER,
      ErrorSeverity.MEDIUM,
      code || 404,
      data,
      retry
    );
  }

  getUserMessage(): string {
    return 'The requested resource was not found.';
  }
}

/**
 * RateLimitError: Represents rate limiting responses
 */
export class RateLimitError extends BaseError {
  retryAfter?: number;

  constructor(
    message = 'Rate limit exceeded',
    retryAfter?: number,
    code?: string | number,
    data?: unknown
  ) {
    super(
      message,
      ErrorCategory.SERVER,
      ErrorSeverity.MEDIUM,
      code || 429,
      data,
      true
    );
    
    this.retryAfter = retryAfter;
  }

  getUserMessage(): string {
    return this.retryAfter 
      ? `Request limit reached. Please try again in ${this.retryAfter} seconds.`
      : 'Request limit reached. Please try again later.';
  }
}