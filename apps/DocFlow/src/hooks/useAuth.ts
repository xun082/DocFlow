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
  console.log('✅ 登录成功，处理认证数据...');

  // 1. 保存认证数据
  saveAuthData(authData);
  console.log('💾 认证数据已保存');

  // 2. 获取用户资料
  try {
    console.log('👤 正在获取用户资料...');

    const { data: userResponse, error } = await authApi.getCurrentUser();

    if (error || !userResponse?.data) {
      console.error('❌ 获取用户资料失败:', error);
      toast.warning('获取用户资料失败，但登录成功');
    } else {
      const user = userResponse.data;
      console.log('✅ 用户资料获取成功:', user);

      // 3. 立即更新 React Query 缓存
      queryClient.setQueryData<User>(userQueryKeys.profile(), user);
    }
  } catch (error) {
    console.warn('⚠️ 处理用户资料时出错:', error);
    toast.warning('获取用户资料失败，但登录成功');
  }

  // 4. 跳转到目标页面
  const targetUrl = redirectUrl || '/dashboard';
  console.log('🚀 即将跳转到:', targetUrl);
  setTimeout(() => {
    router.push(targetUrl);
  }, 1000);
};

// 邮箱验证码登录 hook
export function useEmailLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();

  console.log('🔧 useEmailLogin hook 初始化');

  return useMutation({
    mutationKey: ['email-login'],
    mutationFn: async (params: EmailLoginParams) => {
      console.log('🚀 [mutationFn] 开始执行 - 邮箱验证码登录');
      console.log('🚀 [mutationFn] 接收到的参数:', params);

      const { email, code, redirectUrl } = params;
      console.log('📧 邮箱验证码登录请求:', { email, code: code ? '***' : undefined, redirectUrl });

      try {
        console.log('🌐 开始调用 authApi.emailCodeLogin...');

        const { data, error } = await authApi.emailCodeLogin({ email, code });
        console.log('🌐 API 调用完成:', { hasData: !!data, hasError: !!error });

        if (error) {
          console.error('❌ 邮箱验证码登录 API 错误:', error);
          throw new Error(error);
        }

        if (!data || data.code !== 200) {
          console.error('❌ 邮箱验证码登录响应错误:', data);
          throw new Error(data?.message || '登录失败');
        }

        console.log('✅ 邮箱验证码登录成功, 返回数据');

        return { authData: data.data, redirectUrl };
      } catch (err) {
        console.error('❌ [mutationFn] 捕获到异常:', err);
        throw err;
      }
    },
    onMutate: (variables) => {
      console.log('🔄 [onMutate] mutation 开始执行, 参数:', variables);
    },
    onSuccess: async ({ authData, redirectUrl }) => {
      console.log('✅ [onSuccess] mutation 成功回调');
      toast.success('登录成功！', {
        description: '正在获取用户资料...',
      });

      await handleAuthSuccess(authData, queryClient, router, redirectUrl);
    },
    onError: (error) => {
      console.error('❌ [onError] mutation 错误回调:', error);
      toast.error(error instanceof Error ? error.message : '登录失败');
    },
    onSettled: (data, error) => {
      console.log('🏁 [onSettled] mutation 完成:', { hasData: !!data, hasError: !!error });
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

  console.log('🔧 useEmailPasswordLogin hook 初始化');

  return useMutation({
    mutationKey: ['password-login'],
    mutationFn: async (params: EmailPasswordLoginParams) => {
      console.log('🚀 [mutationFn] 开始执行 - 邮箱密码登录');
      console.log('🚀 [mutationFn] 接收到的参数:', { ...params, password: '***' });

      const { email, password, redirectUrl } = params;
      console.log('🔐 邮箱密码登录请求:', {
        email,
        password: password ? '***' : undefined,
        redirectUrl,
      });

      try {
        console.log('🌐 开始调用 authApi.emailPasswordLogin...');

        const { data, error } = await authApi.emailPasswordLogin({ email, password });
        console.log('🌐 API 调用完成:', { hasData: !!data, hasError: !!error });

        if (error) {
          console.error('❌ 邮箱密码登录 API 错误:', error);
          throw new Error(error);
        }

        if (!data || data.code !== 200) {
          console.error('❌ 邮箱密码登录响应错误:', data);
          throw new Error(data?.message || '登录失败');
        }

        console.log('✅ 邮箱密码登录成功');

        return { authData: data.data, redirectUrl };
      } catch (err) {
        console.error('❌ [mutationFn] 捕获到异常:', err);
        throw err;
      }
    },
    onMutate: (variables) => {
      console.log('🔄 [onMutate] mutation 开始执行, 参数:', { ...variables, password: '***' });
    },
    onSuccess: async ({ authData, redirectUrl }) => {
      console.log('✅ [onSuccess] mutation 成功回调');
      toast.success('登录成功！', { description: '正在获取用户资料...' });
      await handleAuthSuccess(authData, queryClient, router, redirectUrl);
    },
    onError: (error) => {
      console.error('❌ [onError] mutation 错误回调:', error);
      toast.error(error instanceof Error ? error.message : '登录失败');
    },
    onSettled: (data, error) => {
      console.log('🏁 [onSettled] mutation 完成:', { hasData: !!data, hasError: !!error });
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
      console.log('👤 邮箱密码注册请求:', {
        email,
        password: password ? '***' : undefined,
        confirmPassword: confirmPassword ? '***' : undefined,
      });

      const { data, error } = await authApi.emailPasswordRegister({
        email,
        password,
        confirmPassword,
      });

      if (error) {
        console.error('❌ 邮箱密码注册 API 错误:', error);
        throw new Error(error);
      }

      if (!data || data.code !== 200) {
        console.error('❌ 邮箱密码注册响应错误:', data);
        throw new Error(data?.message || '注册失败');
      }

      console.log('✅ 邮箱密码注册成功');

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
      console.error('❌ 邮箱密码注册失败:', error);
      toast.error(error instanceof Error ? error.message : '注册失败');
    },
  });
}
