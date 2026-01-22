'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CheckCircle, Shield, Loader2 } from 'lucide-react';
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

const CODE_LENGTH = 6;

const emailLoginSchema = z.object({
  email: z.string().min(1, '请输入邮箱地址').email('请输入有效的邮箱地址').max(100, '邮箱地址过长'),
  code: z
    .string()
    .min(1, '请输入验证码')
    .length(CODE_LENGTH, `验证码必须是${CODE_LENGTH}位数字`)
    .regex(/^\d+$/, '验证码只能包含数字'),
});

type EmailLoginFormData = z.infer<typeof emailLoginSchema>;

export default function EmailCodeForm() {
  const emailLoginMutation = useEmailLogin();
  const [countdown, setCountdown] = useState(0);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const sendingCodeRef = useRef(false);
  const loggingInRef = useRef(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    trigger,
    setValue,
  } = useForm<EmailLoginFormData>({
    resolver: zodResolver(emailLoginSchema),
    mode: 'onChange',
    defaultValues: { email: '', code: '' },
  });

  const watchedEmail = watch('email');

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearTimer();
      sendingCodeRef.current = false;
      loggingInRef.current = false;
    };
  }, [clearTimer]);

  const errorHandler: ErrorHandler = {
    onError: () => toast.error('请求失败，请稍后重试'),
    forbidden: () => toast.error('验证码错误或已失效'),
    serverError: () => toast.error('服务器错误，请稍后再试'),
    networkError: () => toast.error('网络连接失败，请检查网络'),
    default: () => toast.error('未知错误'),
  };

  const startCountdown = useCallback(() => {
    clearTimer();
    setCountdown(60);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? (clearTimer(), 0) : prev - 1));
    }, 1000);
  }, [clearTimer]);

  const handleSendCode = async () => {
    const emailValid = await trigger('email');
    if (!emailValid || !watchedEmail || isSendingCode || countdown > 0 || sendingCodeRef.current)
      return;

    sendingCodeRef.current = true;
    setIsSendingCode(true);

    try {
      const { data, error } = await authApi.sendEmailCode(watchedEmail, errorHandler);
      if (error) return;

      if (data?.code === 200) {
        toast.success('验证码已发送', { description: `验证码已发送到 ${watchedEmail}，请查收` });
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

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, CODE_LENGTH);
    setValue('code', value, { shouldValidate: true });
  };

  const isSendCodeDisabled =
    !watchedEmail || !!errors.email || isSendingCode || countdown > 0 || sendingCodeRef.current;

  const onSubmit = (data: EmailLoginFormData) => {
    if (emailLoginMutation.isPending || loggingInRef.current) return;

    loggingInRef.current = true;
    emailLoginMutation.mutate(
      { email: data.email, code: data.code },
      {
        onSuccess: () => clearTimer(),
        onError: () => {
          loggingInRef.current = false;
        },
      },
    );
  };

  return (
    <div className="bg-gray-100/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-300">
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
            className={`bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 rounded-xl py-3 transition-all duration-300 focus:bg-gray-50 focus:border-gray-600 ${errors.email ? 'border-gray-600 focus:border-gray-600' : ''}`}
            autoComplete="email"
          />
          {errors.email && (
            <div className="flex items-center space-x-2 text-red-500 text-xs">
              <span>{errors.email.message}</span>
            </div>
          )}
        </div>

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
              className={`bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 rounded-xl py-3 transition-all duration-300 focus:bg-gray-50 focus:border-gray-600 ${errors.code ? 'border-gray-600 focus:border-gray-600' : ''}`}
              maxLength={CODE_LENGTH}
              autoComplete="one-time-code"
            />
            <Button
              type="button"
              variant="outline"
              className="whitespace-nowrap min-w-[110px] bg-white border-gray-300 text-gray-900 hover:bg-gray-50 hover:border-gray-600 rounded-xl py-3 transition-all duration-300 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed text-sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSendCode();
              }}
              disabled={isSendCodeDisabled}
            >
              {isSendingCode ? (
                <div className="flex items-center justify-center space-x-1.5">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>发送中</span>
                </div>
              ) : countdown > 0 ? (
                `${countdown}s`
              ) : (
                '获取验证码'
              )}
            </Button>
          </div>
          {errors.code && (
            <div className="flex items-center space-x-2 text-red-500 text-xs">
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
          disabled={emailLoginMutation.isPending || loggingInRef.current}
          className="w-full bg-black hover:bg-gray-800 text-white border-0 rounded-2xl py-6 px-6 text-lg font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {emailLoginMutation.isPending || loggingInRef.current ? (
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>登录中...</span>
            </div>
          ) : (
            '登录'
          )}
        </Button>

        <div className="flex items-center justify-center space-x-2 text-xs text-gray-600 bg-gray-100 rounded-lg py-2 px-3">
          <Shield className="w-3.5 h-3.5 text-gray-600" />
          <span>验证码有效期为5分钟</span>
        </div>
      </form>
    </div>
  );
}
