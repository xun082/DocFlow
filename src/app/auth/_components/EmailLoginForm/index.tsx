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
    <div className="bg-gray-100/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-300">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-3">
          <Label htmlFor="email" className="text-gray-700 font-medium">
            邮箱地址
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="请输入邮箱地址"
            className={`bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 rounded-xl py-3 transition-all duration-300 focus:bg-gray-50 ${errors.email ? 'border-gray-800 focus:border-gray-800' : 'focus:border-gray-600'}`}
            autoComplete="email"
            disabled={isSubmitting || emailLoginMutation.isPending}
            {...register('email')}
          />
          {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
        </div>

        <div className="space-y-3">
          <Label htmlFor="password" className="text-gray-700 font-medium">
            密码
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="请输入密码"
              className={`bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 rounded-xl py-3 pr-10 transition-all duration-300 focus:bg-gray-50 ${errors.password ? 'border-gray-800 focus:border-gray-800' : 'focus:border-gray-600'}`}
              autoComplete="current-password"
              disabled={isSubmitting || emailLoginMutation.isPending}
              {...register('password')}
            />
            <button
              type="button"
              aria-label={showPassword ? '隐藏密码' : '显示密码'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900"
              onClick={() => setShowPassword((v) => !v)}
            >
              {showPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
            </button>
          </div>
          {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
        </div>

        <Button
          type="submit"
          disabled={emailLoginMutation.isPending || isSubmitting}
          className="w-full bg-black hover:bg-gray-800 text-white border-0 rounded-2xl py-6 px-6 text-lg font-semibold shadow-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
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
      </form>
    </div>
  );
}
