import { ReactNode } from 'react';

export interface ErrorDisplay {
  title: string;
  message: string;
  actionText?: string;
  actionUrl?: string;
}

export interface ErrorPageProps {
  errorDisplay: ErrorDisplay;
  documentId: string;
  errorType: string;
  status?: number;
}

export function ErrorPage({ errorDisplay, documentId, errorType, status }: ErrorPageProps) {
  return (
    <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
          {errorDisplay.title}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{errorDisplay.message}</p>
        <div className="text-xs text-gray-500 dark:text-gray-500 mb-4">
          文档ID: {documentId} | 错误类型: {errorType} {status && `| 状态码: ${status}`}
        </div>
        {errorDisplay.actionUrl ? (
          <a
            href={errorDisplay.actionUrl}
            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors inline-block"
          >
            {errorDisplay.actionText || '重试'}
          </a>
        ) : (
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            重新加载
          </button>
        )}
      </div>
    </div>
  );
}

export function getErrorDisplay(errorType: string, message?: string): ErrorDisplay {
  switch (errorType) {
    case 'AUTH_FAILED':
      return {
        title: '身份验证失败',
        message: '您的登录已过期，请重新登录',
        actionText: '前往登录',
        actionUrl: '/auth',
      };
    case 'NOT_FOUND':
      return {
        title: '文档不存在',
        message: '找不到您要访问的文档，可能已被删除或移动',
        actionText: '返回首页',
        actionUrl: '/dashboard',
      };
    case 'ACCESS_DENIED':
      return {
        title: '访问被拒绝',
        message: '您没有权限访问此文档',
        actionText: '返回首页',
        actionUrl: '/dashboard',
      };
    case 'NETWORK_ERROR':
      return {
        title: '网络错误',
        message: '无法连接到服务器，请检查网络连接',
      };
    default:
      return {
        title: '加载失败',
        message: message || '文档加载时出现未知错误',
      };
  }
}

// 文档结果类型定义
interface DocumentResult {
  data?: any;
  error?: string | null;
  status?: number;
  message?: string;
}

export function useDocumentError(result: DocumentResult, documentId: string): ReactNode {
  if (!result.error) return null;

  const errorDisplay = getErrorDisplay(result.error, result.message);

  return (
    <ErrorPage
      errorDisplay={errorDisplay}
      documentId={documentId}
      errorType={result.error}
      status={result.status}
    />
  );
}
