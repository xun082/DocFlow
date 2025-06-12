'use client';

import React, { useState } from 'react';
import { Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import authApi from '@/services/auth';
import { saveAuthData } from '@/utils/cookie';
import { errorHandler } from '@/utils/errorHandler';

export default function EmailLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const handleSendCode = async () => {
    if (!email) {
      toast.error('请输入邮箱地址');

      return;
    }

    setIsLoading(true);

    const { data } = await authApi.sendEmailCode(email, errorHandler);
    setIsLoading(false);

    if (data?.data.success) {
      setCountdown(60);

      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);

            return 0;
          }

          return prev - 1;
        });
      }, 1000);
    } else {
      toast.error(data?.data.message || '发送验证码失败');
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !code) {
      toast.error('请输入邮箱和验证码');

      return;
    }

    setIsLoading(true);

    const { data } = await authApi.emailCodeLogin({ email, code }, errorHandler);
    setIsLoading(false);

    if (data?.data.success) {
      saveAuthData(data.data);
      router.push('/');
    } else {
      toast.error(data?.data.message || '登录失败');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="w-full max-w-md p-10 space-y-8 bg-white rounded-2xl shadow-xl border border-gray-100">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800">邮箱验证码登录</h1>
          <p className="mt-3 text-gray-600">请输入您的邮箱和验证码</p>
        </div>

        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">邮箱</Label>
            <Input
              id="email"
              type="email"
              placeholder="请输入邮箱"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="code">验证码</Label>
            <div className="flex space-x-2">
              <Input
                id="code"
                type="text"
                placeholder="请输入验证码"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
              <Button
                type="button"
                variant="outline"
                className="whitespace-nowrap"
                onClick={handleSendCode}
                disabled={isLoading || countdown > 0}
              >
                {countdown > 0 ? `${countdown}秒后重试` : '获取验证码'}
              </Button>
            </div>
          </div>
          <Button
            type="submit"
            className="w-full flex items-center justify-center py-4 px-4 space-x-3 text-white bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-md"
            disabled={isLoading}
          >
            <Mail className="mr-2 h-5 w-5" />
            <span className="text-base">{isLoading ? '登录中...' : '登录'}</span>
          </Button>
        </form>

        <div className="text-center">
          <Button
            variant="link"
            className="text-gray-500 hover:text-gray-700"
            onClick={() => router.push('/auth')}
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
