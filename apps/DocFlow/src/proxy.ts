import { NextRequest, NextResponse } from 'next/server';

import { ROUTES } from '@/utils/constants/routes';

// ============================================================================
// Constants
// ============================================================================

/**
 * 认证相关的 Cookie 键名
 */
const AUTH_COOKIES = {
  TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  EXPIRES_IN: 'expires_in',
  REFRESH_EXPIRES_IN: 'refresh_expires_in',
  TIMESTAMP: 'auth_timestamp',
} as const;

/**
 * 默认的 token 过期时间（7天，单位：毫秒）
 */
const DEFAULT_TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * 无效的 token 字符串值
 */
const INVALID_TOKEN_VALUES = new Set(['undefined', 'null', '']);

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

/**
 * 检查 token 是否有效（非空且非无效值）
 */
function isValidToken(token: string | undefined): token is string {
  if (!token || INVALID_TOKEN_VALUES.has(token)) {
    return false;
  }

  return token.trim().length > 0;
}

/**
 * 清除所有认证相关的 cookies
 */
function clearAuthCookies(response: NextResponse): void {
  Object.values(AUTH_COOKIES).forEach((cookieName) => {
    response.cookies.delete(cookieName);
  });
}

/**
 * 从请求中提取认证相关的 cookies
 */
function extractAuthCookies(request: NextRequest): AuthCookies {
  return {
    token: request.cookies.get(AUTH_COOKIES.TOKEN)?.value,
    timestamp: request.cookies.get(AUTH_COOKIES.TIMESTAMP)?.value,
    expiresIn: request.cookies.get(AUTH_COOKIES.EXPIRES_IN)?.value,
  };
}

/**
 * 构建带有重定向参数的认证 URL
 */
function buildAuthUrl(request: NextRequest): URL {
  const { pathname, search } = request.nextUrl;
  const redirectPath = pathname + search;

  const authUrl = new URL(ROUTES.AUTH, request.url);

  if (redirectPath && redirectPath !== ROUTES.AUTH) {
    authUrl.searchParams.set('redirect_to', encodeURIComponent(redirectPath));
  }

  return authUrl;
}

/**
 * 重定向到认证页面
 */
function redirectToAuth(
  request: NextRequest,
  options: { clearCookies?: boolean; reason?: string } = {},
): NextResponse {
  const { clearCookies = false, reason } = options;

  const authUrl = buildAuthUrl(request);
  const response = NextResponse.redirect(authUrl);

  if (clearCookies) {
    clearAuthCookies(response);
  }

  if (reason && process.env.NODE_ENV === 'development') {
    console.log(`[Middleware] Redirecting to auth: ${reason}`);
  }

  return response;
}

/**
 * 检查 token 是否过期
 */
function isTokenExpired(authCookies: AuthCookies): boolean {
  const { timestamp, expiresIn } = authCookies;

  if (!timestamp) {
    return false;
  }

  const authTime = Number(timestamp);

  if (Number.isNaN(authTime)) {
    return true;
  }

  const now = Date.now();
  const expiryMs = expiresIn ? Number(expiresIn) * 1000 : DEFAULT_TOKEN_EXPIRY_MS;

  return now - authTime > expiryMs;
}

// ============================================================================
// Main Middleware
// ============================================================================

/**
 * 认证中间件
 * 验证用户的 token，未登录或 token 过期时重定向到登录页
 */
export function proxy(request: NextRequest): NextResponse {
  const authCookies = extractAuthCookies(request);

  // 验证 token 存在性和有效性
  if (!isValidToken(authCookies.token)) {
    return redirectToAuth(request, {
      reason: 'No valid token found',
    });
  }

  // 验证 token 是否过期
  if (isTokenExpired(authCookies)) {
    return redirectToAuth(request, {
      clearCookies: true,
      reason: 'Token expired',
    });
  }

  // Token 有效，放行请求
  return NextResponse.next();
}

// ============================================================================
// Middleware Configuration
// ============================================================================

/**
 * 配置需要认证保护的路径
 */
export const config = {
  matcher: [
    '/docs/:path*', // 文档页面
    '/dashboard/:path*', // 控制台页面
    '/chat-ai/:path*', // AI 聊天页面
  ],
};
