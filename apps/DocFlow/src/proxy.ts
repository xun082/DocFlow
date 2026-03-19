import { NextRequest, NextResponse } from 'next/server';

import { ROUTES } from '@/utils/constants/routes';

// ============================================================================
// Constants
// ============================================================================

const AUTH_COOKIES = {
  TOKEN: 'auth_token',
  EXPIRES_IN: 'expires_in',
  TIMESTAMP: 'auth_timestamp',
} as const;

const DEFAULT_TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;

const INVALID_TOKEN_VALUES = new Set(['undefined', 'null', '']);

/**
 * Public routes that never require authentication.
 * Proxy will always allow access to these paths.
 */
const PUBLIC_ROUTES = new Set([ROUTES.AUTH, '/auth/callback', '/', '/blog', '/share']);

// ============================================================================
// Type Definitions
// ============================================================================

interface AuthCookies {
  token?: string;
  timestamp?: string;
  expiresIn?: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

function isValidToken(token: string | undefined): token is string {
  if (!token || INVALID_TOKEN_VALUES.has(token)) return false;

  return token.trim().length > 0;
}

function clearAuthCookies(response: NextResponse): void {
  Object.values(AUTH_COOKIES).forEach((name) => response.cookies.delete(name));
}

function extractAuthCookies(request: NextRequest): AuthCookies {
  return {
    token: request.cookies.get(AUTH_COOKIES.TOKEN)?.value,
    timestamp: request.cookies.get(AUTH_COOKIES.TIMESTAMP)?.value,
    expiresIn: request.cookies.get(AUTH_COOKIES.EXPIRES_IN)?.value,
  };
}

function isTokenExpired({ timestamp, expiresIn }: AuthCookies): boolean {
  if (!timestamp) return false;

  const authTime = Number(timestamp);
  if (Number.isNaN(authTime)) return true;

  const expiryMs = expiresIn ? Number(expiresIn) * 1000 : DEFAULT_TOKEN_EXPIRY_MS;

  return Date.now() - authTime > expiryMs;
}

/**
 * Check if a pathname is a public route (no auth required).
 * Handles exact matches and prefix matches (e.g. /blog/123, /share/abc).
 */
function isPublicRoute(pathname: string): boolean {
  if (PUBLIC_ROUTES.has(pathname)) return true;

  return (
    pathname.startsWith('/blog/') || pathname.startsWith('/share/') || pathname.startsWith('/auth/')
  );
}

/**
 * Redirect to the auth page.
 * Only sets redirect_to for protected routes — never for public routes,
 * which would otherwise cause an infinite redirect loop.
 */
function buildAuthRedirect(
  request: NextRequest,
  options: { clearCookies?: boolean } = {},
): NextResponse {
  const { pathname, search } = request.nextUrl;
  const authUrl = new URL(ROUTES.AUTH, request.url);

  if (!isPublicRoute(pathname)) {
    // Let URLSearchParams handle encoding — avoid double-encoding (%252F)
    authUrl.searchParams.set('redirect_to', pathname + search);
  }

  const response = NextResponse.redirect(authUrl);

  if (options.clearCookies) {
    clearAuthCookies(response);
  }

  return response;
}

// ============================================================================
// Proxy (Next.js 16+)
// ============================================================================

export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  // Always allow public routes through — no token check needed
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  const authCookies = extractAuthCookies(request);

  if (!isValidToken(authCookies.token)) {
    return buildAuthRedirect(request);
  }

  if (isTokenExpired(authCookies)) {
    return buildAuthRedirect(request, { clearCookies: true });
  }

  return NextResponse.next();
}

// ============================================================================
// Proxy Configuration
// ============================================================================

export const config = {
  matcher: [
    /*
     * Only run on protected routes. Public routes excluded:
     * - Homepage: /
     * - Auth: /auth, /auth/callback
     * - Public content: /blog/*, /share/*
     * - Next.js internals: /_next/*, /api/*
     */
    '/docs/:path*',
    '/dashboard/:path*',
    '/chat-ai/:path*',
    '/rooms/:path*',
  ],
};
