import { ReadonlyURLSearchParams } from 'next/navigation';

/**
 * 重定向管理工具
 */
export const redirectManager = {
  get: (searchParams: ReadonlyURLSearchParams | null) => {
    const redirectTo = searchParams?.get('redirect_to');

    return redirectTo ? decodeURIComponent(redirectTo) : '/dashboard';
  },
  save: (url: string) => {
    if (typeof window === 'undefined' || url === '/dashboard') return;

    try {
      sessionStorage.setItem('auth_redirect', url);
    } catch {
      // 静默处理存储错误
    }
  },
};
