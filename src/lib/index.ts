// Main exports for the lib directory
export * from './auth';
export * from './database';
// export * from './email'; // Server-only, don't export to client
// export * from './payment'; // Server-only, don't export to client
// export * from './websocket'; // Server-only, don't export to client

// API exports (with explicit re-exports to avoid conflicts)
export { handleApiError as handleApiClientError } from './api';
export { handleApiError as handleApiUtilsError } from './utils';

// Export services (these are client-safe)
export * from './services';

// Export email management service and types
export { emailManagementService } from './services/email-management-service';
export type { 
  BulkEmailRequest,
  BulkEmailResult,
  UserPreview
} from './services/email-management-service'; 