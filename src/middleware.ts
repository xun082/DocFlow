import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // 从cookie获取token
  const token = request.cookies.get('auth_token')?.value;

  // 如果没有token，重定向到登录页
  if (!token) {
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  try {
    console.log('===DEBUG MIDDLEWARE===', { path: request.nextUrl.pathname, hasToken: !!token });

    // 验证token
    return NextResponse.next();
  } catch (error) {
    // 出错时重定向到登录页
    console.error('Token verification error:', error);

    return NextResponse.redirect(new URL('/auth', request.url));
  }
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
  matcher: ['/docs/:path*'],
};
