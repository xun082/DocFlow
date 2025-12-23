'use client';

import React, { useState, useRef } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useEmailPasswordLogin } from '@/hooks/useAuth';

export default function EmailPasswordLoginForm() {
  const emailPasswordMutation = useEmailPasswordLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const loggingInRef = useRef(false);
  const isSubmitting = emailPasswordMutation.isPending || loggingInRef.current;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.warning('请输入邮箱和密码');

      return;
    }

    if (emailPasswordMutation.isPending || loggingInRef.current) {
      return;
    }

    loggingInRef.current = true;

    emailPasswordMutation.mutate(
      { email, password },
      {
        onSuccess: () => {},
        onError: () => {
          loggingInRef.current = false;
        },
      },
    );
  };

  return (
    <div className="w-full">
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
        {/* 表单 */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="email" className="text-gray-300 font-medium">
              邮箱地址
            </Label>
            <div className="flex items-center gap-3">
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="请输入邮箱地址"
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 rounded-xl py-3 transition-all duration-300 focus:bg-white/15 focus:border-violet-400"
                autoComplete="email"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="password" className="text-gray-300 font-medium">
              密码
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 rounded-xl py-3 pr-10 transition-all duration-300 focus:bg-white/15 focus:border-violet-400"
                autoComplete="current-password"
                required
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
