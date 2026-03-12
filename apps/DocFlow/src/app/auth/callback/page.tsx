'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';

import { useGitHubLogin, useTokenLogin } from '@/hooks/useAuth';

const DEFAULT_REDIRECT = '/dashboard';
const REDIRECT_STORAGE_KEY = 'auth_redirect';

function safeDecode(value: string | null): string | null {
  if (!value) return null;

  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function parseOptionalInt(value: string | null): number | undefined {
  if (value == null || value === '') return undefined;

  const n = Number(value);

  return Number.isFinite(n) ? n : undefined;
}

type CallbackState = 'loading' | 'success' | 'error';

function CallbackContent() {
  const [status, setStatus] = useState('处理中...');
  const [uiState, setUiState] = useState<CallbackState>('loading');
  const [mounted, setMounted] = useState(false);
  const [processed, setProcessed] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  const gitHubLoginMutation = useGitHubLogin();
  const tokenLoginMutation = useTokenLogin();

  useEffect(() => {
    setMounted(true);
  }, []);

  const getRedirectUrl = (): string => {
    const stateParam = safeDecode(searchParams?.get('state') ?? null);

    if (stateParam) {
      return stateParam;
    }

    const redirectTo = safeDecode(searchParams?.get('redirect_to') ?? null);

    if (redirectTo) {
      return redirectTo;
    }

    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem(REDIRECT_STORAGE_KEY);

      if (saved) {
        sessionStorage.removeItem(REDIRECT_STORAGE_KEY);

        return saved;
      }
    }

    return DEFAULT_REDIRECT;
  };

  useEffect(() => {
    if (!mounted || processed) return;

    setProcessed(true);

    const redirectUrl = getRedirectUrl();
    const token = searchParams.get('token');

    if (token) {
      setStatus('登录成功，正在跳转...');
      setUiState('success');
      tokenLoginMutation.mutate({
        authData: {
          token,
          refresh_token: searchParams.get('refresh_token') ?? undefined,
          expires_in: parseOptionalInt(searchParams.get('expires_in')),
          refresh_expires_in: parseOptionalInt(searchParams.get('refresh_expires_in')),
        },
        redirectUrl,
      });

      return;
    }

    const code = searchParams.get('code');

    if (code) {
      setStatus('正在验证授权...');
      gitHubLoginMutation.mutate(
        { code, redirectUrl },
        {
          onSuccess: () => {
            setStatus('登录成功，正在跳转...');
            setUiState('success');
          },
          onError: (error) => {
            setStatus(`认证失败：${error instanceof Error ? error.message : String(error)}`);
            setUiState('error');
          },
        },
      );

      return;
    }

    setStatus('缺少授权信息，请重新登录');
    setUiState('error');
  }, [mounted, processed, searchParams]);

  const handleManualRedirect = () => router.push(getRedirectUrl());

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="w-full max-w-md p-10 space-y-6 bg-white rounded-2xl shadow-xl border border-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">登录</h1>

          <div
            className="flex flex-col items-center justify-center space-y-4 mt-6"
            role="status"
            aria-live="polite"
            aria-label={status}
          >
            {uiState === 'loading' && (
              <div className="flex flex-col items-center">
                <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" aria-hidden />
                <p className="text-lg font-medium text-gray-700">{status}</p>
              </div>
            )}

            {uiState === 'success' && (
              <div className="flex flex-col items-center gap-3">
                <CheckCircle className="h-14 w-14 text-green-500 mb-4" aria-hidden />
                <p className="text-lg font-medium text-gray-700">{status}</p>
                <button
                  type="button"
                  className="text-sm text-blue-600 hover:text-blue-800 underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                  onClick={handleManualRedirect}
                >
                  若未自动跳转，请点击此处
                </button>
              </div>
            )}

            {uiState === 'error' && (
              <div className="flex flex-col items-center">
                <AlertCircle className="h-14 w-14 text-red-500 mb-4" aria-hidden />
                <p className="text-lg font-medium text-gray-700 text-center mb-4">{status}</p>
                <button
                  type="button"
                  className="py-2.5 px-6 bg-gray-900 hover:bg-gray-800 text-white rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-offset-2"
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

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
    <div className="w-full max-w-md p-10 space-y-6 bg-white rounded-2xl shadow-xl border border-gray-100">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">登录</h1>
        <div className="flex flex-col items-center justify-center mt-6">
          <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
          <p className="text-lg font-medium text-gray-700">加载中...</p>
        </div>
      </div>
    </div>
  </div>
);

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CallbackContent />
    </Suspense>
  );
}
