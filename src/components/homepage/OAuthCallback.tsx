'use client';

import { useEffect } from 'react';

/**
 * OAuth 回调处理组件 - 客户端组件
 * 处理 OAuth 认证回调重定向
 */
export function OAuthCallback() {
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');

    if (code && state) {
      const callbackUrl = `/auth/callback${window.location.search}`;
      window.location.replace(callbackUrl);
    }
  }, []);

  return null;
}
