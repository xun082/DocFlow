'use client';

import React, { useEffect, Suspense, useState } from 'react';
import { Github, Mail, Sparkles, Shield, Star, CircleUser, Lock } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

// 邮箱验证吗登录
import EmailCodeForm from './email/page';
import EmailPasswordRegisterForm from './email-password/email-password-register-form';
import EmailPasswordLoginForm from './email-password/email-password-login-form';

import { Button } from '@/components/ui/button';

function LoginContent() {
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'github' | 'email' | 'email-password' | 'email-register'
  >('github');

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
      {/* Background Effects - matching homepage */}
      <div className="absolute inset-0">
        {/* Main gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-to-r from-violet-500/20 to-purple-500/20 rounded-full blur-3xl opacity-20">
          <div className="w-full h-full bg-gradient-to-r from-violet-500/20 to-purple-500/20 rounded-full" />
        </div>

        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl opacity-15">
          <div className="w-full h-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full" />
        </div>

        <div className="absolute top-1/2 right-1/3 w-80 h-80 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl opacity-10">
          <div className="w-full h-full bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full" />
        </div>

        {/* Grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[length:60px_60px]" />
      </div>

      {/* Floating star elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              left: `${10 + i * 12}%`,
              top: '100%',
            }}
          >
            <Star className="w-3 h-3 text-white/20" />
          </div>
        ))}
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-xl">
          {/* Main login card */}
          <div className="relative group">
            {/* Glowing border effect */}
            <div className="absolute -inset-1 rounded-3xl blur opacity-20 bg-gradient-to-r from-violet-500 to-purple-500" />

            <div className="relative bg-white/5 backdrop-blur-xl rounded-3xl p-10 shadow-2xl border border-white/10 hover:shadow-3xl hover:border-white/15 hover:-translate-y-1 transition-all duration-500">
              {/* Header */}
              <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-violet-500 to-purple-500 rounded-2xl mb-6 shadow-lg cursor-pointer">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>

                <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-violet-200 to-purple-200 bg-clip-text text-transparent mb-3">
                  欢迎回来
                </h1>

                <p className="text-lg text-gray-300 font-light">请登录以继续使用文档系统</p>
              </div>

              {/* Tab Navigation */}
              <div className="flex rounded-2xl bg-white/5 p-1 mb-6 border border-white/10">
                <button
                  onClick={() => setActiveTab('github')}
                  className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-300 ${
                    activeTab === 'github'
                      ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Github className="w-4 h-4" />
                  <span>GitHub</span>
                </button>
                <button
                  onClick={() => setActiveTab('email')}
                  className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-300 ${
                    activeTab === 'email'
                      ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Mail className="w-4 h-4" />
                  <span>邮箱登录</span>
                </button>
                <button
                  onClick={() => setActiveTab('email-password')}
                  className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-300 ${
                    activeTab === 'email-password'
                      ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Lock className="w-4 h-4" />
                  <span>密码登录</span>
                </button>

                <button
                  onClick={() => setActiveTab('email-register')}
                  className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-300 ${
                    activeTab === 'email-register'
                      ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <CircleUser className="w-4 h-4" />
                  <span>邮箱注册</span>
                </button>
              </div>

              {/* Tab Content */}
              <div className="min-h-[200px]">
                {activeTab === 'github' && (
                  <div className="space-y-4">
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 via-purple-600 to-violet-600 rounded-2xl blur opacity-30"></div>
                      <Button
                        variant="default"
                        className="relative w-full bg-gradient-to-r from-violet-600 via-purple-600 to-violet-600 hover:from-violet-500 hover:via-purple-500 hover:to-violet-500 text-white border-0 rounded-2xl py-6 px-6 text-lg font-semibold shadow-xl cursor-pointer"
                        onClick={handleGitHubLogin}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                        <div className="relative flex items-center justify-center space-x-3">
                          <Github className="w-6 h-6" />
                          <span>使用 GitHub 登录</span>
                        </div>
                      </Button>
                    </div>
                    <p className="text-xs text-center text-gray-400">
                      GitHub 登录可能受网络环境影响
                    </p>
                  </div>
                )}

                {activeTab === 'email' && <EmailCodeForm />}

                {activeTab === 'email-password' && <EmailPasswordLoginForm />}

                {activeTab === 'email-register' && <EmailPasswordRegisterForm />}
              </div>

              {/* Login tips */}
              <div className="mt-6 text-center">
                <div className="relative flex flex-col items-center space-y-3 text-sm bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10 shadow-lg">
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 bg-blue-500/20 rounded-lg">
                      <Shield className="w-4 h-4 text-blue-400" />
                    </div>
                    <span className="font-medium text-gray-300">安全提示</span>
                  </div>
                  <p className="text-xs text-center leading-relaxed text-gray-400 max-w-xs">
                    我们支持多种登录方式，请选择最适合您的方式。如有问题，请联系管理员。
                  </p>
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
            <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-to-r from-violet-500/20 to-purple-500/20 rounded-full blur-3xl opacity-60" />
            <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl opacity-50" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[length:60px_60px]" />
          </div>

          <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-lg">
              <div className="relative group">
                <div className="absolute -inset-1 rounded-3xl blur opacity-20 bg-gradient-to-r from-violet-500 to-purple-500" />
                <div className="relative bg-white/5 backdrop-blur-xl rounded-3xl p-10 shadow-2xl border border-white/10">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-violet-500 to-purple-500 rounded-2xl mb-6 shadow-lg">
                      <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-violet-200 to-purple-200 bg-clip-text text-transparent mb-3">
                      欢迎回来
                    </h1>
                    <p className="text-lg text-gray-300 font-light">加载中...</p>
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
