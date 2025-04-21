import { FeatureFlag, FeatureFlagMap } from '../types';

/**
 * Feature Flag Management
 * Mock implementation to demonstrate feature flag based error handling
 */

// Define all available feature flags
const featureFlags: FeatureFlagMap = {
  ENABLE_ERROR_STACK_TRACES: {
    name: 'ENABLE_ERROR_STACK_TRACES',
    enabled: process.env.NODE_ENV !== 'production',
    description: 'Show detailed stack traces in error messages'
  },
  USE_NEW_ERROR_HANDLING: {
    name: 'USE_NEW_ERROR_HANDLING',
    enabled: true,
    description: 'Use the new error handling system instead of legacy'
  },
  ENABLE_ERROR_BOUNDARIES: {
    name: 'ENABLE_ERROR_BOUNDARIES',
    enabled: true,
    description: 'Enable React error boundaries for component errors'
  },
  ENABLE_AUTOMATIC_RETRY: {
    name: 'ENABLE_AUTOMATIC_RETRY',
    enabled: true,
    description: 'Automatically retry failed network requests',
    controlGroup: 'networking'
  },
  ENABLE_DETAILED_VALIDATION_ERRORS: {
    name: 'ENABLE_DETAILED_VALIDATION_ERRORS',
    enabled: true,
    description: 'Show detailed validation errors instead of generic messages',
    controlGroup: 'forms'
  },
  ENABLE_ERROR_REPORTING: {
    name: 'ENABLE_ERROR_REPORTING',
    enabled: true,
    description: 'Report errors to monitoring service',
    controlGroup: 'monitoring'
  }
};

/**
 * Check if a feature flag is enabled
 */
export const isFeatureEnabled = (flagName: string): boolean => {
  const flag = featureFlags[flagName];
  return flag?.enabled === true;
};

/**
 * Get a feature flag's full configuration
 */
export const getFeatureFlag = (flagName: string): FeatureFlag | undefined => {
  return featureFlags[flagName];
};

/**
 * Get all feature flags
 */
export const getAllFeatureFlags = (): FeatureFlagMap => {
  return { ...featureFlags };
};

/**
 * Update a feature flag (for demo purposes)
 */
export const updateFeatureFlag = (flagName: string, enabled: boolean): void => {
  if (featureFlags[flagName]) {
    featureFlags[flagName].enabled = enabled;
  }
};

/**
 * Register a new feature flag (for demo purposes)
 */
export const registerFeatureFlag = (flag: FeatureFlag): void => {
  featureFlags[flag.name] = flag;
};

/**
 * Higher-order function to conditionally execute code based on feature flag
 */
export const withFeatureFlag = <T>(
  flagName: string, 
  enabledFn: () => T, 
  disabledFn?: () => T
): T => {
  if (isFeatureEnabled(flagName)) {
    return enabledFn();
  }
  return disabledFn ? disabledFn() : (undefined as unknown as T);
};