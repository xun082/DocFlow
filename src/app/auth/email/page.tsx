'use client';

import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { Mail, AlertCircle, CheckCircle, Shield, ArrowLeft, Star, Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import authApi from '@/services/auth';
import { ErrorHandler } from '@/services/request';
import { useEmailLogin } from '@/hooks/useAuth';

// 验证码长度配置
const CODE_LENGTH = 6;

// 表单验证 schema
const emailLoginSchema = z.object({
  email: z.string().min(1, '请输入邮箱地址').email('请输入有效的邮箱地址').max(100, '邮箱地址过长'),
  code: z
    .string()
    .min(1, '请输入验证码')
    .length(CODE_LENGTH, `验证码必须是${CODE_LENGTH}位数字`)
    .regex(/^\d+$/, '验证码只能包含数字'),
});

type EmailLoginFormData = z.infer<typeof emailLoginSchema>;

function EmailLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailLoginMutation = useEmailLogin();
  const [countdown, setCountdown] = useState(0);
  const [isSendingCode, setIsSendingCode] = useState(false);

  // 使用 ref 保存定时器 ID，避免内存泄漏
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 获取重定向地址
  const getRedirectUrl = useCallback(() => {
    const redirectTo = searchParams?.get('redirect_to');

    if (redirectTo) {
      try {
        return decodeURIComponent(redirectTo);
      } catch {
        return '/dashboard';
      }
    }

    return '/dashboard';
  }, [searchParams]);

  // 使用 react-hook-form + zod
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
    trigger,
    setValue,
  } = useForm<EmailLoginFormData>({
    resolver: zodResolver(emailLoginSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      code: '',
    },
  });

  const watchedEmail = watch('email');

  // 清理定时器的函数
  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // 组件卸载时清理定时器
  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  const errorHandler: ErrorHandler = {
    onError: (error) => {
      console.error('请求错误:', error);
      toast.error('请求失败，请稍后重试');
    },

    forbidden: () => {
      toast.error('验证码错误或已失效');
    },
    serverError: () => {
      toast.error('服务器错误，请稍后再试');
    },
    networkError: () => {
      toast.error('网络连接失败，请检查网络');
    },
    default: () => {
      toast.error('未知错误');
    },
  };

  // 开始倒计时
  const startCountdown = useCallback(() => {
    clearTimer(); // 清理之前的定时器
    setCountdown(60);

    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearTimer();

          return 0;
        }

        return prev - 1;
      });
    }, 1000);
  }, [clearTimer]);

  // 发送验证码
  const handleSendCode = async () => {
    // 先验证邮箱字段
    const emailValid = await trigger('email');

    if (!emailValid || !watchedEmail) {
      return;
    }

    // 防止重复提交
    if (isSendingCode || countdown > 0) {
      return;
    }

    setIsSendingCode(true);

    const { data, error } = await authApi.sendEmailCode(watchedEmail, errorHandler);

    if (error) {
      console.error('发送验证码失败:', error);
      setIsSendingCode(false);

      return;
    }

    if (data && data.code === 200) {
      toast.success('验证码已发送', {
        description: `验证码已发送到 ${watchedEmail}，请查收`,
      });
      startCountdown();
    } else {
      toast.error(data?.message || '发送验证码失败');
    }

    setIsSendingCode(false);
  };

  // 处理登录提交
  const onSubmit = async (data: EmailLoginFormData) => {
    // 防止重复提交
    if (emailLoginMutation.isPending) {
      return;
    }

    console.log('开始登录请求:', { email: data.email, code: data.code });

    // 使用 React Query mutation
    emailLoginMutation.mutate(
      { email: data.email, code: data.code, redirectUrl: getRedirectUrl() },
      {
        onSuccess: () => {
          // 清理定时器
          clearTimer();
        },
        onError: (error) => {
          console.error('登录失败:', error);
          // 错误处理已在 useEmailLogin hook 中处理
        },
      },
    );
  };

  // 处理验证码输入变化（只允许数字）
  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, CODE_LENGTH);
    setValue('code', value, { shouldValidate: true });
  };

  // 检查发送验证码按钮是否应该禁用
  const isSendCodeDisabled = !watchedEmail || !!errors.email || isSendingCode || countdown > 0;

  // 检查登录按钮是否应该禁用
  const isLoginDisabled = !isValid || emailLoginMutation.isPending;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="min-h-screen relative overflow-hidden bg-black"
    >
      {/* Background Effects - matching main login page */}
      <div className="absolute inset-0">
        {/* Main gradient orbs */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.2 }}
          transition={{ duration: 2, delay: 0.2 }}
          className="absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-to-r from-violet-500/20 to-purple-500/20 rounded-full blur-3xl"
        >
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
              repeatType: 'reverse',
            }}
            className="w-full h-full bg-gradient-to-r from-violet-500/20 to-purple-500/20 rounded-full"
          />
        </motion.div>

        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.15 }}
          transition={{ duration: 2, delay: 0.6 }}
          className="absolute top-3/4 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl"
        >
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'easeInOut',
              repeatType: 'reverse',
              delay: 2,
            }}
            className="w-full h-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full"
          />
        </motion.div>

        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.1 }}
          transition={{ duration: 2, delay: 1 }}
          className="absolute top-1/2 right-1/3 w-80 h-80 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl"
        >
          <motion.div
            animate={{
              scale: [1, 1.25, 1],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: 'easeInOut',
              repeatType: 'reverse',
              delay: 1,
            }}
            className="w-full h-full bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full"
          />
        </motion.div>

        {/* Grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[length:60px_60px]" />
      </div>

      {/* Floating star elements */}
      <motion.div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: [0, 1, 0], y: -100 }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              delay: i * 1.5,
              ease: 'linear',
            }}
            className="absolute"
            style={{
              left: `${15 + i * 15}%`,
              top: '100%',
            }}
          >
            <Star className="w-3 h-3 text-white/20" />
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, delay: 0.3 }}
        className="relative z-10 min-h-screen flex items-center justify-center p-4"
      >
        <div className="w-full max-w-lg">
          {/* Main login card */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="relative group"
          >
            {/* Glowing border effect */}
            <motion.div
              animate={{
                background: [
                  'linear-gradient(45deg, #8b5cf6, #a855f7, #d946ef)',
                  'linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899)',
                  'linear-gradient(225deg, #ec4899, #a855f7, #06b6d4)',
                  'linear-gradient(315deg, #8b5cf6, #ec4899, #3b82f6)',
                ],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              className="absolute -inset-1 rounded-3xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-500"
            />

            <motion.div
              whileHover={{ y: -3 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="relative bg-white/5 backdrop-blur-xl rounded-3xl p-10 shadow-2xl border border-white/10 hover:shadow-3xl hover:border-white/15 transition-all duration-500"
            >
              {/* Header */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="text-center mb-8"
              >
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.8 }}
                  className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-violet-500 to-purple-500 rounded-2xl mb-6 shadow-lg cursor-pointer"
                >
                  <Mail className="w-8 h-8 text-white" />
                </motion.div>

                <motion.h1
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 1 }}
                  className="text-4xl font-bold bg-gradient-to-r from-white via-violet-200 to-purple-200 bg-clip-text text-transparent mb-3"
                >
                  邮箱验证码登录
                </motion.h1>

                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 1.2 }}
                  className="text-lg text-gray-300 font-light"
                >
                  请输入您的邮箱和验证码
                </motion.p>
              </motion.div>

              {/* Form */}
              <motion.form
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 1.4 }}
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-gray-300 font-medium">
                    邮箱地址
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="请输入邮箱地址"
                    {...register('email')}
                    className={`bg-white/10 border-white/20 text-white placeholder:text-gray-400 rounded-xl py-3 transition-all duration-300 focus:bg-white/15 focus:border-violet-400 ${
                      errors.email ? 'border-red-400 focus:border-red-400' : ''
                    }`}
                    autoComplete="email"
                  />
                  {errors.email && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center space-x-2 text-red-400 text-sm"
                    >
                      <AlertCircle className="h-4 w-4" />
                      <span>{errors.email.message}</span>
                    </motion.div>
                  )}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="code" className="text-gray-300 font-medium">
                    验证码
                  </Label>
                  <div className="flex space-x-3">
                    <Input
                      id="code"
                      type="text"
                      placeholder={`请输入${CODE_LENGTH}位验证码`}
                      {...register('code')}
                      onChange={handleCodeChange}
                      className={`bg-white/10 border-white/20 text-white placeholder:text-gray-400 rounded-xl py-3 transition-all duration-300 focus:bg-white/15 focus:border-violet-400 ${
                        errors.code ? 'border-red-400 focus:border-red-400' : ''
                      }`}
                      maxLength={CODE_LENGTH}
                      autoComplete="one-time-code"
                    />
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        type="button"
                        variant="outline"
                        className="whitespace-nowrap min-w-[120px] bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/30 rounded-xl py-3 transition-all duration-300 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                        onClick={handleSendCode}
                        disabled={isSendCodeDisabled}
                      >
                        {countdown > 0
                          ? `${countdown}s`
                          : isSendingCode
                            ? '发送中...'
                            : '获取验证码'}
                      </Button>
                    </motion.div>
                  </div>
                  {errors.code && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center space-x-2 text-red-400 text-sm"
                    >
                      <AlertCircle className="h-4 w-4" />
                      <span>{errors.code.message}</span>
                    </motion.div>
                  )}
                  {countdown > 0 && !errors.code && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center space-x-2 text-green-400 text-sm"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>验证码已发送，{countdown}秒后可重新发送</span>
                    </motion.div>
                  )}
                </div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                  className="relative group"
                >
                  {/* Enhanced glow effect for login button */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 via-purple-600 to-violet-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>

                  <Button
                    type="submit"
                    className="relative w-full group overflow-hidden bg-gradient-to-r from-violet-600 via-purple-600 to-violet-600 hover:from-violet-500 hover:via-purple-500 hover:to-violet-500 text-white border-0 rounded-2xl py-6 px-6 text-lg font-semibold transition-all duration-300 shadow-xl disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                    disabled={isLoginDisabled}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      initial={{ x: '-100%' }}
                      whileHover={{ x: '100%' }}
                      transition={{ duration: 0.6 }}
                    />
                    <div className="relative flex items-center justify-center space-x-3">
                      <Mail className="w-6 h-6" />
                      <span>{emailLoginMutation.isPending ? '登录中...' : '登录'}</span>
                    </div>
                  </Button>
                </motion.div>
              </motion.form>

              {/* Back button */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 1.8 }}
                className="mt-6 text-center"
              >
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant="link"
                    className="text-gray-400 hover:text-white transition-colors duration-300 p-0 cursor-pointer disabled:cursor-not-allowed"
                    onClick={() => router.push('/auth')}
                    disabled={emailLoginMutation.isPending}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    返回登录页
                  </Button>
                </motion.div>
              </motion.div>

              {/* Security tip */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 2 }}
                className="mt-6 text-center"
              >
                <motion.div
                  whileHover={{ scale: 1.01, y: -1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className="relative group cursor-default"
                >
                  {/* Subtle glow effect */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  <div className="relative flex flex-col items-center space-y-2 text-sm bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 shadow-lg">
                    <div className="flex items-center space-x-2">
                      <div className="p-1.5 bg-green-500/20 rounded-lg">
                        <Shield className="w-4 h-4 text-green-400" />
                      </div>
                      <span className="font-medium text-gray-300">安全提示</span>
                    </div>
                    <p className="text-xs text-center leading-relaxed text-gray-400">
                      验证码有效期为5分钟，请及时输入
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// 导出带 Suspense 的组件
export default function EmailLoginPage() {
  return (
    <Suspense
      fallback={
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="min-h-screen relative overflow-hidden bg-black flex items-center justify-center"
        >
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-12 w-12 text-violet-500 animate-spin" />
            <p className="text-lg font-medium text-gray-300">加载中...</p>
          </div>
        </motion.div>
      }
    >
      <EmailLoginContent />
    </Suspense>
  );
}
