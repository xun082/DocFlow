'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';

import authApi from '@/services/auth';
import { saveAuthData } from '@/utils/cookie';

function CallbackContent() {
  const [status, setStatus] = useState('处理中...');
  const [state, setState] = useState<'loading' | 'success' | 'error'>('loading');
  const searchParams = useSearchParams();
  const router = useRouter();

  // 获取原始跳转页面
  const getRedirectUrl = () => {
    // 优先从state参数获取（GitHub OAuth标准做法）
    const state = searchParams?.get('state');

    if (state) {
      try {
        return decodeURIComponent(state);
      } catch (e) {
        console.warn('解析state参数失败:', e);
      }
    }

    // 其次从URL参数获取
    const redirectTo = searchParams?.get('redirect_to') || searchParams?.get('returnTo');

    if (redirectTo) {
      return decodeURIComponent(redirectTo);
    }

    // 最后从sessionStorage获取
    if (typeof window !== 'undefined') {
      const savedRedirect = sessionStorage.getItem('auth_redirect');

      if (savedRedirect) {
        sessionStorage.removeItem('auth_redirect'); // 使用后清除

        return savedRedirect;
      }
    }

    // 默认跳转到首页
    return '/';
  };

  // 统一处理认证成功逻辑
  const handleAuthSuccess = (authData: any) => {
    saveAuthData(authData);
    setStatus('登录成功! 正在跳转...');
    setState('success');
    console.log('认证数据:', authData);

    // 跳转到原来的页面
    const redirectUrl = getRedirectUrl();
    setTimeout(() => router.push(redirectUrl), 1000);
  };

  useEffect(() => {
    const processAuth = async () => {
      try {
        // 检查searchParams是否存在
        if (!searchParams) {
          setStatus('URL参数获取失败');
          setState('error');

          return;
        }

        // 尝试从URL参数中获取token
        const token = searchParams.get('token');

        // 如果URL中直接包含token
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
            success: true,
          };

          handleAuthSuccess(authData);

          return;
        }

        // 否则尝试使用code获取token
        const code = searchParams.get('code');

        if (!code) {
          setStatus('未收到授权码或Token');
          setState('error');

          return;
        }

        const { data, error } = await authApi.githubCallback(code, {
          onError: (error) => console.error('GitHub认证出错:', error),
        });

        if (error) {
          setStatus(`登录失败: ${error}`);
          setState('error');

          return;
        }

        // 从API响应中获取实际的数据
        if (data && data.code === 200) {
          handleAuthSuccess(data.data);
        } else {
          setStatus(`登录失败: ${data?.message || '未知错误'}`);
          setState('error');
        }
      } catch (e) {
        setStatus('登录过程中发生错误');
        setState('error');
        console.error(e);
      }
    };

    processAuth();
  }, [searchParams, router]);

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
                <p className="text-lg font-medium text-gray-700">{status}</p>
                <button
                  className="mt-6 py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
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
