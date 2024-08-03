// Environment Variables
export const NodeEnvironment = {
  DEVELOPMENT: 'development',
  STAGING: 'staging',
  PRODUCTION: 'production',
  TESTING: 'testing',
} as const;

// Models Names
export const RECORDS_MODEL_NAME = 'records';

// Channels Names
export const PROCESSABLE_RECORDS_CHANNEL_NAME = 'processable-records';
export const PROCESSED_RECORDS_CHANNEL_NAME = 'processed-records';
