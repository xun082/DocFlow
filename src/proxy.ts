import { NextRequest, NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // 从cookie获取token
  const token = request.cookies.get('auth_token')?.value;
  const timestamp = request.cookies.get('auth_timestamp')?.value;

  // 检查token是否存在且有效
  if (!token || token === 'undefined' || token === 'null' || token.length === 0) {
    console.log('[Middleware] No valid token found, redirecting to /auth');

    // 保存原始URL到登录页的查询参数中
    const loginUrl = new URL('/auth', request.url);
    const redirectPath = pathname + search;
    loginUrl.searchParams.set('redirect_to', encodeURIComponent(redirectPath));

    return NextResponse.redirect(loginUrl);
  }

  // 检查token是否过期（简单的时间戳检查）
  if (timestamp) {
    const authTime = parseInt(timestamp);
    const now = Date.now();
    const expiresIn = request.cookies.get('expires_in')?.value;
    const expiryMs = expiresIn ? parseInt(expiresIn) * 1000 : 7 * 24 * 60 * 60 * 1000; // 默认7天

    if (now - authTime > expiryMs) {
      console.log('[Middleware] Token expired, redirecting to /auth');

      const loginUrl = new URL('/auth', request.url);
      const redirectPath = pathname + search;
      loginUrl.searchParams.set('redirect_to', encodeURIComponent(redirectPath));

      // 创建响应并清除过期的cookies
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete('auth_token');
      response.cookies.delete('refresh_token');
      response.cookies.delete('expires_in');
      response.cookies.delete('refresh_expires_in');
      response.cookies.delete('auth_timestamp');

      return response;
    }
  }

  // Token有效，继续请求
  return NextResponse.next();
}

// async function verifyToken(token: string, request: NextRequest) {
//   try {
//     // 调用后端接口校验token
//     const response = await fetch('https://your-backend.com/api/auth/verify', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         Authorization: `Bearer ${token}`,
//       },
//     });

//     if (response.ok) {
//       // token有效，继续请求
//       return NextResponse.next();
//     } else {
//       // token无效，重定向到登录页
//       return NextResponse.redirect(new URL('/auth', request.url));
//     }
//   } catch (error) {
//     // 请求失败，重定向到登录页
//     console.error('Error verifying token:', error);

//     return NextResponse.redirect(new URL('/auth', request.url));
//   }
// }

// 配置哪些路径需要进行验证
export const config = {
  matcher: [
    '/docs/:path*', // 文档页面需要登录
    '/dashboard/:path*', // 控制台页面需要登录
  ],
};
