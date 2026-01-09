'use client';

import { useEffect } from 'react';

import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 记录错误到控制台（生产环境已通过 Sentry 上报）
    console.error('Application error:', error);
  }, [error]);

  // 判断是否是资源加载错误
  const isChunkError =
    error.message.includes('ChunkLoadError') ||
    error.message.includes('Loading chunk') ||
    error.message.includes('Failed to fetch');

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 px-4">
      <div className="mx-auto max-w-md text-center">
        <div className="mb-6 text-6xl">⚠️</div>
        <h1 className="mb-4 text-3xl font-bold text-gray-900">
          {isChunkError ? '页面加载失败' : '出错了'}
        </h1>
        <p className="mb-8 text-gray-600">
          {isChunkError
            ? '部分资源加载失败，请尝试刷新页面。如果问题持续存在，请清除浏览器缓存后重试。'
            : '抱歉，应用遇到了一个错误。我们已经记录了这个问题，请稍后重试。'}
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Button onClick={() => reset()} size="lg" className="bg-blue-600 hover:bg-blue-700">
            重试
          </Button>
          <Button onClick={() => window.location.reload()} size="lg" variant="outline">
            刷新页面
          </Button>
        </div>
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-8 rounded-lg bg-red-50 p-4 text-left">
            <summary className="cursor-pointer font-semibold text-red-900">
              错误详情（仅开发环境显示）
            </summary>
            <pre className="mt-4 overflow-auto text-xs text-red-800">
              {error.message}
              {error.digest && `\n\nDigest: ${error.digest}`}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
