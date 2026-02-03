'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';

import UserProfileForm from './_components/user-profile-form';

import type { User } from '@/types/auth';
import { useUserQuery, getLocalUserData } from '@/hooks/useUserQuery';
import Spinner from '@/components/ui/Spinner';

// 骨架屏组件
function UserProfileSkeleton() {
  return (
    <div className="space-y-8">
      {/* 个人信息表单骨架 */}
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/30 p-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-200 animate-pulse"></div>
            <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="h-10 w-24 bg-gray-200 rounded-xl animate-pulse"></div>
        </div>
        <div className="space-y-6">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="space-y-2">
              <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-10 w-full bg-gray-100 rounded-xl animate-pulse"></div>
            </div>
          ))}
          <div className="space-y-2">
            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-20 w-full bg-gray-100 rounded-xl animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UserProfile() {
  const [isMounted, setIsMounted] = useState(false);
  const [localUserData, setLocalUserData] = useState<User | undefined>(undefined);

  // 使用 React Query 获取用户数据
  const queryClient = useQueryClient();
  const { data: profile, isLoading, error } = useUserQuery();

  // 确保组件只在客户端渲染，并预加载本地数据
  useEffect(() => {
    setIsMounted(true);

    const cachedData = getLocalUserData(queryClient);

    if (cachedData) {
      setLocalUserData(cachedData);
    }
  }, [queryClient]);

  // 在客户端挂载之前总是显示骨架屏
  if (!isMounted) {
    return <UserProfileSkeleton />;
  }

  // 优先使用服务器数据，回退到本地数据
  const displayProfile = profile || localUserData;

  // 如果没有任何可显示的数据，显示骨架屏
  if (!displayProfile) {
    // 如果有错误且确定不会有数据，显示错误状态
    if (error && !isLoading) {
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="text-red-500 text-6xl">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-800">无法加载用户资料</h2>
            <p className="text-gray-600">请尝试刷新页面或重新登录</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
            >
              刷新页面
            </button>
          </div>
        </div>
      );
    }

    // 否则显示骨架屏（加载中或首次访问）
    return <UserProfileSkeleton />;
  }

  return (
    <div className="space-y-8">
      {/* 后台数据刷新指示器 */}
      {isLoading && displayProfile && profile && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="fixed top-4 right-4 z-50 bg-blue-500/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2"
        >
          <Spinner size="sm" className="text-white" />
          <span className="text-sm font-medium">同步最新数据...</span>
        </motion.div>
      )}

      {/* 网络错误提示 */}
      {error && displayProfile && !isLoading && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-3"
        >
          <div className="text-amber-600">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-amber-800 text-sm font-medium">网络连接不稳定</p>
            <p className="text-amber-700 text-xs">显示的是缓存数据，最新信息可能有延迟</p>
          </div>
        </motion.div>
      )}

      {/* 个人信息编辑表单 */}
      <UserProfileForm user={displayProfile} />
    </div>
  );
}
