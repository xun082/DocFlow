import { NextRequest, NextResponse } from 'next/server';

import { ROUTES } from '@/utils/constants/navigation';

/**
 * 检查token是否有效（非空且非无效值）
 */
function isValidToken(token: string | undefined): boolean {
  return !!(token && token !== 'undefined' && token !== 'null' && token.length > 0);
}

/**
 * 清除所有认证相关的cookies
 */
function clearAuthCookies(response: NextResponse): void {
  const authCookies = [
    'auth_token',
    'refresh_token',
    'expires_in',
    'refresh_expires_in',
    'auth_timestamp',
  ];

  authCookies.forEach((cookieName) => {
    response.cookies.delete(cookieName);
  });
}

/**
 * 重定向到登录页，并保存原始URL
 */
function redirectToAuth(request: NextRequest, clearCookies = false): NextResponse {
  const { pathname, search } = request.nextUrl;
  const redirectPath = pathname + search;

  const loginUrl = new URL(ROUTES.AUTH, request.url);

  if (redirectPath && redirectPath !== ROUTES.AUTH) {
    loginUrl.searchParams.set('redirect_to', encodeURIComponent(redirectPath));
  }

  const response = NextResponse.redirect(loginUrl);

  // 如果需要清除cookies
  if (clearCookies) {
    clearAuthCookies(response);
  }

  return response;
}

/**
 * 检查token是否过期
 */
function isTokenExpired(timestamp: string | undefined, expiresIn: string | undefined): boolean {
  if (!timestamp) return false;

  const authTime = parseInt(timestamp);
  const now = Date.now();
  const expiryMs = expiresIn ? parseInt(expiresIn) * 1000 : 7 * 24 * 60 * 60 * 1000; // 默认7天

  return now - authTime > expiryMs;
}

export function proxy(request: NextRequest) {
  // 从cookie获取token和相关信息
  const token = request.cookies.get('auth_token')?.value;
  const timestamp = request.cookies.get('auth_timestamp')?.value;
  const expiresIn = request.cookies.get('expires_in')?.value;

  // 检查token是否存在且有效
  if (!isValidToken(token)) {
    console.log('[Middleware] No valid token found, redirecting to auth');

    return redirectToAuth(request);
  }

  // 检查token是否过期
  if (isTokenExpired(timestamp, expiresIn)) {
    console.log('[Middleware] Token expired, redirecting to auth');

    return redirectToAuth(request, true);
  }

  // Token有效，继续请求
  return NextResponse.next();
}

// 配置哪些路径需要进行验证
export const config = {
  matcher: [
    '/docs/:path*', // 文档页面需要登录
    '/dashboard/:path*', // 控制台页面需要登录
  ],
};
