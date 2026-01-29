'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home, Info, Code2, Layers, ChevronDown } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const hasLogged = useRef(false);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    if (!hasLogged.current) {
      hasLogged.current = true;
      console.error('Application error:', error);
    }
  }, [error]);

  const isChunkError =
    error.message?.includes('ChunkLoadError') ||
    error.message?.includes('Loading chunk') ||
    error.message?.includes('Failed to fetch') ||
    error.message?.includes('dynamically imported module');

  const handleReset = () => {
    setIsResetting(true);
    hasLogged.current = false;
    setTimeout(() => {
      reset();
      setIsResetting(false);
    }, 300);
  };

  // 格式化堆栈跟踪
  const formatStack = (stack?: string) => {
    if (!stack) return null;

    return stack
      .split('\n')
      .filter((line) => line.trim())
      .map((line, index) => {
        const isAtLine = line.trim().startsWith('at ');

        return (
          <div
            key={index}
            className={`py-1.5 ${isAtLine ? 'pl-6 text-red-700 text-xs' : 'font-bold text-red-900 text-sm'}`}
          >
            {line}
          </div>
        );
      });
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 px-4 py-16 overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-200/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-orange-200/30 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      <div className="relative w-full max-w-2xl">
        {/* 主卡片 */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 sm:p-12">
          {/* 错误图标 */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-orange-600 rounded-3xl blur-2xl opacity-40 animate-pulse" />
              <div className="relative w-24 h-24 bg-gradient-to-br from-red-500 to-orange-600 rounded-3xl flex items-center justify-center shadow-2xl transform hover:scale-110 transition-transform duration-300">
                <AlertTriangle className="w-12 h-12 text-white animate-pulse" />
              </div>
            </div>
          </div>

          {/* 标题 */}
          <h1 className="text-4xl sm:text-5xl font-bold text-center mb-4 bg-gradient-to-r from-red-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
            {isChunkError ? '页面加载失败' : '哎呀！出错了'}
          </h1>

          {/* 描述 */}
          <p className="text-center text-gray-600 text-lg leading-relaxed max-w-lg mx-auto mb-10">
            {isChunkError
              ? '部分资源加载失败，这通常是由于网络问题或浏览器缓存导致的。请尝试重新加载页面。'
              : '抱歉，应用遇到了一个意外错误。我们已经记录了这个问题，技术团队会尽快处理。'}
          </p>

          {/* 按钮组 */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <button
              onClick={handleReset}
              disabled={isResetting}
              className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-red-500 via-orange-500 to-red-500 hover:from-red-600 hover:via-orange-600 hover:to-red-600 text-white text-base font-bold rounded-2xl shadow-lg shadow-red-500/30 hover:shadow-red-500/50 hover:scale-105 active:scale-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <RefreshCw
                className={`w-5 h-5 ${isResetting ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`}
              />
              <span>{isResetting ? '重试中...' : '重新加载'}</span>
            </button>

            <Link
              href="/"
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 text-base font-semibold rounded-2xl border-2 border-gray-200 hover:border-gray-300 shadow-md hover:shadow-lg transition-all duration-200"
            >
              <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>返回首页</span>
            </Link>
          </div>

          {/* 额外提示 */}
          <div className="text-center">
            <p className="text-sm text-gray-500">
              如果问题持续存在，请
              <a
                href="https://github.com/xun082/DocFlow/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-600 hover:text-red-700 font-semibold hover:underline mx-1"
              >
                联系我们
              </a>
              或在 GitHub 上提交问题
            </p>
          </div>
        </div>

        {/* 开发环境错误详情 */}
        {process.env.NODE_ENV === 'development' && error.message && (
          <div className="mt-8">
            <details className="group bg-white/80 backdrop-blur-xl rounded-2xl border-2 border-red-200/50 shadow-xl overflow-hidden transition-all">
              <summary className="cursor-pointer px-6 py-5 font-bold text-red-900 hover:bg-red-50/50 transition-all flex items-center justify-between gap-3 select-none">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Code2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-base">错误详情</p>
                    <p className="text-xs text-gray-500 font-normal">仅开发环境显示</p>
                  </div>
                </div>
                <ChevronDown className="w-5 h-5 text-red-600 group-open:rotate-180 transition-transform duration-300" />
              </summary>

              <div className="px-6 py-6 space-y-6 bg-gradient-to-br from-white to-red-50/30 border-t-2 border-red-100">
                {/* 错误消息 */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                    </div>
                    <h3 className="font-bold text-red-900">错误消息</h3>
                  </div>
                  <div className="p-5 bg-white rounded-xl border-2 border-red-200 shadow-sm">
                    <p className="text-sm text-red-900 leading-relaxed font-medium break-words">
                      {error.message}
                    </p>
                  </div>
                </div>

                {/* Digest */}
                {error.digest && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Info className="w-4 h-4 text-orange-600" />
                      </div>
                      <h3 className="font-bold text-orange-900">错误 ID</h3>
                    </div>
                    <div className="p-5 bg-white rounded-xl border-2 border-orange-200 shadow-sm">
                      <p className="text-sm text-orange-900 font-mono break-all font-semibold">
                        {error.digest}
                      </p>
                    </div>
                  </div>
                )}

                {/* 堆栈跟踪 */}
                {error.stack && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Layers className="w-4 h-4 text-purple-600" />
                      </div>
                      <h3 className="font-bold text-purple-900">堆栈跟踪</h3>
                    </div>
                    <div className="p-5 bg-white rounded-xl border-2 border-purple-200 shadow-sm max-h-80 overflow-auto scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-purple-50">
                      <div className="font-mono">{formatStack(error.stack)}</div>
                    </div>
                  </div>
                )}

                {/* 开发提示 */}
                <div className="p-5 bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                      <Info className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-blue-900 mb-2">💡 开发提示</p>
                      <p className="text-sm text-blue-800 leading-relaxed">
                        这些详细信息仅在<span className="font-bold">开发环境</span>
                        中显示。在生产环境中，错误会自动上报到 Sentry
                        进行追踪，用户只会看到友好的错误提示界面。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}
