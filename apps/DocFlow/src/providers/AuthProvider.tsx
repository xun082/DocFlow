'use client';

import React, { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { authApi } from '@/services/auth';
import { userQueryKeys } from '@/hooks/useUserQuery';
import { hasValidAuthToken, clearAuthData } from '@/utils';

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * 认证提供者
 * 在应用启动时预加载用户信息，提供无缝的用户体验
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const queryClient = useQueryClient();

  useEffect(() => {
    // 仅在有有效 token 时预加载
    if (!hasValidAuthToken()) return;

    // 预取用户数据，利用 React Query 缓存
    queryClient.prefetchQuery({
      queryKey: userQueryKeys.profile(),
      queryFn: async () => {
        const { data, error } = await authApi.getCurrentUser();

        if (error || !data?.data) {
          clearAuthData();
          throw new Error(error || 'Failed to fetch user');
        }

        return data.data;
      },
    });
  }, [queryClient]);

  return <>{children}</>;
}
