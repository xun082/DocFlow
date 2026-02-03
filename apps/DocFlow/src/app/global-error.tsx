'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    // 仅在生产环境上报到 Sentry
    if (process.env.NODE_ENV === 'production') {
      Sentry.captureException(error);
    }
  }, [error]);

  return (
    <html lang="zh-CN">
      <body>
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 px-4">
          <div className="w-full max-w-xl text-center">
            {/* 错误图标 */}
            <div className="mb-8 inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-red-500 to-orange-600 rounded-3xl shadow-2xl">
              <AlertTriangle className="w-12 h-12 text-white animate-pulse" />
            </div>

            {/* 标题 */}
            <h1 className="mb-4 text-5xl font-bold bg-gradient-to-r from-red-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
              系统错误
            </h1>

            {/* 描述 */}
            <p className="mb-8 text-lg text-gray-600 leading-relaxed max-w-md mx-auto">
              抱歉，应用遇到了一个严重错误。我们已经记录了这个问题，技术团队会尽快处理。
            </p>

            {/* 按钮 */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
              <button
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.location.reload();
                  }
                }}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-bold rounded-2xl shadow-lg transition-all"
              >
                <RefreshCw className="w-5 h-5" />
                <span>重新加载</span>
              </button>

              <a
                href="/"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-2xl border-2 border-gray-200 shadow-md transition-all"
              >
                <Home className="w-5 h-5" />
                <span>返回首页</span>
              </a>
            </div>

            {/* 开发环境错误详情 */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-8 p-6 bg-white/80 backdrop-blur-xl rounded-2xl border-2 border-red-200 shadow-xl text-left">
                <h3 className="font-bold text-red-900 mb-3">开发环境 - 错误详情</h3>
                <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                  <p className="text-sm text-red-900 font-medium break-words">{error.message}</p>
                  {error.digest && (
                    <p className="mt-2 text-xs text-red-700 font-mono">Error ID: {error.digest}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
