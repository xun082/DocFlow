'use client';

import React, { useState, useRef } from 'react';
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useEmailPasswordRegister } from '@/hooks/useAuth';

// 注册表单验证 schema
const emailPasswordRegisterSchema = z
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

type EmailPasswordRegisterFormData = z.infer<typeof emailPasswordRegisterSchema>;

export default function EmailPasswordRegisterForm() {
  const registerMutation = useEmailPasswordRegister();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const submittingRef = useRef(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<EmailPasswordRegisterFormData>({
    resolver: zodResolver(emailPasswordRegisterSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const isSubmitting = registerMutation.isPending || submittingRef.current;

  const onSubmit = (data: EmailPasswordRegisterFormData) => {
    // 双重检查防止重复提交
    if (registerMutation.isPending || submittingRef.current) {
      return;
    }

    submittingRef.current = true;

    registerMutation.mutate(
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
    <div className="w-full">
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
        {/* 表单 */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="reg-email" className="text-gray-300 font-medium">
              邮箱地址
            </Label>
            <Input
              id="reg-email"
              type="email"
              placeholder="请输入邮箱地址"
              {...register('email')}
              className={`bg-white/10 border-white/20 text-white placeholder:text-gray-400 rounded-xl py-3 transition-all duration-300 focus:bg-white/15 focus:border-violet-400 ${
                errors.email ? 'border-red-400 focus:border-red-400' : ''
              }`}
              autoComplete="email"
              disabled={isSubmitting}
            />
            {errors.email && (
              <div className="flex items-center space-x-2 text-red-400 text-xs">
                <AlertCircle className="h-3 w-3" />
                <span>{errors.email.message}</span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <Label htmlFor="reg-password" className="text-gray-300 font-medium">
              设置密码
            </Label>
            <div className="relative">
              <Input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="请输入密码（至少 6 位）"
                {...register('password')}
                className={`bg-white/10 border-white/20 text-white placeholder:text-gray-400 rounded-xl py-3 pr-10 transition-all duration-300 focus:bg-white/15 focus:border-violet-400 ${
                  errors.password ? 'border-red-400 focus:border-red-400' : ''
                }`}
                autoComplete="new-password"
                disabled={isSubmitting}
              />
              <button
                type="button"
                aria-label={showPassword ? '隐藏密码' : '显示密码'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white"
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && (
              <div className="flex items-center space-x-2 text-red-400 text-xs">
                <AlertCircle className="h-3 w-3" />
                <span>{errors.password.message}</span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <Label htmlFor="reg-confirm" className="text-gray-300 font-medium">
              确认密码
            </Label>
            <div className="relative">
              <Input
                id="reg-confirm"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="请再次输入密码"
                {...register('confirmPassword')}
                className={`bg-white/10 border-white/20 text-white placeholder:text-gray-400 rounded-xl py-3 pr-10 transition-all duration-300 focus:bg-white/15 focus:border-violet-400 ${
                  errors.confirmPassword ? 'border-red-400 focus:border-red-400' : ''
                }`}
                autoComplete="new-password"
                disabled={isSubmitting}
              />
              <button
                type="button"
                aria-label={showConfirmPassword ? '隐藏密码' : '显示密码'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white"
                onClick={() => setShowConfirmPassword((v) => !v)}
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <div className="flex items-center space-x-2 text-red-400 text-xs">
                <AlertCircle className="h-3 w-3" />
                <span>{errors.confirmPassword.message}</span>
              </div>
            )}
          </div>

          <div className="relative group">
            {/* 按钮发光效果 */}
            <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 via-purple-600 to-violet-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>

            <Button
              type="submit"
              className="relative w-full group overflow-hidden bg-gradient-to-r from-violet-600 via-purple-600 to-violet-600 hover:from-violet-500 hover:via-purple-500 hover:to-violet-500 text-white border-0 rounded-2xl py-6 px-6 text-lg font-semibold transition-all duration-300 shadow-xl disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              disabled={!isValid || isSubmitting}
              onClick={(e) => {
                if (!isValid || isSubmitting) {
                  e.preventDefault();
                  e.stopPropagation();
                }
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <div className="relative flex items-center justify-center space-x-3">
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>注册中...</span>
                  </>
                ) : (
                  <>
                    <span>注册</span>
                  </>
                )}
              </div>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
