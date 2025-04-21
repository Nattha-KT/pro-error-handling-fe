/**
 * Core type definitions for the application
 */

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Error categories for classification
export enum ErrorCategory {
  NETWORK = 'network',
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  SERVER = 'server',
  CLIENT = 'client',
  UNKNOWN = 'unknown'
}

// Standard error response structure
export interface ErrorResponse {
  message: string;
  severity: ErrorSeverity;
  category: ErrorCategory;
  code?: string | number;
  timestamp: string;
  data?: unknown;
  retry?: boolean;
  stack?: string;
}

// User data structure
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

// API Response wrapper
export interface ApiResponse<T> {
  data?: T;
  error?: ErrorResponse;
  status: number;
}

// Feature Flag definition
export interface FeatureFlag {
  name: string;
  enabled: boolean;
  description: string;
  controlGroup?: string;
}

// Feature Flag Map
export interface FeatureFlagMap {
  [key: string]: FeatureFlag;
}