import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 从cookie获取token
  const token = request.cookies.get('auth_token')?.value;

  // 如果没有token，重定向到登录页
  if (!token) {
    // 保存原始URL到登录页的查询参数中
    const loginUrl = new URL('/auth', request.url);
    loginUrl.searchParams.set('redirect_to', encodeURIComponent(pathname + request.nextUrl.search));

    return NextResponse.redirect(loginUrl);
  }

  // 可以在这里添加更多的token验证逻辑
  // 比如检查token是否过期等

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
