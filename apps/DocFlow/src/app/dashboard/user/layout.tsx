'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User as UserIcon,
  Mail,
  Github,
  Calendar,
  Camera,
  Users,
  FileText,
  User as ProfileIcon,
  Newspaper,
} from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

import type { User } from '@/types/auth';
import Spinner from '@/components/ui/Spinner';
import { useUserQuery, getLocalUserData } from '@/hooks/useUserQuery';
import { useAvatarUpload } from '@/hooks/useAvatarUpload';

// 导航菜单配置
const navigationItems = [
  {
    key: '/dashboard/user',
    label: '个人资料',
    icon: ProfileIcon,
    description: '管理个人信息和设置',
  },
  {
    key: '/dashboard/user/friend',
    label: '朋友',
    icon: Users,
    description: '管理朋友列表和关系',
  },
  {
    key: '/dashboard/user/docs',
    label: '共享文档',
    icon: FileText,
    description: '查看和管理共享文档',
  },
  {
    key: '/dashboard/user/blogs',
    label: '博客',
    icon: Newspaper,
    description: '查看和管理博客',
  },
];

// 用户信息头部组件
function UserProfileHeader({ user }: { user: User }) {
  const avatarUploadMutation = useAvatarUpload();

  // 处理头像上传
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    avatarUploadMutation.mutate(file, {
      onSuccess: () => {
        toast.success('头像更新成功');
      },
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/30 overflow-hidden"
    >
      <div className="relative bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 p-8">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-sm"></div>
        <div className="relative">
          {/* 头像和基本信息 */}
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* 头像 */}
            <div className="relative">
              <motion.div whileHover={{ scale: 1.05 }} className="relative group">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden ring-4 ring-white/30 shadow-2xl bg-white">
                  {avatarUploadMutation.isPending ? (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <Spinner className="border-blue-600" />
                    </div>
                  ) : user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.name || '用户头像'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  {/* 默认头像 fallback */}
                  <div
                    className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-100 text-2xl md:text-4xl font-bold text-blue-600 ${
                      user.avatar_url ? 'hidden' : ''
                    }`}
                  >
                    {user.name?.[0]?.toUpperCase() || (
                      <UserIcon className="w-8 h-8 md:w-12 md:h-12" />
                    )}
                  </div>
                </div>
                {/* 头像上传覆盖层 */}
                <motion.label
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  className="absolute inset-0 flex items-center justify-center bg-black/60 text-white rounded-full cursor-pointer transition-all duration-200"
                  htmlFor="avatar-upload"
                >
                  <div className="text-center">
                    <Camera className="w-4 h-4 md:w-6 md:h-6 mx-auto mb-1" />
                    <span className="text-xs font-medium">更换</span>
                  </div>
                </motion.label>
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={avatarUploadMutation.isPending}
                />
              </motion.div>
            </div>

            {/* 用户信息 */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                {user.name || '未设置姓名'}
              </h1>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                <div className="flex items-center justify-center md:justify-start gap-2 text-white/90">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">{user.email || '未绑定邮箱'}</span>
                </div>
                <div className="flex items-center justify-center md:justify-start gap-2 text-white/90">
                  <UserIcon className="w-4 h-4" />
                  <span className="text-sm">{user.role || 'USER'}</span>
                </div>
                <div className="flex items-center justify-center md:justify-start gap-2 text-white/90">
                  <Github className="w-4 h-4" />
                  <span className="text-sm">{user.github_id ? '已绑定' : '未绑定'}</span>
                </div>
              </div>
              {user.created_at && (
                <div className="flex items-center justify-center md:justify-start gap-2 text-white/70 mt-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">
                    注册于 {new Date(user.created_at).toLocaleDateString('zh-CN')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// 导航组件
function UserNavigation() {
  const pathname = usePathname();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden"
    >
      <div className="px-6 py-4">
        <div className="flex items-center gap-1">
          {navigationItems.map((item) => {
            const isActive = pathname === item.key;
            const Icon = item.icon;

            return (
              <Link key={item.key} href={item.key}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative px-4 py-2.5 rounded-xl transition-all duration-200 flex items-center gap-2 ${
                    isActive
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium text-sm">{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-blue-50 border border-blue-200 rounded-xl -z-10"
                      initial={false}
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

// 骨架屏组件
function UserLayoutSkeleton() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* 头部骨架 */}
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/30 overflow-hidden">
        <div className="relative bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 p-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-32 h-32 rounded-full bg-white/20 animate-pulse"></div>
            <div className="flex-1 space-y-3">
              <div className="h-8 w-48 bg-white/20 rounded animate-pulse mx-auto md:mx-0"></div>
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-5 w-24 bg-white/20 rounded animate-pulse mx-auto md:mx-0"
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 导航骨架 */}
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50">
        <div className="px-6 py-4">
          <div className="flex items-center gap-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className="px-4 py-2.5 rounded-xl flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 内容区域骨架 */}
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/30 p-8">
        <div className="space-y-6">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-3">
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-10 bg-gray-100 rounded-xl animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);
  const [localUserData, setLocalUserData] = useState<User | undefined>(undefined);

  // 获取用户数据
  const queryClient = useQueryClient();
  const { data: profile } = useUserQuery();

  // 确保组件只在客户端渲染，并预加载本地数据
  useEffect(() => {
    setIsMounted(true);

    const cachedData = getLocalUserData(queryClient);

    if (cachedData) {
      setLocalUserData(cachedData);
    }
  }, [queryClient]);

  // 在客户端挂载之前显示骨架屏
  if (!isMounted) {
    return <UserLayoutSkeleton />;
  }

  // 优先使用服务器数据，回退到本地数据
  const displayProfile = profile || localUserData;

  // 如果没有用户数据，显示骨架屏
  if (!displayProfile) {
    return <UserLayoutSkeleton />;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* 用户信息头部 */}
      <UserProfileHeader user={displayProfile} />

      {/* 导航菜单 */}
      <UserNavigation />

      {/* 子页面内容 */}
      <AnimatePresence mode="wait">
        <motion.div
          key="user-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ delay: 0.2 }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
