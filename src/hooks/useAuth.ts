import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { userQueryKeys } from './useUserQuery';

import authApi from '@/services/auth';
import type { User, AuthResponse, EmailPasswordRegisterParams } from '@/types/auth';
import { saveAuthData } from '@/utils';

// 邮箱验证码登录参数（扩展）
interface EmailLoginParams {
  email: string;
  code: string;
  redirectUrl?: string;
}

// GitHub 回调参数
interface GitHubCallbackParams {
  code: string;
}

// 通用的登录成功处理函数
const handleAuthSuccess = async (
  authData: AuthResponse,
  queryClient: ReturnType<typeof useQueryClient>,
  router: ReturnType<typeof useRouter>,
  redirectUrl?: string,
) => {
  // 1. 保存认证数据
  saveAuthData(authData);

  // 2. 获取用户资料
  try {
    const { data: userResponse, error } = await authApi.getCurrentUser();

    if (error || !userResponse?.data) {
      console.error('获取用户资料失败:', error);
      toast.warning('获取用户资料失败，但登录成功');
    } else {
      const user = userResponse.data;

      // 3. 立即更新 React Query 缓存
      queryClient.setQueryData<User>(userQueryKeys.profile(), user);
    }
  } catch (error) {
    console.warn('处理用户资料时出错:', error);
    toast.warning('获取用户资料失败，但登录成功');
  }

  // 4. 跳转到目标页面
  const targetUrl = redirectUrl || '/dashboard';
  setTimeout(() => {
    router.push(targetUrl);
  }, 1000);
};

// 邮箱验证码登录 hook
export function useEmailLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (params: EmailLoginParams) => {
      const { email, code, redirectUrl } = params;
      const { data, error } = await authApi.emailCodeLogin({ email, code });

      if (error) {
        throw new Error(error);
      }

      if (!data || data.code !== 200) {
        throw new Error(data?.message || '登录失败');
      }

      return { authData: data.data, redirectUrl };
    },
    onSuccess: async ({ authData, redirectUrl }) => {
      toast.success('登录成功！', {
        description: '正在获取用户资料...',
      });

      await handleAuthSuccess(authData, queryClient, router, redirectUrl);
    },
    onError: (error) => {
      console.error('邮箱登录失败:', error);
      toast.error(error instanceof Error ? error.message : '登录失败');
    },
  });
}

// GitHub 登录 hook
export function useGitHubLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async ({ code, redirectUrl }: GitHubCallbackParams & { redirectUrl?: string }) => {
      const { data, error } = await authApi.githubCallback(code);

      if (error) {
        throw new Error(error);
      }

      if (!data || data.code !== 200) {
        throw new Error(data?.message || 'GitHub登录失败');
      }

      return { authData: data.data, redirectUrl };
    },
    onSuccess: async ({ authData, redirectUrl }) => {
      toast.success('GitHub登录成功！', {
        description: '正在获取用户资料...',
      });

      await handleAuthSuccess(authData, queryClient, router, redirectUrl);
    },
    onError: (error) => {
      console.error('GitHub登录失败:', error);
      toast.error(error instanceof Error ? error.message : 'GitHub登录失败');
    },
  });
}

// 通用的 Token 登录 hook（用于直接 token 认证）
export function useTokenLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async ({
      authData,
      redirectUrl,
    }: {
      authData: AuthResponse;
      redirectUrl?: string;
    }) => {
      return { authData, redirectUrl };
    },
    onSuccess: async ({ authData, redirectUrl }) => {
      toast.success('登录成功！', {
        description: '正在获取用户资料...',
      });

      await handleAuthSuccess(authData, queryClient, router, redirectUrl);
    },
    onError: (error) => {
      console.error('Token登录失败:', error);
      toast.error(error instanceof Error ? error.message : '登录失败');
    },
  });
}

// 邮箱密码登录参数（扩展）
interface EmailPasswordLoginParams {
  email: string;
  password: string;
  redirectUrl?: string;
}

// 邮箱密码登录 hook
export function useEmailPasswordLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (params: EmailPasswordLoginParams) => {
      const { email, password, redirectUrl } = params;
      const { data, error } = await authApi.emailPasswordLogin({ email, password });

      if (error) {
        throw new Error(error);
      }

      if (!data || data.code !== 200) {
        throw new Error(data?.message || '登录失败');
      }

      return { authData: data.data, redirectUrl };
    },
    onSuccess: async ({ authData, redirectUrl }) => {
      toast.success('登录成功！', { description: '正在获取用户资料...' });
      await handleAuthSuccess(authData, queryClient, router, redirectUrl);
    },
    onError: (error) => {
      console.error('邮箱密码登录失败:', error);
      toast.error(error instanceof Error ? error.message : '登录失败');
    },
  });
}

// 使用公共类型 EmailPasswordRegisterParams（src/types/auth.ts）

// 邮箱密码注册 hook
export function useEmailPasswordRegister() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (params: EmailPasswordRegisterParams) => {
      const { email, password, confirmPassword, redirectUrl } = params;
      const { data, error } = await authApi.emailPasswordRegister({
        email,
        password,
        confirmPassword,
      });

      if (error) {
        throw new Error(error);
      }

      if (!data || data.code !== 200) {
        throw new Error(data?.message || '注册失败');
      }

      return { authData: data.data, redirectUrl };
    },
    onSuccess: async ({ authData, redirectUrl }) => {
      if (authData?.token) {
        toast.success('注册成功，已自动登录！', { description: '正在获取用户资料...' });
        await handleAuthSuccess(authData, queryClient, router, redirectUrl);
      } else {
        toast.success('注册成功！', { description: '请使用邮箱密码进行登录' });
      }
    },
    onError: (error) => {
      console.error('邮箱密码注册失败:', error);
      toast.error(error instanceof Error ? error.message : '注册失败');
    },
  });
}
