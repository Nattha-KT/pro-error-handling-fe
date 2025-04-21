import { ErrorCategory, ErrorSeverity } from '../../types';
import { BaseError } from './BaseError';

/**
 * AuthenticationError: Represents authentication failures
 */
export class AuthenticationError extends BaseError {
  constructor(
    message = 'Authentication failed',
    code?: string | number,
    data?: unknown,
    retry = true
  ) {
    super(
      message,
      ErrorCategory.AUTHENTICATION,
      ErrorSeverity.HIGH,
      code,
      data,
      retry
    );
  }

  getUserMessage(): string {
    return 'Authentication failed. Please check your credentials and try again.';
  }
}

/**
 * AuthorizationError: Represents permission/access related failures
 */
export class AuthorizationError extends BaseError {
  constructor(
    message = 'Not authorized',
    code?: string | number,
    data?: unknown,
    retry = false
  ) {
    super(
      message,
      ErrorCategory.AUTHORIZATION,
      ErrorSeverity.HIGH,
      code,
      data,
      retry
    );
  }

  getUserMessage(): string {
    return 'You do not have permission to access this resource.';
  }
}

/**
 * SessionExpiredError: Represents expired user session
 */
export class SessionExpiredError extends AuthenticationError {
  constructor(
    message = 'Session expired',
    code?: string | number,
    data?: unknown
  ) {
    super(message, code, data, true);
  }

  getUserMessage(): string {
    return 'Your session has expired. Please log in again.';
  }
}