'use client';

import React, { useEffect, Suspense, useState } from 'react';
import { Sparkles, Github } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { redirectManager } from '@/utils/redirect-manager';
import { LoginFormData } from '@/utils/auth-schemas';
import { useAuthForm } from '@/hooks/use-auth-form';
import { InputField } from '@/components/ui/input-field';
import { PasswordLoginForm } from '@/app/auth/_components/forms/password-login-form';
import { EmailCodeLoginForm } from '@/app/auth/_components/forms/email-code-login-form';
import { RegisterForm } from '@/app/auth/_components/forms/register-form';
import { LoginModeSwitcher, LoginMode } from '@/app/auth/_components/login-mode-switcher';
import { AuthBackground } from '@/app/auth/_components/auth-background';
import authApi from '@/services/auth';
import { saveAuthData } from '@/utils';

function LoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loginMode, setLoginMode] = useState<LoginMode>('email');
  const [isLoading, setIsLoading] = useState(false);

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
  } = useAuthForm(loginMode);

  useEffect(() => {
    setMounted(true);
  }, [loginMode]);

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
    const redirectUrl = redirectManager.get(searchParams);
    setIsLoading(true);

    try {
      if (loginMode === 'password') {
        // 密码登录
        if (!data.email || !data.password) {
          toast.error('请输入邮箱和密码');
          setIsLoading(false);

          return;
        }

        const { data: response, error } = await authApi.emailPasswordLogin({
          email: data.email,
          password: data.password,
        });

        if (error) {
          toast.error(error);
          setIsLoading(false);

          return;
        }

        if (!response || response.code !== 200) {
          toast.error(response?.message || '登录失败，请重试');
          setIsLoading(false);

          return;
        }

        const authData = response.data;

        // 保存认证数据
        saveAuthData(authData);
        toast.success('登录成功！');

        // 跳转
        setTimeout(() => {
          router.push(redirectUrl || '/dashboard');
        }, 500);
      } else if (loginMode === 'email') {
        // 验证码登录
        if (!data.email || !data.code) {
          toast.error('请输入邮箱和验证码');
          setIsLoading(false);

          return;
        }

        const { data: response, error } = await authApi.emailCodeLogin({
          email: data.email,
          code: data.code,
        });

        if (error) {
          toast.error(error);
          setIsLoading(false);

          return;
        }

        if (!response || response.code !== 200) {
          toast.error(response?.message || '登录失败，请重试');
          setIsLoading(false);

          return;
        }

        const authData = response.data;

        // 保存认证数据
        saveAuthData(authData);
        toast.success('登录成功！');

        // 跳转
        setTimeout(() => {
          router.push(redirectUrl || '/dashboard');
        }, 500);
      } else {
        // 注册
        if (!data.email || !data.password || !data.confirmPassword) {
          toast.error('请填写完整的注册信息');
          setIsLoading(false);

          return;
        }

        if (data.password !== data.confirmPassword) {
          setError('confirmPassword', {
            type: 'manual',
            message: '两次输入的密码不一致',
          });
          setIsLoading(false);

          return;
        }

        const { data: response, error } = await authApi.emailPasswordRegister({
          email: data.email,
          password: data.password,
          confirmPassword: data.confirmPassword,
        });

        if (error) {
          toast.error(error);
          setIsLoading(false);

          return;
        }

        if (!response || response.code !== 200) {
          toast.error(response?.message || '注册失败，请重试');
          setIsLoading(false);

          return;
        }

        if (response.data?.token) {
          // 注册成功并自动登录
          saveAuthData(response.data);
          toast.success('注册成功，已自动登录！');

          setTimeout(() => {
            router.push(redirectUrl || '/dashboard');
          }, 500);
        } else {
          toast.success('注册成功！请使用邮箱密码登录');
          setIsLoading(false);
        }
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '操作失败，请重试');
      setIsLoading(false);
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
              <h1 className="text-3xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight tracking-tight mb-2 md:mb-2.5 text-gray-900">
                {loginMode === 'register' ? '创建账户' : '欢迎回来'}
              </h1>
              <p className="text-gray-600 text-base md:text-base leading-relaxed font-medium">
                {loginMode === 'register'
                  ? '加入我们，开启您的创作之旅'
                  : '登录您的账户，继续使用 DocFlow 文档系统'}
              </p>
            </div>

            {/* 表单 */}
            <form
              className="space-y-3.5 md:space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit(onSubmit)(e);
              }}
            >
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
                disabled={isLoading}
                className="w-full rounded-xl bg-gray-900 py-3.5 font-bold text-base md:text-base text-white hover:bg-gray-800 active:bg-gray-700 transition-all duration-300 shadow-lg hover:shadow-xl animate-fade-in transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:bg-gray-900 cursor-pointer"
                style={{ animationDelay: '600ms' }}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2 font-semibold">
                    <svg
                      className="animate-spin h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>处理中...</span>
                  </span>
                ) : loginMode === 'register' ? (
                  '创建账户'
                ) : (
                  '登录'
                )}
              </button>
            </form>

            {/* 分隔线 */}
            <div
              className="relative flex items-center justify-center animate-fade-in"
              style={{ animationDelay: '700ms' }}
            >
              <span className="w-full border-t border-gray-200"></span>
              <span className="px-3 text-sm md:text-xs text-gray-500 bg-white absolute font-medium">
                或继续使用
              </span>
            </div>

            {/* GitHub 登录 */}
            <button
              onClick={handleGitHubLogin}
              className="w-full flex items-center justify-center gap-2.5 border border-gray-300 rounded-xl py-3 hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 animate-fade-in text-base shadow-sm"
              style={{ animationDelay: '800ms' }}
            >
              <Github className="w-5 h-5" />
              <span className="font-semibold text-gray-900">使用 GitHub 登录</span>
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
              <h1 className="text-3xl font-bold mb-3 text-gray-900 tracking-tight">欢迎回来</h1>
              <p className="text-base text-gray-600 font-medium">加载中...</p>
            </div>
          </div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
