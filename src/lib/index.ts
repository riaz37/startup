// Main exports for the lib directory
export * from './auth';
export * from './cache';
export * from './database';
export * from './email';
export * from './payment';
export * from './websocket';

// API exports (with explicit re-exports to avoid conflicts)
export { handleApiError as handleApiClientError } from './api';
export { handleApiError as handleApiUtilsError } from './utils';

export * from './services'; 