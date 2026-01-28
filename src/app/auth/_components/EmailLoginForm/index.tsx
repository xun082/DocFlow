'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useEmailPasswordLogin } from '@/hooks/useAuth';

const emailLoginFormSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(1, '请输入密码'),
});

type EmailLoginFormData = z.infer<typeof emailLoginFormSchema>;

export default function EmailLoginForm() {
  const emailLoginMutation = useEmailPasswordLogin();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EmailLoginFormData>({
    resolver: zodResolver(emailLoginFormSchema),
    mode: 'onChange',
  });

  const onSubmit = (data: EmailLoginFormData) => {
    if (emailLoginMutation.isPending) return;
    emailLoginMutation.mutate({ email: data.email, password: data.password });
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2.5">
          <Label htmlFor="email" className="text-gray-700 font-semibold text-sm">
            邮箱地址
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="请输入邮箱地址"
            className={`bg-white/90 border-gray-200 text-gray-900 placeholder:text-gray-400 rounded-xl py-3 text-sm transition-all duration-300 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 shadow-sm ${errors.email ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : ''}`}
            autoComplete="email"
            disabled={isSubmitting || emailLoginMutation.isPending}
            {...register('email')}
          />
          {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
        </div>

        <div className="space-y-2.5">
          <Label htmlFor="password" className="text-gray-700 font-semibold text-sm">
            密码
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="请输入密码"
              className={`bg-white/90 border-gray-200 text-gray-900 placeholder:text-gray-400 rounded-xl py-3 pr-11 text-sm transition-all duration-300 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 shadow-sm ${errors.password ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : ''}`}
              autoComplete="current-password"
              disabled={isSubmitting || emailLoginMutation.isPending}
              {...register('password')}
            />
            <button
              type="button"
              aria-label={showPassword ? '隐藏密码' : '显示密码'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 touch-manipulation transition-colors duration-200"
              onClick={() => setShowPassword((v) => !v)}
            >
              {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
        </div>

        <div className="pt-2">
          <div className="relative group/btn">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-2xl blur opacity-40 group-hover/btn:opacity-60 transition duration-300" />
            <Button
              type="submit"
              disabled={emailLoginMutation.isPending || isSubmitting}
              className="relative w-full bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 hover:from-gray-800 hover:via-gray-700 hover:to-gray-800 text-white border-0 rounded-2xl py-6 px-6 text-base font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02]"
            >
              {emailLoginMutation.isPending || isSubmitting ? (
                <div className="flex items-center justify-center space-x-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>登录中...</span>
                </div>
              ) : (
                '登录'
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
