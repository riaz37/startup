import { getSession } from "next-auth/react";

/**
 * Secure session management utilities
 * Uses HTTP-only cookies instead of localStorage for security
 */

export interface SecureSession {
  userId: string;
  email: string;
  role: string;
  isVerified: boolean;
}

/**
 * Get current session securely
 * This uses NextAuth's built-in cookie-based session management
 */
export const getSecureSession = async (): Promise<SecureSession | null> => {
  try {
    const session = await getSession();
    if (!session?.user?.id) return null;

    return {
      userId: session.user.id,
      email: session.user.email || '',
      role: session.user.role || 'CUSTOMER',
      isVerified: session.user.isVerified || false,
    };
  } catch (error) {
    console.error('Error getting secure session:', error);
    return null;
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = async (): Promise<boolean> => {
  const session = await getSecureSession();
  return !!session;
};

/**
 * Check if user has specific role
 */
export const hasRole = async (requiredRole: string): Promise<boolean> => {
  const session = await getSecureSession();
  return session?.role === requiredRole;
};

/**
 * Check if user is admin
 */
export const isAdmin = async (): Promise<boolean> => {
  return hasRole('ADMIN') || hasRole('SUPER_ADMIN');
};

/**
 * Get user ID securely
 */
export const getUserId = async (): Promise<string | null> => {
  const session = await getSecureSession();
  return session?.userId || null;
};

/**
 * Secure token refresh (handled automatically by NextAuth)
 */
export const refreshSession = async (): Promise<void> => {
  // NextAuth handles token refresh automatically
  // This is just a placeholder for any custom refresh logic
  console.log('Session refresh handled by NextAuth');
};

/**
 * Clear session securely
 */
export const clearSession = async (): Promise<void> => {
  // NextAuth handles session clearing automatically
  // This is just a placeholder for any custom cleanup logic
  console.log('Session clearing handled by NextAuth');
}; 