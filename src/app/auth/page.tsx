'use client';

import React, { useEffect, Suspense, useState } from 'react';
import { Github, Mail, Sparkles, Shield, CircleUser, Lock } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

// 邮箱验证码登录
import EmailCodeForm from './_components/EmailCodeForm';
import EmailRegisterForm from './_components/EmailRegisterForm';
import EmailLoginForm from './_components/EmailLoginForm';
import AuthDecoration from './_components/AuthDecoration';

import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

/**
 * 重定向工具
 */
const redirectManager = {
  get: (searchParams: ReturnType<typeof useSearchParams>) => {
    const redirectTo = searchParams?.get('redirect_to');

    return redirectTo ? decodeURIComponent(redirectTo) : '/dashboard';
  },
  save: (url: string) => {
    if (typeof window === 'undefined' || url === '/dashboard') return;

    try {
      sessionStorage.setItem('auth_redirect', url);
    } catch {
      // 静默处理存储错误
    }
  },
};

function LoginContent() {
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 保存重定向 URL
  useEffect(() => {
    if (!mounted) return;

    const redirectUrl = redirectManager.get(searchParams);
    redirectManager.save(redirectUrl);
  }, [searchParams, mounted]);

  const handleGitHubLogin = () => {
    if (!mounted) return;

    const redirectUrl = redirectManager.get(searchParams);
    const baseUrl = `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/auth/github`;

    // 仅在需要时添加 state 参数
    const authUrl =
      redirectUrl !== '/dashboard'
        ? `${baseUrl}?state=${encodeURIComponent(redirectUrl)}`
        : baseUrl;

    window.location.href = authUrl;
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 bg-black">
        <div className="w-full">
          <div className="flex flex-col lg:flex-row items-center justify-around lg:gap-16">
            {/* Left side - Geometric pattern decoration */}
            <div className="hidden lg:block w-[500px] h-[500px] relative">
              <AuthDecoration />
            </div>

            {/* Right side - Login card */}
            <div className="w-full max-w-xl">
              {/* Main login card */}
              <div className="relative group">
                {/* Glowing border effect */}
                <div className="absolute -inset-1 rounded-3xl blur opacity-20 bg-white" />

                <div className="relative bg-white backdrop-blur-xl rounded-3xl p-10 shadow-2xl border border-black hover:shadow-3xl hover:border-black hover:-translate-y-1 transition-all duration-500">
                  {/* Header */}
                  <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold text-black mb-3">欢迎回来</h1>

                    <p className="text-lg text-gray-600 font-light">请登录以继续使用文档系统</p>
                  </div>

                  {/* Tab Navigation */}
                  <Tabs defaultValue="github" className="w-full">
                    <TabsList className="flex w-full rounded-2xl bg-gray-100 p-2 mb-6 border border-black  !h-12">
                      <TabsTrigger
                        value="github"
                        className="flex-1 flex items-center justify-center space-x-2 py-2.5 px-2 rounded-xl text-sm font-medium transition-all duration-300 data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:shadow-lg text-gray-600 hover:text-black hover:bg-gray-200"
                      >
                        <Github className="w-4 h-4" />
                        <span>GitHub</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="email"
                        className="flex-1 flex items-center justify-center space-x-2 py-2.5 px-2 rounded-xl text-sm font-medium transition-all duration-300 data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:shadow-lg text-gray-600 hover:text-black hover:bg-gray-200"
                      >
                        <Mail className="w-4 h-4" />
                        <span>邮箱登录</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="email-password"
                        className="flex-1 flex items-center justify-center space-x-2 py-2.5 px-2 rounded-xl text-sm font-medium transition-all duration-300 data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:shadow-lg text-gray-600 hover:text-black hover:bg-gray-200"
                      >
                        <Lock className="w-4 h-4" />
                        <span>密码登录</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="email-register"
                        className="flex-1 flex items-center justify-center space-x-2 py-2.5 px-2 rounded-xl text-sm font-medium transition-all duration-300 data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:shadow-lg text-gray-600 hover:text-black hover:bg-gray-200"
                      >
                        <CircleUser className="w-4 h-4" />
                        <span>用户注册</span>
                      </TabsTrigger>
                    </TabsList>

                    {/* Tab Content */}
                    <TabsContent value="github" className="mt-0">
                      <div className="space-y-4">
                        <div className="relative group">
                          <div className="absolute -inset-1 bg-black rounded-2xl blur opacity-30"></div>
                          <Button
                            variant="default"
                            className="relative w-full bg-black hover:bg-gray-800 text-white border-0 rounded-2xl py-6 px-6 text-lg font-semibold shadow-xl cursor-pointer"
                            onClick={handleGitHubLogin}
                          >
                            <div className="relative flex items-center justify-center space-x-3">
                              <Github className="w-6 h-6" />
                              <span>使用 GitHub 登录</span>
                            </div>
                          </Button>
                        </div>
                        <p className="text-xs text-center text-gray-600">
                          GitHub 登录可能受网络环境影响
                        </p>
                      </div>
                    </TabsContent>

                    <TabsContent value="email" className="mt-0">
                      <EmailCodeForm />
                    </TabsContent>

                    <TabsContent value="email-password" className="mt-0">
                      <EmailLoginForm />
                    </TabsContent>

                    <TabsContent value="email-register" className="mt-0">
                      <EmailRegisterForm />
                    </TabsContent>
                  </Tabs>

                  {/* Login tips */}
                  <div className="mt-6 text-center">
                    <div className="relative flex flex-col items-center space-y-3 text-sm bg-gray-100 backdrop-blur-sm rounded-xl p-5 border border-black shadow-lg">
                      <div className="flex items-center space-x-2">
                        <div className="p-1.5 bg-black/10 rounded-lg">
                          <Shield className="w-4 h-4 text-gray-600" />
                        </div>
                        <span className="font-medium text-black">安全提示</span>
                      </div>
                      <p className="text-xs text-center leading-relaxed text-gray-600 max-w-xs">
                        我们支持多种登录方式，请选择最适合您的方式。如有问题，请联系管理员。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen relative overflow-hidden bg-black">
          {/* Background Effects - matching homepage */}
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-white/10 rounded-full blur-3xl opacity-60" />
            <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl opacity-50" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[length:60px_60px]" />
          </div>

          <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-lg">
              <div className="relative group">
                <div className="absolute -inset-1 rounded-3xl blur opacity-20 bg-white" />
                <div className="relative bg-white backdrop-blur-xl rounded-3xl p-10 shadow-2xl border border-black">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-2xl mb-6 shadow-lg">
                      <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-black mb-3">欢迎回来</h1>
                    <p className="text-lg text-gray-600 font-light">加载中...</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
