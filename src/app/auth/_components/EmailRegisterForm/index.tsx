'use client';

import React, { useState, useRef } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useEmailPasswordRegister } from '@/hooks/useAuth';

const emailRegisterFormSchema = z
  .object({
    email: z
      .string()
      .min(1, '请输入邮箱地址')
      .email('请输入有效的邮箱地址')
      .max(100, '邮箱地址过长'),
    password: z.string().min(6, '密码长度至少为6位').max(50, '密码长度不能超过50位'),
    confirmPassword: z.string().min(1, '请确认密码'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '两次输入的密码不一致',
    path: ['confirmPassword'],
  });

type EmailRegisterFormData = z.infer<typeof emailRegisterFormSchema>;

export default function EmailRegisterForm() {
  const emailRegisterMutation = useEmailPasswordRegister();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const submittingRef = useRef(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmailRegisterFormData>({
    resolver: zodResolver(emailRegisterFormSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const isSubmitting = emailRegisterMutation.isPending || submittingRef.current;

  const onSubmit = (data: EmailRegisterFormData) => {
    if (emailRegisterMutation.isPending || submittingRef.current) return;
    submittingRef.current = true;
    emailRegisterMutation.mutate(
      { email: data.email, password: data.password, confirmPassword: data.confirmPassword },
      {
        onSuccess: () => {},
        onError: () => {
          submittingRef.current = false;
        },
      },
    );
  };

  return (
    <div className="bg-gray-100/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-300">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-3">
          <Label htmlFor="reg-email" className="text-gray-700 font-medium">
            邮箱地址
          </Label>
          <Input
            id="reg-email"
            type="email"
            placeholder="请输入邮箱地址"
            {...register('email')}
            className={`bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 rounded-xl py-3 transition-all duration-300 focus:bg-gray-50 focus:border-gray-600 ${
              errors.email ? 'border-gray-600 focus:border-gray-600' : ''
            }`}
            autoComplete="email"
            disabled={isSubmitting}
          />
          {errors.email && (
            <div className="flex items-center space-x-2 text-red-500 text-xs">
              <span>{errors.email.message}</span>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <Label htmlFor="reg-password" className="text-gray-700 font-medium">
            设置密码
          </Label>
          <div className="relative">
            <Input
              id="reg-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="请输入密码（至少 6 位）"
              {...register('password')}
              className={`bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 rounded-xl py-3 pr-10 transition-all duration-300 focus:bg-gray-50 focus:border-gray-600 ${
                errors.password ? 'border-gray-600 focus:border-gray-600' : ''
              }`}
              autoComplete="new-password"
              disabled={isSubmitting}
            />
            <button
              type="button"
              aria-label={showPassword ? '隐藏密码' : '显示密码'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              onClick={() => setShowPassword((v) => !v)}
            >
              {showPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
            </button>
          </div>
          {errors.password && (
            <div className="flex items-center space-x-2 text-red-500 text-xs">
              <span>{errors.password.message}</span>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <Label htmlFor="reg-confirm" className="text-gray-700 font-medium">
            确认密码
          </Label>
          <div className="relative">
            <Input
              id="reg-confirm"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="请再次输入密码"
              {...register('confirmPassword')}
              className={`bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 rounded-xl py-3 pr-10 transition-all duration-300 focus:bg-gray-50 focus:border-gray-600 ${
                errors.confirmPassword ? 'border-gray-600 focus:border-gray-600' : ''
              }`}
              autoComplete="new-password"
              disabled={isSubmitting}
            />
            <button
              type="button"
              aria-label={showConfirmPassword ? '隐藏密码' : '显示密码'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              onClick={() => setShowConfirmPassword((v) => !v)}
            >
              {showConfirmPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <div className="flex items-center space-x-2 text-red-500 text-xs">
              <span>{errors.confirmPassword.message}</span>
            </div>
          )}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-black hover:bg-gray-800 text-white border-0 rounded-2xl py-6 px-6 text-lg font-semibold shadow-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>注册中...</span>
            </div>
          ) : (
            '注册'
          )}
        </Button>
      </form>
    </div>
  );
}
