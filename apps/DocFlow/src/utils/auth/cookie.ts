/**
 * Cookie management utilities for authentication and general storage
 */

/**
 * Set a cookie with specified name, value, and expiration
 * @param name - Cookie name
 * @param value - Cookie value
 * @param days - Expiration in days (default: 7)
 */
export function setCookie(name: string, value: string, days: number = 7): void {
  if (typeof document === 'undefined') return;

  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  const isSecure = window.location.protocol === 'https:';
  const secureFlag = isSecure ? '; Secure' : '';

  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax${secureFlag}`;
}

/**
 * Get a cookie value by name
 * @param name - Cookie name
 * @returns Cookie value or null if not found
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);

  if (parts.length === 2) {
    const cookieValue = parts.pop()?.split(';').shift();

    return cookieValue ? decodeURIComponent(cookieValue) : null;
  }

  return null;
}

/**
 * Remove a cookie by name
 * @param name - Cookie name
 */
export function removeCookie(name: string): void {
  setCookie(name, '', -1);
}

/**
 * Authentication data interface
 */
export interface AuthData {
  token: string;
  refresh_token?: string;
  expires_in?: number;
  refresh_expires_in?: number;
}

/**
 * Save authentication data to cookies
 * @param authData - Authentication data object
 */
export function saveAuthData(authData: AuthData): void {
  if (typeof window === 'undefined') return;

  const expiryDays = authData.expires_in ? Math.ceil(authData.expires_in / 86400) : 7;

  if (authData.token) {
    setCookie('auth_token', authData.token, expiryDays);
  }

  if (authData.refresh_token) {
    const refreshExpiryDays = authData.refresh_expires_in
      ? Math.ceil(authData.refresh_expires_in / 86400)
      : 30;
    setCookie('refresh_token', authData.refresh_token, refreshExpiryDays);
  }

  if (authData.expires_in) {
    setCookie('expires_in', authData.expires_in.toString(), expiryDays);
  }

  if (authData.refresh_expires_in) {
    setCookie('refresh_expires_in', authData.refresh_expires_in.toString(), expiryDays);
  }

  setCookie('auth_timestamp', Date.now().toString(), expiryDays);
}

/**
 * Get authentication token from cookies
 * @returns Token string or null if not found
 */
export function getAuthToken(): string | null {
  return getCookie('auth_token');
}

/**
 * Check if a valid authentication token exists
 * @returns True if valid token exists
 */
export function hasValidAuthToken(): boolean {
  const token = getAuthToken();

  return !!(token && token.length > 0 && token !== 'undefined' && token !== 'null');
}

/**
 * Clear all authentication data from cookies
 */
export function clearAuthData(): void {
  removeCookie('auth_token');
  removeCookie('refresh_token');
  removeCookie('expires_in');
  removeCookie('refresh_expires_in');
  removeCookie('auth_timestamp');
}
