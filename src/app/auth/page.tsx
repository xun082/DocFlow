'use client';

import React, { useEffect, Suspense, useState, Activity } from 'react';
import { Sparkles, Eye, EyeOff, Github, Mail, Lock, CircleUser } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useEmailLogin, useEmailPasswordLogin, useEmailPasswordRegister } from '@/hooks/useAuth';
import authApi from '@/services/auth';

// --- Zod Schemas ---
const passwordLoginSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(6, '密码长度至少为6位'),
});

const emailCodeLoginSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  code: z.string().length(6, '验证码必须为6位数字').regex(/^\d+$/, '验证码只能包含数字'),
});

const registerSchema = z
  .object({
    email: z.string().email('请输入有效的邮箱地址'),
    password: z.string().min(6, '密码长度至少为6位'),
    confirmPassword: z.string().min(6, '密码长度至少为6位'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '两次输入的密码不一致',
    path: ['confirmPassword'],
  });

type LoginFormData = {
  email: string;
  password?: string;
  code?: string;
  confirmPassword?: string;
};

interface Testimonial {
  avatarSrc: string;
  name: string;
  handle: string;
  text: string;
}

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

// --- UI Components ---
const InputWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-xl border border-gray-200 bg-gray-50/50 transition-all duration-300 focus-within:border-violet-400 focus-within:bg-white focus-within:shadow-lg focus-within:shadow-violet-500/20">
    {children}
  </div>
);

interface InputFieldProps {
  label: string;
  name: string;
  type?: string;
  placeholder: string;
  maxLength?: number;
  showPasswordToggle?: boolean;
  showPassword?: boolean;
  onTogglePassword?: () => void;
  register?: any;
  error?: string;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  name,
  type = 'text',
  placeholder,
  maxLength,
  showPasswordToggle = false,
  showPassword = false,
  onTogglePassword,
  register,
  error,
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-900 mb-1.5">{label}</label>
    <InputWrapper>
      <div className="relative">
        <input
          {...(register ? register(name) : {})}
          type={showPasswordToggle ? (showPassword ? 'text' : 'password') : type}
          placeholder={placeholder}
          maxLength={maxLength}
          className="w-full bg-transparent text-base px-3.5 py-3 rounded-xl focus:outline-none text-gray-900 placeholder:text-gray-500 pr-12"
        />
        {showPasswordToggle && (
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute inset-y-0 right-3 flex items-center"
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5 text-gray-500 hover:text-gray-700 transition-colors" />
            ) : (
              <Eye className="w-5 h-5 text-gray-500 hover:text-gray-700 transition-colors" />
            )}
          </button>
        )}
      </div>
    </InputWrapper>
    {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
  </div>
);

interface CodeInputProps {
  countdown: number;
  isSending: boolean;
  onSendCode: () => void;
  register?: any;
  error?: string;
}

const CodeInput: React.FC<CodeInputProps> = ({
  countdown,
  isSending,
  onSendCode,
  register,
  error,
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-900 mb-1.5">验证码</label>
    <div className="flex gap-2.5">
      <div className="flex-1">
        <InputWrapper>
          <input
            {...(register ? register('code') : {})}
            type="text"
            placeholder="6位数字验证码"
            maxLength={6}
            className="w-full bg-transparent text-base px-3.5 py-3 rounded-xl focus:outline-none text-gray-900 placeholder:text-gray-500"
          />
        </InputWrapper>
      </div>
      <button
        type="button"
        onClick={onSendCode}
        disabled={countdown > 0 || isSending}
        className="flex-shrink-0 w-[140px] sm:w-[150px] px-4 py-3 rounded-xl border-2 border-gray-300 bg-white hover:bg-gray-50 hover:border-violet-400 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed text-sm font-medium text-gray-900 shadow-sm disabled:hover:bg-white disabled:hover:border-gray-300 text-center"
      >
        {isSending ? '发送中...' : countdown > 0 ? `${countdown}秒` : '获取验证码'}
      </button>
    </div>
    {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
  </div>
);

const TestimonialCard = ({ testimonial, delay }: { testimonial: Testimonial; delay: string }) => (
  <div
    className="flex items-start gap-3 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/10 p-5 w-64 animate-fade-in"
    style={{ animationDelay: delay }}
  >
    <img src={testimonial.avatarSrc} className="h-10 w-10 object-cover rounded-2xl" alt="avatar" />
    <div className="text-sm leading-snug">
      <p className="font-medium text-white">{testimonial.name}</p>
      <p className="text-white/60">{testimonial.handle}</p>
      <p className="mt-1 text-white/80">{testimonial.text}</p>
    </div>
  </div>
);

// 评价数据
const testimonials: Testimonial[] = [
  {
    avatarSrc: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    name: '张小雨',
    handle: '@zhangxiaoyu',
    text: '非常棒的平台！用户体验流畅，功能恰到好处，完全满足我的需求。',
  },
  {
    avatarSrc: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus',
    name: '李明',
    handle: '@liming',
    text: '这个服务彻底改变了我的工作方式。设计简洁，功能强大，支持也很到位。',
  },
];

function LoginContent() {
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [loginMode, setLoginMode] = useState<'password' | 'email' | 'register'>('email'); // 默认使用验证码
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isSendingCode, setIsSendingCode] = useState(false);

  // 使用登录 hooks
  const emailLoginMutation = useEmailLogin();
  const passwordLoginMutation = useEmailPasswordLogin();
  const registerMutation = useEmailPasswordRegister();

  // 使用 react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    getValues,
    setError,
    clearErrors,
  } = useForm<LoginFormData>({
    mode: 'onBlur',
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // 保存重定向 URL
  useEffect(() => {
    if (!mounted) return;

    const redirectUrl = redirectManager.get(searchParams);
    redirectManager.save(redirectUrl);
  }, [searchParams, mounted]);

  // 当 loginMode 改变时重置表单和错误
  useEffect(() => {
    reset();
    clearErrors();
  }, [loginMode, reset, clearErrors]);

  // 验证码倒计时
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);

      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendCode = async () => {
    const email = getValues('email');

    if (!email) {
      toast.error('请先输入邮箱地址');

      return;
    }

    const emailSchema = z.string().email();
    const emailValidation = emailSchema.safeParse(email);

    if (!emailValidation.success) {
      toast.error('请输入有效的邮箱地址');

      return;
    }

    setIsSendingCode(true);

    const { data, error } = await authApi.sendEmailCode(email);

    setIsSendingCode(false);

    if (error) {
      toast.error(error);

      return;
    }

    if (!data || data.code !== 200) {
      toast.error(data?.message || '发送验证码失败');

      return;
    }

    toast.success('验证码已发送', {
      description: '请查收您的邮箱，验证码有效期为10分钟',
    });

    setCountdown(60);
  };

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
    let schema;

    switch (loginMode) {
      case 'password':
        schema = passwordLoginSchema;
        break;
      case 'email':
        schema = emailCodeLoginSchema;
        break;
      case 'register':
        schema = registerSchema;
        break;
      default:
        schema = emailCodeLoginSchema;
    }

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

  const loginModes = [
    { id: 'password' as const, label: '密码登录', shortLabel: '密码', icon: Lock },
    { id: 'email' as const, label: '邮箱验证码', shortLabel: '验证码', icon: Mail },
    { id: 'register' as const, label: '用户注册', shortLabel: '注册', icon: CircleUser },
  ];

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
              <Activity mode={loginMode === 'password' ? 'visible' : 'hidden'}>
                <div className="animate-fade-in" style={{ animationDelay: '400ms' }}>
                  <InputField
                    label="密码"
                    name="password"
                    placeholder="请输入您的密码"
                    showPasswordToggle
                    showPassword={showPassword}
                    onTogglePassword={() => setShowPassword(!showPassword)}
                    register={register}
                    error={errors.password?.message}
                  />
                </div>

                <div
                  className="flex items-center justify-between text-xs sm:text-sm animate-fade-in"
                  style={{ animationDelay: '500ms' }}
                >
                  <label className="flex items-center gap-1.5 sm:gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      name="rememberMe"
                      className="w-4 h-4 rounded border-gray-300 text-violet-500 focus:ring-2 focus:ring-violet-500 cursor-pointer"
                    />
                    <span className="text-gray-700 group-hover:text-gray-900 transition-colors">
                      保持登录
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => toast.info('密码重置功能开发中')}
                    className="text-violet-600 hover:text-violet-700 transition-colors hover:underline"
                  >
                    忘记密码？
                  </button>
                </div>
              </Activity>

              {/* 邮箱验证码表单 */}
              <Activity mode={loginMode === 'email' ? 'visible' : 'hidden'}>
                <div className="animate-fade-in" style={{ animationDelay: '400ms' }}>
                  <CodeInput
                    countdown={countdown}
                    isSending={isSendingCode}
                    onSendCode={handleSendCode}
                    register={register}
                    error={errors.code?.message}
                  />
                </div>
              </Activity>

              {/* 注册表单 */}
              <Activity mode={loginMode === 'register' ? 'visible' : 'hidden'}>
                <div className="animate-fade-in" style={{ animationDelay: '400ms' }}>
                  <InputField
                    label="密码"
                    name="password"
                    placeholder="请输入您的密码"
                    showPasswordToggle
                    showPassword={showPassword}
                    onTogglePassword={() => setShowPassword(!showPassword)}
                    register={register}
                    error={errors.password?.message}
                  />
                </div>

                <div className="animate-fade-in" style={{ animationDelay: '450ms' }}>
                  <InputField
                    label="确认密码"
                    name="confirmPassword"
                    placeholder="请再次输入您的密码"
                    showPasswordToggle
                    showPassword={showConfirmPassword}
                    onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
                    register={register}
                    error={errors.confirmPassword?.message}
                  />
                </div>
              </Activity>

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
            <div className="animate-fade-in" style={{ animationDelay: '900ms' }}>
              <div className="flex gap-2">
                {loginModes
                  .filter((mode) => mode.id !== loginMode)
                  .map((mode) => {
                    const Icon = mode.icon;

                    return (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => setLoginMode(mode.id)}
                        className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-300 border border-gray-300 bg-white hover:bg-gray-50 hover:border-gray-400 text-gray-900 shadow-sm"
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <span>{mode.label}</span>
                      </button>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 右侧：背景图片 + 评价 */}
      <section className="hidden md:block flex-1 relative p-4">
        <div
          className="absolute inset-4 rounded-3xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 animate-fade-in"
          style={{
            animationDelay: '300ms',
            backgroundImage: `url(https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500/30 via-purple-500/30 to-pink-500/30 backdrop-blur-sm" />
        </div>

        {testimonials.length > 0 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 px-8 w-full justify-center">
            <TestimonialCard testimonial={testimonials[0]} delay="1000ms" />
            {testimonials[1] && (
              <div className="hidden xl:flex">
                <TestimonialCard testimonial={testimonials[1]} delay="1200ms" />
              </div>
            )}
          </div>
        )}
      </section>
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
