'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';

import { useGitHubLogin, useTokenLogin } from '@/hooks/useAuth';

function CallbackContent() {
  const [status, setStatus] = useState('处理中...');
  const [state, setState] = useState<'loading' | 'success' | 'error'>('loading');
  const [mounted, setMounted] = useState(false);
  const [authProcessed, setAuthProcessed] = useState(false); // 添加认证处理标记
  const searchParams = useSearchParams();
  const router = useRouter();

  const gitHubLoginMutation = useGitHubLogin();
  const tokenLoginMutation = useTokenLogin();

  // 确保组件在客户端挂载
  useEffect(() => {
    setMounted(true);
  }, []);

  // 获取重定向 URL
  const getRedirectUrl = (): string => {
    // 1. 优先从 state 参数获取（GitHub OAuth 标准）
    const state = searchParams?.get('state');

    if (state) {
      try {
        return decodeURIComponent(state);
      } catch {}
    }

    // 2. 从 redirect_to 参数获取
    const redirectTo = searchParams?.get('redirect_to');

    if (redirectTo) {
      try {
        return decodeURIComponent(redirectTo);
      } catch {}
    }

    // 3. 从 sessionStorage 获取（仅客户端）
    if (mounted && typeof window !== 'undefined') {
      try {
        const saved = sessionStorage.getItem('auth_redirect');

        if (saved) {
          sessionStorage.removeItem('auth_redirect');

          return saved;
        }
      } catch {}
    }

    // 4. 默认跳转到仪表盘
    return '/dashboard';
  };

  useEffect(() => {
    if (!mounted || authProcessed || !searchParams) return;

    const processAuth = async () => {
      setAuthProcessed(true);

      try {
        // 场景1: 直接 Token 登录
        const token = searchParams.get('token');

        if (token) {
          const authData = {
            token,
            refresh_token: searchParams.get('refresh_token') || undefined,
            expires_in: searchParams.get('expires_in')
              ? parseInt(searchParams.get('expires_in')!)
              : undefined,
            refresh_expires_in: searchParams.get('refresh_expires_in')
              ? parseInt(searchParams.get('refresh_expires_in')!)
              : undefined,
          };

          setStatus('登录成功，正在跳转...');
          setState('success');

          tokenLoginMutation.mutate({
            authData,
            redirectUrl: getRedirectUrl(),
          });

          return;
        }

        // 场景2: GitHub OAuth 授权码登录
        const code = searchParams.get('code');

        if (!code) {
          setStatus('缺少授权码，请重新登录');
          setState('error');

          return;
        }

        setStatus('正在验证授权...');

        gitHubLoginMutation.mutate(
          {
            code,
            redirectUrl: getRedirectUrl(),
          },
          {
            onSuccess: () => {
              setStatus('登录成功，正在跳转...');
              setState('success');
            },
            onError: (error) => {
              const message = error instanceof Error ? error.message : String(error);
              setStatus(`认证失败: ${message}`);
              setState('error');
            },
          },
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : '未知错误';
        setStatus(`登录失败: ${message}`);
        setState('error');
      }
    };

    processAuth();
  }, [mounted, authProcessed, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="w-full max-w-md p-10 space-y-6 bg-white rounded-2xl shadow-xl border border-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">GitHub认证</h1>

          <div className="flex flex-col items-center justify-center space-y-4 mt-6">
            {state === 'loading' && (
              <div className="flex flex-col items-center">
                <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
                <p className="text-lg font-medium text-gray-700">{status}</p>
              </div>
            )}

            {state === 'success' && (
              <div className="flex flex-col items-center">
                <CheckCircle className="h-14 w-14 text-green-500 mb-4" />
                <p className="text-lg font-medium text-gray-700">{status}</p>
              </div>
            )}

            {state === 'error' && (
              <div className="flex flex-col items-center">
                <AlertCircle className="h-14 w-14 text-red-500 mb-4" />
                <p className="text-lg font-medium text-gray-700 text-center mb-4">{status}</p>
                <button
                  className="py-2.5 px-6 bg-gray-900 hover:bg-gray-800 text-white rounded-xl transition-all duration-200 cursor-pointer"
                  onClick={() => router.push('/auth')}
                >
                  返回登录
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
          <div className="w-full max-w-md p-10 space-y-6 bg-white rounded-2xl shadow-xl border border-gray-100">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">GitHub认证</h1>
              <div className="flex flex-col items-center justify-center mt-6">
                <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
                <p className="text-lg font-medium text-gray-700">加载中...</p>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
