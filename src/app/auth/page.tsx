'use client';

import React, { useEffect, Suspense, useState } from 'react';
import { Github, Mail, Sparkles, Shield, CircleUser, Lock } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

// 邮箱验证码登录
import EmailCodeForm from './email/page';
import EmailPasswordRegisterForm from './email-password/email-password-register-form';
import EmailPasswordLoginForm from './email-password/email-password-login-form';

import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

function LoginContent() {
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

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      {/* Background Effects */}
      <div className="absolute inset-0">
        {/* Main gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-white/10 rounded-full blur-3xl opacity-20">
          <div className="w-full h-full bg-white/10 rounded-full" />
        </div>

        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl opacity-15">
          <div className="w-full h-full bg-white/5 rounded-full" />
        </div>

        <div className="absolute top-1/2 right-1/3 w-80 h-80 bg-white/5 rounded-full blur-3xl opacity-10">
          <div className="w-full h-full bg-white/5 rounded-full" />
        </div>

        {/* Grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[length:60px_60px]" />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 bg-black">
        <div className="w-full max-w-7xl flex items-center justify-center gap-8">
          {/* Left side - Geometric pattern */}
          <div className="hidden lg:flex flex-1 items-center justify-center">
            <div className="relative w-[500px] h-[500px]">
              {/* Animated gradient circle */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-cyan-500/20 rounded-full blur-2xl animate-pulse" />

              {/* Main decorative circle */}
              <div className="absolute inset-8 border-2 border-white/30 rounded-full" />

              {/* Inner circles */}
              <div className="absolute inset-16 border border-white/25 rounded-full" />
              <div className="absolute inset-24 border border-white/20 rounded-full" />

              {/* Decorative arcs */}
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 border-4 border-t-white/40 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"
                style={{ animationDuration: '20s' }}
              />
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-3 border-t-transparent border-r-white/30 border-b-transparent border-l-transparent rounded-full animate-spin"
                style={{ animationDuration: '15s', animationDirection: 'reverse' }}
              />

              {/* Floating dots */}
              <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-white/40 rounded-full animate-pulse" />
              <div
                className="absolute top-1/3 right-1/4 w-2 h-2 bg-white/50 rounded-full animate-pulse"
                style={{ animationDelay: '0.5s' }}
              />
              <div
                className="absolute bottom-1/4 left-1/3 w-4 h-4 bg-white/30 rounded-full animate-pulse"
                style={{ animationDelay: '1s' }}
              />
              <div
                className="absolute bottom-1/3 right-1/3 w-2 h-2 bg-white/60 rounded-full animate-pulse"
                style={{ animationDelay: '1.5s' }}
              />

              {/* Hexagon pattern */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-white/25 rotate-30" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 border border-white/20 rotate-30" />

              {/* Cross lines */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent rotate-45" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent -rotate-45" />

              {/* Corner decorations */}
              <div className="absolute top-8 left-8 w-16 h-16 border-l-2 border-t-2 border-white/30 rounded-tl-2xl" />
              <div className="absolute top-8 right-8 w-16 h-16 border-r-2 border-t-2 border-white/30 rounded-tr-2xl" />
              <div className="absolute bottom-8 left-8 w-16 h-16 border-l-2 border-b-2 border-white/30 rounded-bl-2xl" />
              <div className="absolute bottom-8 right-8 w-16 h-16 border-r-2 border-b-2 border-white/30 rounded-br-2xl" />

              {/* Small decorative elements */}
              <div className="absolute top-1/6 left-1/2 -translate-x-1/2 w-2 h-2 bg-white/50 rounded-full" />
              <div className="absolute bottom-1/6 left-1/2 -translate-x-1/2 w-2 h-2 bg-white/50 rounded-full" />
              <div className="absolute left-1/6 top-1/2 -translate-y-1/2 w-2 h-2 bg-white/50 rounded-full" />
              <div className="absolute right-1/6 top-1/2 -translate-y-1/2 w-2 h-2 bg-white/50 rounded-full" />
            </div>
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
                  <TabsList className="flex w-full rounded-2xl bg-gray-100 p-2 mb-6 border border-black !h-12">
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
                    <EmailPasswordLoginForm />
                  </TabsContent>

                  <TabsContent value="email-register" className="mt-0">
                    <EmailPasswordRegisterForm />
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
