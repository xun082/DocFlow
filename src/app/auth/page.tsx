'use client';

import React, { useEffect, Suspense } from 'react';
import { Github, Mail } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

import { Button } from '@/components/ui/button';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 获取重定向URL
  const getRedirectUrl = () => {
    const redirectTo = searchParams?.get('redirect_to');

    if (redirectTo) {
      return decodeURIComponent(redirectTo);
    }

    return '/'; // 默认跳转到首页
  };

  // 保存重定向信息到sessionStorage
  useEffect(() => {
    const redirectUrl = getRedirectUrl();

    if (redirectUrl !== '/') {
      sessionStorage.setItem('auth_redirect', redirectUrl);
    }
  }, [searchParams]);

  const handleGitHubLogin = () => {
    const redirectUrl = getRedirectUrl();

    // 构建GitHub授权URL，通过state参数传递重定向信息
    const baseUrl = `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/auth/github`;
    const state = redirectUrl !== '/' ? encodeURIComponent(redirectUrl) : '';

    const authUrl = state ? `${baseUrl}?state=${state}` : baseUrl;

    window.location.href = authUrl;
  };

  const handleEmailLogin = () => {
    router.push('/auth/email');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="w-full max-w-md p-10 space-y-8 bg-white rounded-2xl shadow-xl border border-gray-100">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800">欢迎回来</h1>
          <p className="mt-3 text-gray-600">请登录以继续使用文档系统</p>
        </div>

        <div className="flex flex-col items-center justify-center space-y-6 mt-8">
          <div className="w-full border-t border-gray-100"></div>

          <Button
            variant="default"
            className="w-full flex items-center justify-center py-4 px-4 space-x-3 text-white bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-md"
            onClick={handleGitHubLogin}
          >
            <Github className="mr-2 h-5 w-5" />
            <span className="text-base">使用 GitHub 登录</span>
          </Button>

          <Button
            variant="outline"
            className="w-full flex items-center justify-center py-4 px-4 space-x-3 text-gray-700 hover:text-gray-900 border-gray-200 hover:border-gray-300 rounded-xl transition-all duration-300 transform hover:scale-[1.02]"
            onClick={handleEmailLogin}
          >
            <Mail className="mr-2 h-5 w-5" />
            <span className="text-base">使用邮箱登录</span>
          </Button>

          <p className="text-sm text-gray-500 mt-6">安全登录，保护您的账户隐私</p>
        </div>

        <div className="mt-10 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} 文档系统. 保留所有权利.</p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
          <div className="w-full max-w-md p-10 space-y-8 bg-white rounded-2xl shadow-xl border border-gray-100">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-800">欢迎回来</h1>
              <p className="mt-3 text-gray-600">加载中...</p>
            </div>
          </div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
