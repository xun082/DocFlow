import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { userQueryKeys } from './useUserQuery';

import authApi from '@/services/auth';
import type { User, AuthResponse, EmailPasswordRegisterParams } from '@/types/auth';
import { saveAuthData } from '@/utils';

// ---------------------------------------------------------------------------
// 常量与类型
// ---------------------------------------------------------------------------

const REDIRECT_DELAY_MS = 1000;
const REDIRECT_FALLBACK_CHECK_MS = 500;
const AUTH_CALLBACK_PATH = '/auth/callback';
const DEFAULT_REDIRECT_URL = '/dashboard';

interface EmailLoginParams {
  email: string;
  code: string;
  redirectUrl?: string;
}

interface GitHubCallbackParams {
  code: string;
  redirectUrl?: string;
}

interface EmailPasswordLoginParams {
  email: string;
  password: string;
  redirectUrl?: string;
}

// ---------------------------------------------------------------------------
// 工具函数
// ---------------------------------------------------------------------------

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function isRelativePath(url: string): boolean {
  return url.startsWith('/');
}

// ---------------------------------------------------------------------------
// 登录成功通用处理
// ---------------------------------------------------------------------------

async function handleAuthSuccess(
  authData: AuthResponse,
  queryClient: ReturnType<typeof useQueryClient>,
  router: ReturnType<typeof useRouter>,
  redirectUrl?: string,
): Promise<void> {
  saveAuthData(authData);

  const targetUrl = redirectUrl || DEFAULT_REDIRECT_URL;

  // 先安排跳转，不依赖 getCurrentUser，避免接口卡住导致永不跳转
  setTimeout(() => {
    router.push(targetUrl);

    // 若 client-side 导航未生效（如仍在回调页），用整页跳转兜底
    setTimeout(() => {
      if (
        typeof window !== 'undefined' &&
        window.location.pathname === AUTH_CALLBACK_PATH &&
        isRelativePath(targetUrl)
      ) {
        window.location.href = targetUrl;
      }
    }, REDIRECT_FALLBACK_CHECK_MS);
  }, REDIRECT_DELAY_MS);

  // 后台拉取用户资料并更新缓存，不阻塞跳转
  try {
    const { data: userResponse, error } = await authApi.getCurrentUser();

    if (error || !userResponse?.data) {
      toast.warning('获取用户资料失败，但登录成功');
    } else {
      queryClient.setQueryData<User>(userQueryKeys.profile(), userResponse.data);
    }
  } catch {
    toast.warning('获取用户资料失败，但登录成功');
  }
}

// ---------------------------------------------------------------------------
// 邮箱验证码登录
// ---------------------------------------------------------------------------

export function useEmailLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationKey: ['email-login'],
    mutationFn: async (params: EmailLoginParams) => {
      const { email, code, redirectUrl } = params;
      const { data, error } = await authApi.emailCodeLogin({ email, code });

      if (error) {
        throw new Error(error);
      }

      if (!data || data.code !== 200) {
        throw new Error(data?.message ?? '登录失败');
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
      toast.error(getErrorMessage(error));
    },
  });
}

// ---------------------------------------------------------------------------
// GitHub OAuth 登录
// ---------------------------------------------------------------------------

export function useGitHubLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationKey: ['github-login'],
    mutationFn: async ({ code, redirectUrl }: GitHubCallbackParams) => {
      const { data, error } = await authApi.githubCallback(code);

      if (error) {
        throw new Error(error);
      }

      if (!data || data.code !== 200) {
        throw new Error(data?.message ?? 'GitHub 登录失败');
      }

      return { authData: data.data, redirectUrl };
    },
    onSuccess: async ({ authData, redirectUrl }) => {
      toast.success('GitHub 登录成功！', { description: '正在获取用户资料...' });

      await handleAuthSuccess(authData, queryClient, router, redirectUrl);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

// ---------------------------------------------------------------------------
// Token 直连登录（如 OAuth 回调带 token）
// ---------------------------------------------------------------------------

export function useTokenLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationKey: ['token-login'],
    mutationFn: async ({
      authData,
      redirectUrl,
    }: {
      authData: AuthResponse;
      redirectUrl?: string;
    }) => ({ authData, redirectUrl }),
    onSuccess: async ({ authData, redirectUrl }) => {
      toast.success('登录成功！', { description: '正在获取用户资料...' });

      await handleAuthSuccess(authData, queryClient, router, redirectUrl);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

// ---------------------------------------------------------------------------
// 邮箱密码登录
// ---------------------------------------------------------------------------

export function useEmailPasswordLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationKey: ['password-login'],
    mutationFn: async (params: EmailPasswordLoginParams) => {
      const { email, password, redirectUrl } = params;
      const { data, error } = await authApi.emailPasswordLogin({
        email,
        password,
      });

      if (error) {
        throw new Error(error);
      }

      if (!data || data.code !== 200) {
        throw new Error(data?.message ?? '登录失败');
      }

      return { authData: data.data, redirectUrl };
    },
    onSuccess: async ({ authData, redirectUrl }) => {
      toast.success('登录成功！', { description: '正在获取用户资料...' });

      await handleAuthSuccess(authData, queryClient, router, redirectUrl);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

// ---------------------------------------------------------------------------
// 邮箱密码注册
// ---------------------------------------------------------------------------

export function useEmailPasswordRegister() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationKey: ['email-register'],
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
        throw new Error(data?.message ?? '注册失败');
      }

      return { authData: data.data, redirectUrl };
    },
    onSuccess: async ({ authData, redirectUrl }) => {
      if (authData?.token) {
        toast.success('注册成功，已自动登录！', {
          description: '正在获取用户资料...',
        });

        await handleAuthSuccess(authData, queryClient, router, redirectUrl);
      } else {
        toast.success('注册成功！', {
          description: '请使用邮箱密码进行登录',
        });
      }
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
