'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import {
  EyeIcon,
  EyeOffIcon,
  FileTextIcon,
  LockIcon,
  AlertTriangleIcon,
  RefreshCwIcon,
} from 'lucide-react';

import DocumentApi from '@/services/document';
import { cn } from '@/utils/utils';

interface SharePageState {
  loading: boolean;
  requiresPassword: boolean;
  hasError: boolean;
  errorMessage: string;
  errorType: 'password' | 'notFound' | 'expired' | 'network' | 'unknown';
  documentData?: {
    id: number;
    title: string;
    type: 'FILE' | 'FOLDER';
    owner: {
      name: string;
      avatar_url: string;
    };
    permission: string;
  };
}

export default function SharePage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const linkId = params.id as string;
  const urlPassword = searchParams.get('password');

  const [state, setState] = useState<SharePageState>({
    loading: true,
    requiresPassword: false,
    hasError: false,
    errorMessage: '',
    errorType: 'unknown',
  });

  const [password, setPassword] = useState(urlPassword || '');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 重置状态并重新尝试
  const resetAndRetry = useCallback(() => {
    setState({
      loading: true,
      requiresPassword: false,
      hasError: false,
      errorMessage: '',
      errorType: 'unknown',
    });
    setPassword('');
    setIsSubmitting(false);
  }, []);

  // 尝试访问分享文档
  const attemptAccess = useCallback(
    async (passwordToTry?: string) => {
      setIsSubmitting(true);

      const response = await DocumentApi.AccessSharedDocument(
        {
          linkId,
          password: passwordToTry,
        },
        {
          onError: (error: any) => {
            console.error('访问分享文档失败:', error);

            // 详细的错误分类处理
            if (error?.status === 401 || error?.status === 403) {
              setState((prev) => ({
                ...prev,
                loading: false,
                requiresPassword: true,
                hasError: true,
                errorMessage: passwordToTry ? '密码错误，请重新输入' : '此文档需要密码才能访问',
                errorType: 'password',
              }));

              // 如果密码错误，清空密码框
              if (passwordToTry) {
                setPassword('');
              }
            } else if (error?.status === 404) {
              setState((prev) => ({
                ...prev,
                loading: false,
                hasError: true,
                errorMessage: '分享链接不存在或已过期',
                errorType: 'notFound',
              }));
            } else if (error?.status === 410) {
              setState((prev) => ({
                ...prev,
                loading: false,
                hasError: true,
                errorMessage: '分享链接已过期',
                errorType: 'expired',
              }));
            } else if (!error?.status) {
              setState((prev) => ({
                ...prev,
                loading: false,
                hasError: true,
                errorMessage: '网络连接失败，请检查网络后重试',
                errorType: 'network',
              }));
            } else {
              setState((prev) => ({
                ...prev,
                loading: false,
                hasError: true,
                errorMessage: '访问失败，请稍后重试',
                errorType: 'unknown',
              }));
            }

            // 显示错误提示
            toast.error('访问失败', {
              description: error?.message || '请检查链接是否正确',
            });

            setIsSubmitting(false);
          },
        },
      );

      // 成功获取到数据
      if (response?.data?.code === 200 && response?.data?.data) {
        const documentData = response.data.data;

        setState((prev) => ({
          ...prev,
          loading: false,
          requiresPassword: false,
          hasError: false,
          errorMessage: '',
          errorType: 'unknown',
          documentData: {
            id: documentData.id,
            title: documentData.title,
            type: documentData.type,
            owner: {
              name: documentData.owner.name,
              avatar_url: documentData.owner.avatar_url,
            },
            permission: documentData.permission,
          },
        }));

        toast.success('文档验证成功！', {
          description: `您可以${documentData.permission === 'VIEW' ? '查看' : '编辑'}"${documentData.title}"`,
        });
      }

      setIsSubmitting(false);
    },
    [linkId, setPassword],
  );

  // 初次加载时尝试访问
  useEffect(() => {
    if (linkId) {
      // 如果URL中有密码参数，直接尝试使用
      attemptAccess(urlPassword || undefined);
    }
  }, [linkId, urlPassword, attemptAccess]);

  // 处理密码提交
  const handlePasswordSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (!password.trim()) {
        toast.error('请输入访问密码');

        return;
      }

      attemptAccess(password);
    },
    [password, attemptAccess],
  );

  // 处理键盘事件
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handlePasswordSubmit(e as any);
      }
    },
    [handlePasswordSubmit],
  );

  // 处理重试
  const handleRetry = useCallback(() => {
    resetAndRetry();
    setTimeout(() => {
      attemptAccess(urlPassword || undefined);
    }, 100);
  }, [resetAndRetry, attemptAccess, urlPassword]);

  // 加载中状态
  if (state.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">正在验证分享链接...</h2>
            <p className="text-gray-600">请稍候，我们正在为您加载文档</p>
          </div>
        </div>
      </div>
    );
  }

  // 错误状态（非密码错误）
  if (state.hasError && !state.requiresPassword) {
    const getErrorIcon = () => {
      switch (state.errorType) {
        case 'notFound':
        case 'expired':
          return <AlertTriangleIcon className="h-8 w-8 text-orange-500" />;
        case 'network':
          return <RefreshCwIcon className="h-8 w-8 text-blue-500" />;
        default:
          return <AlertTriangleIcon className="h-8 w-8 text-red-500" />;
      }
    };

    const getErrorColor = () => {
      switch (state.errorType) {
        case 'notFound':
        case 'expired':
          return 'from-orange-50 to-yellow-100';
        case 'network':
          return 'from-blue-50 to-indigo-100';
        default:
          return 'from-red-50 to-pink-100';
      }
    };

    const getIconBgColor = () => {
      switch (state.errorType) {
        case 'notFound':
        case 'expired':
          return 'bg-orange-100';
        case 'network':
          return 'bg-blue-100';
        default:
          return 'bg-red-100';
      }
    };

    return (
      <div
        className={`min-h-screen bg-gradient-to-br ${getErrorColor()} flex items-center justify-center`}
      >
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div
              className={`w-16 h-16 ${getIconBgColor()} rounded-full flex items-center justify-center mx-auto mb-4`}
            >
              {getErrorIcon()}
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">无法访问文档</h2>
            <p className="text-gray-600 mb-6">{state.errorMessage}</p>

            <div className="space-y-3">
              {/* 重试按钮 */}
              <button
                onClick={handleRetry}
                disabled={isSubmitting}
                className="w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    重试中...
                  </div>
                ) : (
                  <>
                    <RefreshCwIcon className="h-4 w-4 mr-2" />
                    重新尝试
                  </>
                )}
              </button>

              {/* 返回首页按钮 */}
              <button
                onClick={() => (window.location.href = '/')}
                className="w-full px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                返回首页
              </button>
            </div>

            {/* 错误详情和建议 */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg text-left">
              <h3 className="text-sm font-medium text-gray-800 mb-2">可能的解决方案：</h3>
              <ul className="text-xs text-gray-600 space-y-1">
                {state.errorType === 'notFound' && (
                  <>
                    <li>• 检查分享链接是否完整</li>
                    <li>• 确认链接未被删除</li>
                    <li>• 联系分享者确认链接状态</li>
                  </>
                )}
                {state.errorType === 'expired' && (
                  <>
                    <li>• 分享链接已过期</li>
                    <li>• 请联系分享者重新生成链接</li>
                  </>
                )}
                {state.errorType === 'network' && (
                  <>
                    <li>• 检查网络连接</li>
                    <li>• 刷新页面重试</li>
                    <li>• 稍后再试</li>
                  </>
                )}
                {state.errorType === 'unknown' && (
                  <>
                    <li>• 刷新页面重试</li>
                    <li>• 检查网络连接</li>
                    <li>• 联系技术支持</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 需要密码验证
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
        {/* 成功访问文档 */}
        {state.documentData ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileTextIcon className="h-8 w-8 text-green-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">文档访问成功</h2>
            <p className="text-gray-600 mb-6">
              您现在可以{state.documentData.permission === 'VIEW' ? '查看' : '编辑'}此文档
            </p>

            {/* 文档信息卡片 */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <FileTextIcon className="h-6 w-6 text-blue-500" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-gray-800">{state.documentData.title}</p>
                  <p className="text-sm text-gray-600">
                    {state.documentData.type === 'FILE' ? '文档' : '文件夹'} • 由{' '}
                    {state.documentData.owner.name} 分享
                  </p>
                  <p className="text-xs text-blue-600 capitalize">
                    {state.documentData.permission === 'VIEW'
                      ? '查看权限'
                      : state.documentData.permission === 'EDIT'
                        ? '编辑权限'
                        : state.documentData.permission === 'COMMENT'
                          ? '评论权限'
                          : state.documentData.permission === 'MANAGE'
                            ? '管理权限'
                            : '完全权限'}
                  </p>
                </div>
                {state.documentData.owner.avatar_url && (
                  <img
                    src={state.documentData.owner.avatar_url}
                    alt={state.documentData.owner.name}
                    className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                  />
                )}
              </div>
            </div>

            <div className="space-y-3">
              {/* 打开文档按钮 */}
              <button
                onClick={() => {
                  window.open(`/docs/${state.documentData!.id}`, '_blank');
                }}
                className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
              >
                <FileTextIcon className="h-4 w-4 mr-2" />
                打开文档
              </button>

              {/* 返回首页按钮 */}
              <button
                onClick={() => (window.location.href = '/')}
                className="w-full py-2 px-4 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
              >
                返回首页
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* 密码验证界面 */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <LockIcon className="h-8 w-8 text-blue-500" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">受密码保护的文档</h2>
              <p className="text-gray-600">请输入访问密码以查看此文档</p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              {/* 密码输入框 */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  访问密码
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="请输入访问密码"
                    className={cn(
                      'w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                      state.hasError && state.errorMessage.includes('密码')
                        ? 'border-red-300 bg-red-50'
                        : 'border-gray-300',
                    )}
                    autoFocus
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                    disabled={isSubmitting}
                  >
                    {showPassword ? (
                      <EyeOffIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {state.hasError && state.errorMessage.includes('密码') && (
                  <p className="mt-2 text-sm text-red-600">{state.errorMessage}</p>
                )}
              </div>

              {/* 提交按钮 */}
              <button
                type="submit"
                disabled={isSubmitting || !password.trim()}
                className={cn(
                  'w-full py-3 px-4 rounded-lg font-medium transition-colors',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                  isSubmitting || !password.trim()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700',
                )}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    验证中...
                  </div>
                ) : (
                  '访问文档'
                )}
              </button>

              {/* 重新尝试不用密码访问 */}
              <button
                type="button"
                onClick={() => {
                  setPassword('');
                  resetAndRetry();
                  setTimeout(() => {
                    attemptAccess();
                  }, 100);
                }}
                disabled={isSubmitting}
                className="w-full py-2 px-4 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50"
              >
                重新尝试访问（不使用密码）
              </button>
            </form>

            {/* 帮助信息 */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500 mb-2">如果您没有访问密码，请联系文档分享者</p>
              <button
                onClick={() => (window.location.href = '/')}
                className="text-xs text-blue-600 hover:text-blue-700 hover:underline"
              >
                返回首页
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
