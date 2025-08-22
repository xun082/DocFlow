'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mail, AlertCircle, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

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

export default function EmailLoginPage() {
  const router = useRouter();
  const emailLoginMutation = useEmailLogin();
  const [countdown, setCountdown] = useState(0);
  const [isSendingCode, setIsSendingCode] = useState(false);

  // 使用 ref 保存定时器 ID，避免内存泄漏
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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

    if (data && data.code === 201) {
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
      { email: data.email, code: data.code },
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="w-full max-w-md p-10 space-y-8 bg-white rounded-2xl shadow-xl border border-gray-100">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800">邮箱验证码登录</h1>
          <p className="mt-3 text-gray-600">请输入您的邮箱和验证码</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">邮箱地址</Label>
            <Input
              id="email"
              type="email"
              placeholder="请输入邮箱地址"
              {...register('email')}
              className={
                errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
              }
              autoComplete="email"
            />
            {errors.email && (
              <div className="flex items-center space-x-1 text-red-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>{errors.email.message}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="code">验证码</Label>
            <div className="flex space-x-2">
              <Input
                id="code"
                type="text"
                placeholder={`请输入${CODE_LENGTH}位验证码`}
                {...register('code')}
                onChange={handleCodeChange}
                className={
                  errors.code ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                }
                maxLength={CODE_LENGTH}
                autoComplete="one-time-code"
              />
              <Button
                type="button"
                variant="outline"
                className="whitespace-nowrap min-w-[100px]"
                onClick={handleSendCode}
                disabled={isSendCodeDisabled}
              >
                {countdown > 0 ? `${countdown}s` : isSendingCode ? '发送中...' : '获取验证码'}
              </Button>
            </div>
            {errors.code && (
              <div className="flex items-center space-x-1 text-red-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>{errors.code.message}</span>
              </div>
            )}
            {countdown > 0 && !errors.code && (
              <div className="flex items-center space-x-1 text-blue-600 text-sm">
                <CheckCircle className="h-4 w-4" />
                <span>验证码已发送，{countdown}秒后可重新发送</span>
              </div>
            )}
          </div>

          <Button
            type="submit"
            className="w-full flex items-center justify-center py-4 px-4 space-x-3 text-white bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-md disabled:opacity-50 disabled:transform-none"
            disabled={isLoginDisabled}
          >
            <Mail className="mr-2 h-5 w-5" />
            <span className="text-base">{emailLoginMutation.isPending ? '登录中...' : '登录'}</span>
          </Button>
        </form>

        <div className="text-center">
          <Button
            variant="link"
            className="text-gray-500 hover:text-gray-700"
            onClick={() => router.push('/auth')}
            disabled={emailLoginMutation.isPending}
          >
            返回登录页
          </Button>
        </div>

        <div className="mt-10 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} 文档系统. 保留所有权利.</p>
        </div>
      </div>
    </div>
  );
}
