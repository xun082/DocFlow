'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AlertCircle, CheckCircle, Shield } from 'lucide-react';
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

// Tab内使用的简化版本组件
export default function EmailCodeForm() {
  const emailLoginMutation = useEmailLogin();
  const [countdown, setCountdown] = useState(0);
  const [isSendingCode, setIsSendingCode] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const sendingCodeRef = useRef(false);
  const loggingInRef = useRef(false);

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

  // 组件卸载时清理定时器和重置状态
  useEffect(() => {
    return () => {
      clearTimer();
      sendingCodeRef.current = false;
      loggingInRef.current = false;
    };
  }, [clearTimer]);

  const errorHandler: ErrorHandler = {
    onError: () => {
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

    // 使用双重检查防止重复提交
    if (isSendingCode || countdown > 0 || sendingCodeRef.current) {
      return;
    }

    // 立即设置 ref 锁
    sendingCodeRef.current = true;
    setIsSendingCode(true);

    try {
      const { data, error } = await authApi.sendEmailCode(watchedEmail, errorHandler);

      if (error) {
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
    } catch {
      toast.error('发送验证码失败，请稍后重试');
    } finally {
      setIsSendingCode(false);
      sendingCodeRef.current = false;
    }
  };

  // 处理验证码输入变化（只允许数字）
  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, CODE_LENGTH);
    setValue('code', value, { shouldValidate: true });
  };

  const isSendCodeDisabled =
    !watchedEmail || !!errors.email || isSendingCode || countdown > 0 || sendingCodeRef.current;

  const isLoginDisabled = !isValid || emailLoginMutation.isPending || loggingInRef.current;

  const onSubmit = async (data: EmailLoginFormData) => {
    // 使用双重检查防止重复提交
    if (emailLoginMutation.isPending || loggingInRef.current) {
      return;
    }

    // 立即设置 ref 锁
    loggingInRef.current = true;

    // 使用 React Query mutation
    emailLoginMutation.mutate(
      { email: data.email, code: data.code },
      {
        onSuccess: () => {
          // 清理定时器
          clearTimer();
          // 保持锁定状态，防止重复登录
        },
        onError: () => {
          // 错误处理已在 useEmailLogin hook 中处理
          // 释放锁，允许重试
          loggingInRef.current = false;
        },
        onSettled: () => {
          // 如果成功，保持锁定；如果失败，在 onError 中已释放
        },
      },
    );
  };

  return (
    <div className="bg-gray-100/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-300">
      {/* 邮箱输入框 */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-3">
          <Label htmlFor="tab-email" className="text-gray-700 font-medium">
            邮箱地址
          </Label>
          <Input
            id="tab-email"
            type="email"
            placeholder="请输入邮箱地址"
            {...register('email')}
            className={`bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 rounded-xl py-3 transition-all duration-300 focus:bg-gray-50 focus:border-gray-600 ${
              errors.email ? 'border-gray-600 focus:border-gray-600' : ''
            }`}
            autoComplete="email"
          />
          {errors.email && (
            <div className="flex items-center space-x-2 text-gray-800 text-xs">
              <AlertCircle className="h-3 w-3" />
              <span>{errors.email.message}</span>
            </div>
          )}
        </div>

        {/* 验证码输入框 */}
        <div className="space-y-3">
          <Label htmlFor="tab-code" className="text-gray-700 font-medium">
            验证码
          </Label>
          <div className="flex items-center gap-3">
            <Input
              id="tab-code"
              type="text"
              placeholder={`${CODE_LENGTH}位数字`}
              {...register('code')}
              onChange={handleCodeChange}
              className={`bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 rounded-xl py-3 transition-all duration-300 focus:bg-gray-50 focus:border-gray-600 ${
                errors.code ? 'border-gray-600 focus:border-gray-600' : ''
              }`}
              maxLength={CODE_LENGTH}
              autoComplete="one-time-code"
            />
            <Button
              type="button"
              variant="outline"
              className="whitespace-nowrap min-w-[100px] bg-white border-gray-300 text-gray-900 hover:bg-gray-50 hover:border-gray-600 rounded-xl py-3 transition-all duration-300 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed text-sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSendCode();
              }}
              disabled={isSendCodeDisabled}
            >
              {countdown > 0 ? `${countdown}s` : isSendingCode ? '发送中...' : '获取验证码'}
            </Button>
          </div>
          {errors.code && (
            <div className="flex items-center space-x-2 text-gray-800 text-xs">
              <AlertCircle className="h-3 w-3" />
              <span>{errors.code.message}</span>
            </div>
          )}
          {countdown > 0 && !errors.code && (
            <div className="flex items-center space-x-2 text-gray-600 text-xs">
              <CheckCircle className="h-3 w-3" />
              <span>验证码已发送，{countdown}秒后可重新发送</span>
            </div>
          )}
        </div>

        <Button
          type="submit"
          className="w-full bg-black text-white border-0 rounded-2xl py-6 px-6 text-lg font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={(e) => {
            if (isLoginDisabled) {
              e.preventDefault();
              e.stopPropagation();
            }
          }}
        >
          <span>登录</span>
        </Button>
        {/* 安全提示 */}
        <div className="flex items-center justify-center space-x-2 text-xs text-gray-600 bg-gray-100 rounded-lg py-2 px-3">
          <Shield className="w-3.5 h-3.5 text-gray-600" />
          <span>验证码有效期为5分钟</span>
        </div>
      </form>
    </div>
  );
}
