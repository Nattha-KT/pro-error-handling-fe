import { ErrorCategory, ErrorSeverity } from '../../types';
import { BaseError } from './BaseError';

/**
 * NetworkError: Represents errors related to network connectivity issues
 */
export class NetworkError extends BaseError {
  constructor(
    message = 'Network connection issue',
    code?: string | number,
    data?: unknown,
    retry = true
  ) {
    super(
      message,
      ErrorCategory.NETWORK,
      ErrorSeverity.HIGH,
      code,
      data,
      retry
    );
  }

  getUserMessage(): string {
    return 'There was a problem connecting to the server. Please check your internet connection and try again.';
  }
}

/**
 * TimeoutError: Specialized network error for timeouts
 */
export class TimeoutError extends NetworkError {
  constructor(
    message = 'Request timed out',
    code?: string | number,
    data?: unknown,
    retry = true
  ) {
    super(message, code, data, retry);
    this.severity = ErrorSeverity.MEDIUM;
  }

  getUserMessage(): string {
    return 'The request is taking longer than expected. Please try again later.';
  }
}