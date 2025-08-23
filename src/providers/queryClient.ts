import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 启用旧数据保持，实现平滑过渡
      staleTime: 5 * 60 * 1000, // 5分钟
      gcTime: 10 * 60 * 1000, // 10分钟 (previously cacheTime)
      retry: (failureCount, error: any) => {
        // 不重试401(未授权)和403(禁止访问)错误
        if (error?.status === 401 || error?.status === 403) {
          return false;
        }

        // 其他错误最多重试2次
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      // 全局错误处理
      throwOnError: false, // 不抛出错误到组件层
    },
    mutations: {
      retry: (failureCount, error: any) => {
        // 对于突变操作，不重试认证相关错误
        if (error?.status === 401 || error?.status === 403) {
          return false;
        }

        return failureCount < 1;
      },
      retryDelay: 1000,
      // 突变操作的全局错误处理
      throwOnError: false,
    },
  },
});
