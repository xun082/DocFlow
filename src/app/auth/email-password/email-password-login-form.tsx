'use client';

import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useEmailPasswordLogin } from '@/hooks/useAuth';

const emailPasswordLoginSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(1, '请输入密码'),
});

type EmailPasswordLoginFormData = z.infer<typeof emailPasswordLoginSchema>;

export default function EmailPasswordLoginForm() {
  const emailPasswordMutation = useEmailPasswordLogin();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EmailPasswordLoginFormData>({
    resolver: zodResolver(emailPasswordLoginSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data: EmailPasswordLoginFormData) => {
    if (emailPasswordMutation.isPending) {
      return;
    }

    emailPasswordMutation.mutate(
      { email: data.email, password: data.password },
      {
        onSuccess: () => {},
        onError: () => {},
      },
    );
  };

  return (
    <div className="w-full">
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
        {/* 表单 */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="email" className="text-gray-300 font-medium">
              邮箱地址
            </Label>
            <div className="flex items-center gap-3">
              <Input
                id="email"
                type="email"
                placeholder="请输入邮箱地址"
                className={`bg-white/10 border-white/20 text-white placeholder:text-gray-400 rounded-xl py-3 transition-all duration-300 focus:bg-white/15 ${errors.email ? 'border-red-500 focus:border-red-500' : 'focus:border-violet-400'}`}
                autoComplete="email"
                disabled={isSubmitting || emailPasswordMutation.isPending}
                {...register('email')}
              />
            </div>
            {errors.email && <p className="text-sm text-red-400">{errors.email.message}</p>}
          </div>

          <div className="space-y-3">
            <Label htmlFor="password" className="text-gray-300 font-medium">
              密码
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="请输入密码"
                className={`bg-white/10 border-white/20 text-white placeholder:text-gray-400 rounded-xl py-3 pr-10 transition-all duration-300 focus:bg-white/15 ${errors.password ? 'border-red-500 focus:border-red-500' : 'focus:border-violet-400'}`}
                autoComplete="current-password"
                disabled={isSubmitting || emailPasswordMutation.isPending}
                {...register('password')}
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
            {errors.password && <p className="text-sm text-red-400">{errors.password.message}</p>}
          </div>

          <div className="relative group">
            {/* 按钮发光效果 */}
            <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 via-purple-600 to-violet-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>

            <Button
              type="submit"
              className="relative w-full group overflow-hidden bg-gradient-to-r from-violet-600 via-purple-600 to-violet-600 hover:from-violet-500 hover:via-purple-500 hover:to-violet-500 text-white border-0 rounded-2xl py-6 px-6 text-lg font-semibold transition-all duration-300 shadow-xl disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              disabled={isSubmitting}
              onClick={(e) => {
                if (isSubmitting) {
                  e.preventDefault();
                  e.stopPropagation();
                }
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <div className="relative flex items-center justify-center space-x-3">
                <span>登录</span>
              </div>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
