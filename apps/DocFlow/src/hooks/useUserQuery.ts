import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import authApi from '@/services/auth';
import UserApi from '@/services/users';
import type { User } from '@/types/auth';
import { clearAuthData, hasValidAuthToken } from '@/utils';

/**
 * User Query Keys
 * 集中管理用户相关的查询键
 */
export const userQueryKeys = {
  all: ['user'] as const,
  profile: () => [...userQueryKeys.all, 'profile'] as const,
};

/**
 * LocalStorage 持久化工具
 */
const USER_STORAGE_KEY = 'cached_user_profile';

const storage = {
  get: (): User | null => {
    if (typeof window === 'undefined') return null;

    try {
      const cached = localStorage.getItem(USER_STORAGE_KEY);

      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  },
  set: (user: User) => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } catch (error) {
      console.warn('Failed to cache user profile:', error);
    }
  },
  clear: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(USER_STORAGE_KEY);
  },
};

/**
 * 获取当前用户信息
 * 支持本地缓存和自动持久化
 */
export function useUserQuery() {
  return useQuery({
    queryKey: userQueryKeys.profile(),
    queryFn: async (): Promise<User> => {
      const { data, error } = await authApi.getCurrentUser();

      if (error || !data?.data) {
        throw new Error(error || 'Failed to fetch user');
      }

      // 自动持久化到本地存储
      storage.set(data.data);

      return data.data;
    },
    // 使用本地缓存作为占位数据，实现无缝加载
    placeholderData: () => storage.get() ?? undefined,
    enabled: hasValidAuthToken(), // 仅在有 token 时查询
    staleTime: 5 * 60 * 1000, // 5分钟
    gcTime: 30 * 60 * 1000, // 30分钟
  });
}

/**
 * 获取缓存的用户数据
 */
export function getLocalUserData(queryClient: ReturnType<typeof useQueryClient>): User | undefined {
  return queryClient.getQueryData<User>(userQueryKeys.profile()) ?? storage.get() ?? undefined;
}

// 更新用户信息的 mutation hook
export function useUpdateUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Partial<User>) => {
      return await UserApi.updateUser(updates);
    },
    onMutate: async (updates) => {
      // 取消正在进行的查询以避免冲突
      await queryClient.cancelQueries({ queryKey: userQueryKeys.profile() });

      // 获取当前用户数据
      const previousUser = queryClient.getQueryData<User>(userQueryKeys.profile());

      // 乐观更新 - 立即更新缓存
      if (previousUser) {
        queryClient.setQueryData<User>(userQueryKeys.profile(), {
          ...previousUser,
          ...updates,
        });
      }

      // 返回回滚数据
      return { previousUser };
    },
    onError: (error, variables, context) => {
      // 回滚到之前的数据
      if (context?.previousUser) {
        queryClient.setQueryData(userQueryKeys.profile(), context.previousUser);
      }

      console.error('更新用户信息失败:', error);
      toast.error('更新失败，请重试');
    },
    onSuccess: (data, variables) => {
      // 成功后重新获取最新数据
      queryClient.invalidateQueries({ queryKey: userQueryKeys.profile() });

      const updatedFieldsCount = Object.keys(variables).length;
      toast.success(`已更新 ${updatedFieldsCount} 个字段`);
    },
  });
}

/**
 * 登出 Mutation
 * 清理所有缓存和认证数据
 */
export function useLogoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      // 清理 React Query 缓存
      queryClient.removeQueries({ queryKey: userQueryKeys.all });

      // 清理本地存储
      storage.clear();

      // 清理认证数据
      clearAuthData();

      toast.success('已成功退出登录');

      // 重定向到登录页
      window.location.href = '/auth';
    },
    onError: (error) => {
      console.error('Logout failed:', error);
      toast.error('退出登录失败，请重试');
    },
  });
}
