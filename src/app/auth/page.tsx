'use client';

import React, { useEffect, Suspense, useState } from 'react';
import { Sparkles, Github } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

import { useEmailLogin, useEmailPasswordLogin, useEmailPasswordRegister } from '@/hooks/useAuth';
import { redirectManager } from '@/utils/redirect-manager';
import { LoginFormData } from '@/utils/auth-schemas';
import { useAuthForm } from '@/hooks/use-auth-form';
import { InputField } from '@/components/ui/input-field';
import { PasswordLoginForm } from '@/app/auth/_components/forms/password-login-form';
import { EmailCodeLoginForm } from '@/app/auth/_components/forms/email-code-login-form';
import { RegisterForm } from '@/app/auth/_components/forms/register-form';
import { LoginModeSwitcher, LoginMode } from '@/app/auth/_components/login-mode-switcher';
import { AuthBackground } from '@/app/auth/_components/auth-background';

function LoginContent() {
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [loginMode, setLoginMode] = useState<LoginMode>('email'); // 默认使用验证码

  // 使用登录 hooks
  const emailLoginMutation = useEmailLogin();
  const passwordLoginMutation = useEmailPasswordLogin();
  const registerMutation = useEmailPasswordRegister();

  // 使用表单 hook
  const {
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    countdown,
    isSendingCode,
    handleSendCode,
    register,
    handleSubmit,
    errors,
    setError,
    getSchema,
  } = useAuthForm(loginMode);

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
    const authUrl =
      redirectUrl !== '/dashboard'
        ? `${baseUrl}?state=${encodeURIComponent(redirectUrl)}`
        : baseUrl;
    window.location.href = authUrl;
  };

  const onSubmit = async (data: LoginFormData) => {
    const schema = getSchema();
    const result = schema.safeParse(data);

    if (!result.success) {
      result.error.errors.forEach((error) => {
        const path = error.path[0] as keyof LoginFormData;
        setError(path, {
          type: 'manual',
          message: error.message,
        });
      });

      return;
    }

    const redirectUrl = redirectManager.get(searchParams);

    if (loginMode === 'password') {
      passwordLoginMutation.mutate({ email: data.email, password: data.password!, redirectUrl });
    } else if (loginMode === 'email') {
      emailLoginMutation.mutate({ email: data.email, code: data.code!, redirectUrl });
    } else {
      registerMutation.mutate({
        email: data.email,
        password: data.password!,
        confirmPassword: data.confirmPassword!,
        redirectUrl,
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans bg-white">
      {/* 左侧：登录表单 */}
      <section className="flex-1 flex items-center justify-center px-4 py-8 sm:p-6 md:p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="flex flex-col gap-5 md:gap-7">
            {/* 标题 */}
            <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight mb-1.5 md:mb-2.5 text-gray-900">
                {loginMode === 'register' ? '创建账户' : '欢迎回来'}
              </h1>
              <p className="text-gray-600 text-sm md:text-base">
                {loginMode === 'register'
                  ? '加入我们，开启您的创作之旅'
                  : '登录您的账户，继续使用 DocFlow 文档系统'}
              </p>
            </div>

            {/* 表单 */}
            <form className="space-y-3.5 md:space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <div className="animate-fade-in" style={{ animationDelay: '300ms' }}>
                <InputField
                  label="邮箱地址"
                  name="email"
                  type="email"
                  placeholder="请输入您的邮箱地址"
                  register={register}
                  error={errors.email?.message}
                />
              </div>

              {/* 密码登录表单 */}
              <PasswordLoginForm
                isActive={loginMode === 'password'}
                showPassword={showPassword}
                onTogglePassword={() => setShowPassword(!showPassword)}
                register={register}
                errors={errors}
              />

              {/* 邮箱验证码表单 */}
              <EmailCodeLoginForm
                isActive={loginMode === 'email'}
                countdown={countdown}
                isSending={isSendingCode}
                onSendCode={handleSendCode}
                register={register}
                errors={errors}
              />

              {/* 注册表单 */}
              <RegisterForm
                isActive={loginMode === 'register'}
                showPassword={showPassword}
                showConfirmPassword={showConfirmPassword}
                onTogglePassword={() => setShowPassword(!showPassword)}
                onToggleConfirmPassword={() => setShowConfirmPassword(!showConfirmPassword)}
                register={register}
                errors={errors}
              />

              {/* 提交按钮 */}
              <button
                type="submit"
                className="w-full rounded-xl bg-gray-900 py-3 font-semibold text-base text-white hover:bg-gray-800 active:bg-gray-700 transition-all duration-300 shadow-lg hover:shadow-xl animate-fade-in transform hover:scale-[1.02]"
                style={{ animationDelay: '600ms' }}
              >
                {loginMode === 'register' ? '创建账户' : '登录'}
              </button>
            </form>

            {/* 分隔线 */}
            <div
              className="relative flex items-center justify-center animate-fade-in"
              style={{ animationDelay: '700ms' }}
            >
              <span className="w-full border-t border-gray-200"></span>
              <span className="px-3 text-xs text-gray-500 bg-white absolute">或继续使用</span>
            </div>

            {/* GitHub 登录 */}
            <button
              onClick={handleGitHubLogin}
              className="w-full flex items-center justify-center gap-2.5 border border-gray-300 rounded-xl py-3 hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 animate-fade-in text-base shadow-sm"
              style={{ animationDelay: '800ms' }}
            >
              <Github className="w-5 h-5" />
              <span className="font-medium text-gray-900">使用 GitHub 登录</span>
            </button>

            {/* 登录模式切换 - 底部显示 */}
            <LoginModeSwitcher currentMode={loginMode} onModeChange={setLoginMode} />
          </div>
        </div>
      </section>

      {/* 右侧：背景图片 + 评价 */}
      <AuthBackground />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col md:flex-row font-sans bg-white">
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Sparkles className="w-12 h-12 animate-pulse mx-auto mb-4 text-violet-500" />
              <h1 className="text-2xl font-bold mb-2 text-gray-900">欢迎回来</h1>
              <p className="text-gray-600">加载中...</p>
            </div>
          </div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
