import { QueryClient } from '@tanstack/react-query';

/**
 * 全局 React Query 客户端配置
 * 优化的缓存策略和错误处理
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5分钟内数据保持新鲜
      gcTime: 30 * 60 * 1000, // 30分钟后清理缓存
      refetchOnWindowFocus: false, // 避免频繁刷新
      refetchOnReconnect: true, // 网络重连时刷新
      retry: (failureCount, error: any) => {
        // 认证错误不重试
        if (error?.status === 401 || error?.status === 403) return false;

        // 其他错误最多重试2次
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    },
    mutations: {
      retry: false, // 突变操作默认不重试
      onError: (error: any) => {
        // 全局突变错误处理
        if (error?.status === 401) {
          window.location.href = '/auth';
        }
      },
    },
  },
});
