'use client';

import { useEffect } from 'react';

import { useTour } from '../use-tour';

import { storage, STORAGE_KEYS } from '@/utils/storage';

/**
 * Hook 用于处理 Dashboard Tour 的自动启动和完成状态记录
 */
export function useDashboardTour() {
  const { setIsOpen } = useTour();

  // 首次访问自动触发引导，一旦展示就立即记录完成状态
  useEffect(() => {
    const hasCompleted = storage.get(STORAGE_KEYS.DASHBOARD_TOUR_COMPLETED, false);

    if (!hasCompleted) {
      setIsOpen(true);
      // 引导一展示就立即写入完成状态
      storage.set(STORAGE_KEYS.DASHBOARD_TOUR_COMPLETED, true);
    }
  }, [setIsOpen]);
}
