'use client';

import React, { useEffect, Suspense, useState } from 'react';
import { Github, Mail } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

import { Button } from '@/components/ui/button';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);

  // 确保组件在客户端挂载后再处理重定向逻辑
  useEffect(() => {
    setMounted(true);
  }, []);

  // 获取重定向URL
  const getRedirectUrl = () => {
    if (!mounted) return '/'; // 未挂载时返回默认值

    const redirectTo = searchParams?.get('redirect_to');

    if (redirectTo) {
      return decodeURIComponent(redirectTo);
    }

    return '/'; // 默认跳转到首页
  };

  // 保存重定向信息到sessionStorage
  useEffect(() => {
    if (!mounted) return; // 确保在客户端执行

    const redirectUrl = getRedirectUrl();

    if (redirectUrl !== '/') {
      try {
        sessionStorage.setItem('auth_redirect', redirectUrl);
      } catch (error) {
        // 静默处理sessionStorage错误（如隐私模式）
        console.warn('Failed to save redirect URL to sessionStorage:', error);
      }
    }
  }, [searchParams, mounted]);

  const handleGitHubLogin = () => {
    if (!mounted) return; // 确保在客户端执行

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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-gray-100 bg-white p-10 shadow-xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800">欢迎回来</h1>
          <p className="mt-3 text-gray-600">请登录以继续使用文档系统</p>
        </div>

        <div className="mt-8 flex flex-col items-center justify-center space-y-6">
          <div className="w-full border-t border-gray-100"></div>

          <Button
            variant="default"
            className="flex w-full transform items-center justify-center space-x-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-4 text-white shadow-md transition-all duration-300 hover:scale-[1.02] hover:from-blue-600 hover:to-indigo-600"
            onClick={handleGitHubLogin}
          >
            <Github className="mr-2 h-5 w-5" />
            <span className="text-base">使用 GitHub 登录</span>
          </Button>

          <Button
            variant="outline"
            className="flex w-full transform items-center justify-center space-x-3 rounded-xl border-gray-200 px-4 py-4 text-gray-700 transition-all duration-300 hover:scale-[1.02] hover:border-gray-300 hover:text-gray-900"
            onClick={handleEmailLogin}
          >
            <Mail className="mr-2 h-5 w-5" />
            <span className="text-base">使用邮箱登录</span>
          </Button>

          <p className="mt-6 text-sm text-gray-500">安全登录，保护您的账户隐私</p>
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
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
          <div className="w-full max-w-md space-y-8 rounded-2xl border border-gray-100 bg-white p-10 shadow-xl">
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
