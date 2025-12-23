'use client';

import React, { useState, useRef } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useEmailPasswordRegister } from '@/hooks/useAuth';

export default function EmailPasswordRegisterForm() {
  const registerMutation = useEmailPasswordRegister();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const submittingRef = useRef(false);
  const isSubmitting = registerMutation.isPending || submittingRef.current;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 简单校验
    if (!email || !password || !confirmPassword) {
      toast.warning('请完整填写注册信息');

      return;
    }

    if (password.length < 6) {
      toast.warning('密码长度至少为 6 位');

      return;
    }

    if (password !== confirmPassword) {
      toast.warning('两次输入的密码不一致');

      return;
    }

    if (registerMutation.isPending || submittingRef.current) {
      return;
    }

    submittingRef.current = true;
  };

  return (
    <div className="w-full">
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
        {/* 表单 */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="reg-email" className="text-gray-300 font-medium">
              邮箱地址
            </Label>
            <div className="flex items-center gap-3">
              <Input
                id="reg-email"
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
            <Label htmlFor="reg-password" className="text-gray-300 font-medium">
              设置密码
            </Label>
            <div className="relative">
              <Input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码（至少 6 位）"
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 rounded-xl py-3 pr-10 transition-all duration-300 focus:bg-white/15 focus:border-violet-400"
                autoComplete="new-password"
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

          <div className="space-y-3">
            <Label htmlFor="reg-confirm" className="text-gray-300 font-medium">
              确认密码
            </Label>
            <div className="relative">
              <Input
                id="reg-confirm"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="请再次输入密码"
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 rounded-xl py-3 pr-10 transition-all duration-300 focus:bg-white/15 focus:border-violet-400"
                autoComplete="new-password"
                required
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
