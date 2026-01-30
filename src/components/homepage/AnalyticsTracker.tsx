'use client';

import useAnalytics from '@/hooks/useAnalysis';

/**
 * Analytics 追踪组件 - 客户端组件
 * 独立的客户端组件，不影响页面 SSR
 */
export function AnalyticsTracker() {
  useAnalytics();

  return null;
}
