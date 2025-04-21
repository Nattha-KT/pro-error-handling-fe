/* eslint-disable @typescript-eslint/no-explicit-any */
import { ErrorResponse } from '../types';

/**
 * Simulated error monitoring/logging service
 * In a real application, this would integrate with tools like Sentry, LogRocket, or a custom backend
 */

interface LogContext {
  [key: string]: any;
}

/**
 * Log an error to the monitoring service
 */
export const logErrorToMonitoring = (
  error: ErrorResponse,
  context: LogContext = {}
): void => {
  // In a real app, this would send the error to a service like Sentry
  console.log('[ERROR MONITORING]', {
    error,
    context,
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    sessionId: 'simulated-session-id',
    url: window.location.href,
    userAgent: navigator.userAgent
  });
  
  // Simulate successful logging
  console.log('✅ Error successfully logged to monitoring service');
  
  // In development, output to console for visibility
  if (process.env.NODE_ENV !== 'production') {
    console.group('📊 Error details:');
    console.log('Message:', error.message);
    console.log('Category:', error.category);
    console.log('Severity:', error.severity);
    console.log('Code:', error.code);
    if (error.stack) console.log('Stack:', error.stack);
    console.groupEnd();
  }
};

/**
 * Log user activity for context on errors
 */
export const logUserActivity = (
  action: string,
  data: Record<string, any> = {}
): void => {
  // In a real app, this would track user actions for error context
  console.log('[USER ACTIVITY]', {
    action,
    data,
    timestamp: new Date().toISOString()
  });
};

/**
 * Record breadcrumbs for error context
 */
export const addBreadcrumb = (
  message: string,
  category = 'user',
  level = 'info'
): void => {
  // In a real app, this would add breadcrumbs to error reporting
  console.log('[BREADCRUMB]', {
    message,
    category,
    level,
    timestamp: new Date().toISOString()
  });
};

/**
 * Set user context for error reporting
 */
export const setUserContext = (
  userId?: string,
  attributes: Record<string, any> = {}
): void => {
  // In a real app, this would set user context for error reporting
  console.log('[USER CONTEXT]', {
    userId,
    attributes,
    timestamp: new Date().toISOString()
  });
};