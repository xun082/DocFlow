'use client';

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';

import { ErrorPage, getErrorDisplay } from '../_components/error';
import { DocumentClient } from '../_components/DocumentClient';

import { getCookie } from '@/utils/cookie';
import { DocumentApi } from '@/services/document';

// 文档结果类型定义
interface DocumentResult {
  data?: any;
  error?: string | null;
  status?: number;
  message?: string;
}

// 简单的错误边界组件
function SimpleErrorBoundary({
  children,
  fallback,
  onError,
}: {
  children: React.ReactNode;
  fallback: React.ReactNode;
  onError?: (error: Error) => void;
}) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      setHasError(true);
      onError?.(new Error(event.message));
    };

    window.addEventListener('error', handleError);

    return () => window.removeEventListener('error', handleError);
  }, [onError]);

  if (hasError) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// 优化的加载动画组件 - 添加无障碍支持
function LoadingSpinner() {
  return (
    <div
      className="h-screen flex items-center justify-center bg-white dark:bg-gray-900"
      role="status"
      aria-live="polite"
      aria-label="正在加载文档编辑器"
    >
      <div className="text-center">
        <div
          className="inline-block animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mb-4"
          aria-hidden="true"
        ></div>
        <p className="text-lg text-gray-600 dark:text-gray-400">正在加载文档编辑器...</p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">首次加载可能需要几秒钟</p>
        {/* 无障碍支持 - 屏幕阅读器 */}
        <span className="sr-only">文档编辑器正在加载中，请稍候</span>
      </div>
    </div>
  );
}

// 文档状态枚举
enum DocumentStatus {
  CHECKING_AUTH = 'checking_auth',
  LOADING = 'loading',
  READY = 'ready',
  ERROR = 'error',
  UNAUTHORIZED = 'unauthorized',
}

interface DocumentState {
  status: DocumentStatus;
  documentData: any;
  initialContent: any;
  error: DocumentResult | null;
  title: string;
}

export default function DocumentPage() {
  const router = useRouter();
  const params = useParams();
  const documentId = params?.room as string;

  // 状态管理
  const [state, setState] = useState<DocumentState>({
    status: DocumentStatus.CHECKING_AUTH,
    documentData: null,
    initialContent: null,
    error: null,
    title: `协作文档 ${documentId}`,
  });

  // 缓存管理
  const [documentCache, setDocumentCache] = useState<Map<string, any>>(new Map());
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  // 组件挂载状态追踪
  const isMountedRef = useRef<boolean>(false);

  // 认证检查
  const checkAuth = useCallback(() => {
    const authToken = getCookie('auth_token');

    if (!authToken) {
      // 保存当前路径用于登录后跳转
      const currentPath = window.location.pathname + window.location.search;

      sessionStorage.setItem('redirect_after_auth', currentPath);
      router.replace('/auth');

      return false;
    }

    return true;
  }, [router]);

  // 客户端挂载状态
  useEffect(() => {
    isMountedRef.current = true;
    setIsMounted(true);

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // 离线检测 - 客户端安全
  useEffect(() => {
    if (!isMounted) return;

    // 确保在客户端环境中执行
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return;

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    // 设置初始状态
    setIsOffline(!navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isMounted]);

  // 获取文档数据（带缓存和离线支持）
  const fetchDocument = useCallback(async () => {
    if (!isMountedRef.current || !documentId) {
      return;
    }

    const authToken = getCookie('auth_token');

    if (!authToken) {
      if (!isMountedRef.current) return;
      setState((prev) => ({ ...prev, status: DocumentStatus.UNAUTHORIZED }));

      return;
    }

    if (!isMountedRef.current) return;
    setState((prev) => ({ ...prev, status: DocumentStatus.LOADING }));

    try {
      // 检查缓存 - 使用当前的引用而不是依赖
      const currentCache = documentCache.get(documentId);

      // 动态检查网络状态
      const isCurrentlyOffline =
        isMounted && typeof navigator !== 'undefined' ? !navigator.onLine : false;

      if (currentCache && isCurrentlyOffline) {
        if (!isMountedRef.current) return;
        setState((prev) => ({
          ...prev,
          status: DocumentStatus.READY,
          documentData: currentCache.documentData,
          initialContent: currentCache.content,
          title: currentCache.title,
          error: null,
        }));

        return;
      }

      const result = await DocumentApi.GetDocumentContent(parseInt(documentId));

      // 检查组件是否仍然挂载
      if (!isMountedRef.current) return;

      if (result.error) {
        let errorType = 'API_ERROR';
        let errorMessage = result.error;

        if (result.status === 401) {
          errorType = 'AUTH_FAILED';
          errorMessage = '认证失败，请重新登录';
        } else if (result.status === 403) {
          errorType = 'PERMISSION_DENIED';
          errorMessage = '没有权限访问此文档';
        } else if (result.status === 404) {
          errorType = 'NOT_FOUND';
          errorMessage = '文档不存在或已被删除';
        }

        if (errorType === 'AUTH_FAILED') {
          if (!isMountedRef.current) return;
          setState((prev) => ({ ...prev, status: DocumentStatus.UNAUTHORIZED }));

          return;
        }

        // 如果网络错误且有缓存，使用缓存
        if (errorType === 'NETWORK_ERROR' && currentCache) {
          if (!isMountedRef.current) return;
          setState((prev) => ({
            ...prev,
            status: DocumentStatus.READY,
            documentData: currentCache.documentData,
            initialContent: currentCache.content,
            title: currentCache.title,
            error: null,
          }));

          return;
        }

        if (!isMountedRef.current) return;
        setState((prev) => ({
          ...prev,
          status: DocumentStatus.ERROR,
          error: { error: errorType, message: errorMessage, status: result.status },
        }));

        return;
      }

      if (!result.data?.data) {
        if (!isMountedRef.current) return;
        setState((prev) => ({
          ...prev,
          status: DocumentStatus.ERROR,
          error: { error: 'INVALID_DATA', message: '响应数据格式错误' },
        }));

        return;
      }

      const documentData = result.data.data as any;
      const content = documentData.content;
      const title = documentData.title;

      // 缓存数据
      setDocumentCache((prev) =>
        new Map(prev).set(documentId, {
          documentData,
          content,
          title,
          cachedAt: Date.now(),
        }),
      );

      // 更新页面标题 - 只在客户端执行
      if (typeof document !== 'undefined') {
        document.title = title;
      }

      if (!isMountedRef.current) return;
      setState((prev) => ({
        ...prev,
        status: DocumentStatus.READY,
        documentData,
        initialContent: content,
        title,
        error: null,
      }));
    } catch (error) {
      console.error('文档加载失败:', error);

      // 尝试使用缓存数据
      const currentCache = documentCache.get(documentId);

      if (currentCache) {
        if (!isMountedRef.current) return;
        setState((prev) => ({
          ...prev,
          status: DocumentStatus.READY,
          documentData: currentCache.documentData,
          initialContent: currentCache.content,
          title: currentCache.title,
          error: null,
        }));

        return;
      }

      if (!isMountedRef.current) return;
      setState((prev) => ({
        ...prev,
        status: DocumentStatus.ERROR,
        error: {
          error: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : '网络连接失败',
        },
      }));
    }
  }, [documentId, isMounted]); // 移除 documentCache 依赖避免循环

  // 重试逻辑
  const retry = useCallback(() => {
    if (state.status === DocumentStatus.UNAUTHORIZED) {
      if (!checkAuth()) return;
    }

    fetchDocument();
  }, [state.status, checkAuth, fetchDocument]);

  // 初始化 - 只在客户端挂载且 documentId 存在时执行，并且只执行一次
  useEffect(() => {
    if (!isMounted || !documentId) return;

    // 避免重复加载 - 如果已经在加载或者已经成功，就不再加载
    if (state.status !== DocumentStatus.CHECKING_AUTH) {
      return;
    }

    if (!checkAuth()) return;
    fetchDocument();
  }, [documentId, isMounted, state.status]); // 添加 state.status 确保只在初始状态时执行

  // 注：移除预加载逻辑，因为已改为静态导入

  // 内存管理 - 清理过期缓存
  useEffect(() => {
    const cleanupInterval = setInterval(
      () => {
        const now = Date.now();
        const maxAge = 30 * 60 * 1000; // 30分钟

        setDocumentCache((prev) => {
          const newCache = new Map(prev);

          for (const [key, value] of newCache.entries()) {
            if (now - value.cachedAt > maxAge) {
              newCache.delete(key);
            }
          }

          return newCache;
        });
      },
      5 * 60 * 1000,
    ); // 每5分钟清理一次

    return () => clearInterval(cleanupInterval);
  }, []);

  // 注：移除预取逻辑以避免无意义的请求循环

  // 错误边界处理
  const errorDisplay = useMemo(() => {
    if (!state.error) return null;

    return getErrorDisplay(state.error.error || 'UNKNOWN_ERROR', state.error.message);
  }, [state.error]);

  // 增强的键盘快捷键和无障碍支持
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + R 刷新
      if ((e.ctrlKey || e.metaKey) && e.key === 'r' && state.status === DocumentStatus.ERROR) {
        e.preventDefault();
        retry();
      }

      // Escape 键关闭错误对话框或返回
      if (e.key === 'Escape' && state.status === DocumentStatus.ERROR) {
        router.back();
      }

      // F5 重新加载
      if (e.key === 'F5' && state.status === DocumentStatus.ERROR) {
        e.preventDefault();
        retry();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [retry, state.status, router]);

  // 渲染逻辑
  const renderContent = () => {
    switch (state.status) {
      case DocumentStatus.CHECKING_AUTH:
      case DocumentStatus.LOADING:
        return <LoadingSpinner />;

      case DocumentStatus.UNAUTHORIZED:
        return (
          <ErrorPage
            errorDisplay={{
              title: '需要登录',
              message: '请先登录以访问文档',
              actionText: '前往登录',
              actionUrl: '/auth',
            }}
            documentId={documentId}
            errorType="UNAUTHORIZED"
          />
        );

      case DocumentStatus.ERROR:
        if (!errorDisplay) return <LoadingSpinner />;

        return (
          <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                {errorDisplay.title}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {errorDisplay.message}
              </p>
              <div className="text-xs text-gray-500 dark:text-gray-500 mb-4">
                文档ID: {documentId}
              </div>
              <div className="space-y-2">
                <button
                  onClick={retry}
                  className="w-full px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                  重试
                </button>
                {errorDisplay.actionUrl && (
                  <a
                    href={errorDisplay.actionUrl}
                    className="block w-full px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                  >
                    {errorDisplay.actionText || '返回'}
                  </a>
                )}
              </div>
            </div>
          </div>
        );

      case DocumentStatus.READY:
        return (
          <div className="w-full h-screen">
            {/* 离线状态指示器 - 只在客户端挂载后显示 */}
            {isMounted && isOffline && (
              <div className="fixed top-0 left-0 right-0 z-50 bg-orange-500 text-white text-center py-2 text-sm">
                ⚠️ 离线模式
              </div>
            )}

            {/* 主要内容 */}
            <div className="w-full h-full">
              <SimpleErrorBoundary
                fallback={
                  <div className="h-screen flex items-center justify-center">
                    <div className="text-center">
                      <h2 className="text-xl font-semibold mb-4">编辑器错误</h2>
                      <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        重新加载
                      </button>
                    </div>
                  </div>
                }
                onError={(error: Error) => {
                  console.error('Editor error:', error);
                }}
              >
                <DocumentClient
                  documentId={documentId}
                  initialContent={state.initialContent}
                  enableCollaboration={true}
                  isOffline={isOffline}
                />
              </SimpleErrorBoundary>
            </div>
          </div>
        );

      default:
        return <LoadingSpinner />;
    }
  };

  return renderContent();
}
