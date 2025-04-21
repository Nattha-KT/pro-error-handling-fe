import { ErrorCategory, ErrorSeverity } from '../../types';
import { BaseError } from './BaseError';

/**
 * ValidationError: Represents client-side or server-side validation failures
 */
export class ValidationError extends BaseError {
  fieldErrors: Record<string, string[]>;

  constructor(
    message = 'Validation failed',
    fieldErrors: Record<string, string[]> = {},
    code?: string | number,
    data?: unknown,
    retry = true
  ) {
    super(
      message,
      ErrorCategory.VALIDATION,
      ErrorSeverity.MEDIUM,
      code,
      data,
      retry
    );
    
    this.fieldErrors = fieldErrors;
  }

  getUserMessage(): string {
    // If there are specific field errors, use those for the message
    if (Object.keys(this.fieldErrors).length > 0) {
      const firstField = Object.keys(this.fieldErrors)[0];
      const firstError = this.fieldErrors[firstField][0];
      return firstError || this.message;
    }
    
    return 'Please review the form for errors and try again.';
  }

  /**
   * Get all validation error messages combined
   */
  getAllMessages(): string[] {
    const messages: string[] = [];
    
    Object.keys(this.fieldErrors).forEach(field => {
      this.fieldErrors[field].forEach(error => {
        messages.push(`${field}: ${error}`);
      });
    });
    
    return messages.length > 0 ? messages : [this.message];
  }

  /**
   * Check if a specific field has errors
   */
  hasFieldError(fieldName: string): boolean {
    return Boolean(this.fieldErrors[fieldName]?.length);
  }

  /**
   * Get errors for a specific field
   */
  getFieldErrors(fieldName: string): string[] {
    return this.fieldErrors[fieldName] || [];
  }
}