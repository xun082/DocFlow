'use client';

import React, { useEffect, Suspense, useState } from 'react';
import { Github, Mail, Sparkles, Shield, CircleUser, Lock, Zap } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

// 邮箱验证码登录
import EmailCodeForm from './_components/EmailCodeForm';
import EmailRegisterForm from './_components/EmailRegisterForm';
import EmailLoginForm from './_components/EmailLoginForm';
import AuthDecoration from './_components/AuthDecoration';

import { Button } from '@/components/ui/button';

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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loginMode, setLoginMode] = useState<'email' | 'password' | 'github' | 'register'>('email');

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

  const loginModes = [
    { id: 'github' as const, label: 'GitHub', icon: Github },
    { id: 'email' as const, label: '邮箱验证码', icon: Mail },
    { id: 'password' as const, label: '密码登录', icon: Lock },
    { id: 'register' as const, label: '用户注册', icon: CircleUser },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-white">
      {/* Sidebar - with toggle animation */}
      <div
        className={`fixed left-0 top-0 bottom-0 z-20 bg-gradient-to-br from-slate-950 via-slate-900 to-black transition-all duration-500 ${
          sidebarOpen ? 'w-80' : 'w-0 lg:w-80'
        }`}
      >
        <div
          className={`h-full ${sidebarOpen ? 'opacity-100' : 'opacity-0 lg:opacity-100'} transition-opacity duration-500`}
        >
          {/* Background effects */}
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute top-3/4 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-700" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.01)_1px,transparent_1px)] bg-[length:40px_40px]" />
          </div>

          {/* Sidebar content */}
          <div className="relative z-10 h-full flex flex-col p-8">
            {/* Close button for mobile */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden absolute top-6 right-6 p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-300 text-white backdrop-blur-sm"
              aria-label="Close sidebar"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Logo and title */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-2xl mb-4 shadow-lg">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">DocFlow</h2>
              <p className="text-gray-400 text-sm">智能文档协作平台</p>
            </div>

            {/* Login mode navigation */}
            <nav className="flex-1">
              <div className="space-y-2">
                {loginModes.map((mode) => {
                  const Icon = mode.icon;
                  const isActive = loginMode === mode.id;

                  return (
                    <button
                      key={mode.id}
                      onClick={() => {
                        setLoginMode(mode.id);
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                        isActive
                          ? 'bg-white text-gray-900 shadow-lg'
                          : 'text-gray-400 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span className="font-medium">{mode.label}</span>
                    </button>
                  );
                })}
              </div>
            </nav>

            {/* Footer decoration */}
            <div className="mt-auto pt-8">
              <div className="w-full h-32 opacity-30">
                <AuthDecoration />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="min-h-screen transition-all duration-500 lg:ml-80">
        {/* Mobile menu button - floating (only show when sidebar is closed) */}
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden fixed top-4 left-4 z-30 p-3 rounded-xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200"
            aria-label="Open menu"
          >
            <svg
              className="w-6 h-6 text-gray-900"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        )}

        {/* Login form - centered */}
        <div className="min-h-screen flex items-center justify-center px-4 py-6">
          <div className="w-full max-w-md">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-3">
                欢迎回来
              </h1>
              <p className="text-gray-600">请登录以继续使用文档系统</p>
            </div>

            {/* Dynamic content based on login mode */}
            <div className="space-y-6">
              {loginMode === 'github' && (
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
                  <div className="relative group/btn">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-2xl blur opacity-30 group-hover/btn:opacity-50 transition duration-300" />
                    <Button
                      variant="default"
                      className="relative w-full bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 hover:from-gray-800 hover:via-gray-700 hover:to-gray-800 text-white border-0 rounded-2xl py-6 px-6 text-base font-semibold shadow-xl cursor-pointer transform hover:scale-[1.02] transition-all duration-300"
                      onClick={handleGitHubLogin}
                    >
                      <div className="relative flex items-center justify-center space-x-3">
                        <Github className="w-5 h-5" />
                        <span>使用 GitHub 登录</span>
                      </div>
                    </Button>
                  </div>
                  <p className="text-xs text-center text-gray-500 bg-gray-50 rounded-lg py-2 px-3">
                    GitHub 登录可能受网络环境影响
                  </p>
                </div>
              )}

              {loginMode === 'email' && <EmailCodeForm />}

              {loginMode === 'password' && <EmailLoginForm />}

              {loginMode === 'register' && <EmailRegisterForm />}
            </div>

            {/* Login tips */}
            <div className="mt-8">
              <div className="relative flex flex-col items-center space-y-2.5 text-sm bg-blue-50 rounded-2xl p-4 border border-blue-100">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-blue-100 rounded-lg">
                    <Shield className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  <span className="font-semibold text-blue-600 text-xs">安全提示</span>
                </div>
                <p className="text-xs text-center leading-relaxed text-gray-600">
                  我们支持多种登录方式，请选择最适合您的方式。如有问题，请联系管理员。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[15] lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen relative overflow-hidden bg-white">
          {/* Sidebar placeholder */}
          <div className="fixed left-0 top-0 bottom-0 w-80 bg-gradient-to-br from-slate-950 via-slate-900 to-black hidden lg:block">
            <div className="absolute inset-0">
              <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
              <div className="absolute top-3/4 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.01)_1px,transparent_1px)] bg-[length:40px_40px]" />
            </div>
          </div>

          {/* Main content */}
          <div className="lg:ml-80 min-h-screen flex items-center justify-center px-4 py-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-2xl mb-4 shadow-lg shadow-purple-500/30">
                <Sparkles className="w-8 h-8 text-white animate-pulse" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-2">
                欢迎回来
              </h1>
              <p className="text-sm text-gray-600">加载中...</p>
            </div>
          </div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
