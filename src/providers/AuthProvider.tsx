'use client';

import React, { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { authApi } from '@/services/auth';
import { userQueryKeys } from '@/hooks/useUserQuery';
import { hasValidAuthToken, clearAuthData } from '@/utils';

interface AuthProviderProps {
  children: React.ReactNode;
}

// 认证提供者，在应用启动时预加载用户数据
export function AuthProvider({ children }: AuthProviderProps) {
  const queryClient = useQueryClient();

  useEffect(() => {
    // 在应用启动时尝试预加载用户数据
    const initializeAuth = async () => {
      try {
        // 使用新的token验证函数
        if (!hasValidAuthToken()) {
          return;
        }

        // 简单预取数据，让 useUserQuery 的 placeholderData 处理本地缓存
        queryClient.prefetchQuery({
          queryKey: userQueryKeys.profile(),
          queryFn: async () => {
            const { data, error } = await authApi.getCurrentUser({
              // 添加静默错误处理，避免在控制台显示错误
              onError: () => {}, // 静默处理错误
              unauthorized: () => {
                // 清理无效的token
                clearAuthData();
                localStorage.removeItem('user_profile');
              },
              forbidden: () => {},
              serverError: () => {},
              networkError: () => {},
            });

            if (error || !data?.data) {
              throw new Error(error || '获取用户信息失败');
            }

            // 更新本地存储
            localStorage.setItem('user_profile', JSON.stringify(data.data));

            return data.data;
          },
          staleTime: 5 * 60 * 1000, // 5分钟
          retry: false, // 不重试，避免重复请求
        });
      } catch (error) {
        // 静默处理预取错误，不影响应用启动
        console.warn('预取用户数据失败:', error);
      }
    };

    initializeAuth();
  }, [queryClient]);

  return <>{children}</>;
}
