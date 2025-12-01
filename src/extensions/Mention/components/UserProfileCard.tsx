'use client';

import React from 'react';
import { MapPin, Briefcase, Globe, Calendar, Mail } from 'lucide-react';

import type { User } from '@/services/users';
import { Card } from '@/components/ui/card';

interface UserProfileCardProps {
  user: User;
}

export const UserProfileCard: React.FC<UserProfileCardProps> = ({ user }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);

    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Card className="w-80 p-4 shadow-xl border-gray-200 dark:border-gray-700">
      {/* 头部 - 头像和基本信息 */}
      <div className="flex items-start gap-3 mb-4">
        {user.avatar_url ? (
          <img
            src={user.avatar_url}
            alt={user.name || '用户'}
            className="w-16 h-16 rounded-full object-cover ring-2 ring-blue-100 dark:ring-blue-900"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl font-bold ring-2 ring-blue-100 dark:ring-blue-900">
            {(user.name || 'U').charAt(0).toUpperCase()}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate">
            {user.name || '未命名用户'}
          </h3>
          {user.email && (
            <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 mt-1">
              <Mail className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{user.email}</span>
            </div>
          )}
          <div className="mt-1">
            <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
              {user.role === 'ADMIN' ? '管理员' : user.role === 'MODERATOR' ? '版主' : '用户'}
            </span>
          </div>
        </div>
      </div>

      {/* 个人简介 */}
      {user.bio && (
        <div className="mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{user.bio}</p>
        </div>
      )}

      {/* 详细信息 */}
      <div className="space-y-2">
        {user.company && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Briefcase className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{user.company}</span>
          </div>
        )}

        {user.location && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{user.location}</span>
          </div>
        )}

        {user.website_url && (
          <div className="flex items-center gap-2 text-sm">
            <Globe className="w-4 h-4 flex-shrink-0 text-gray-600 dark:text-gray-400" />
            <a
              href={user.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline truncate"
            >
              {user.website_url.replace(/^https?:\/\//, '')}
            </a>
          </div>
        )}

        {user.created_at && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
            <Calendar className="w-4 h-4 flex-shrink-0" />
            <span className="text-xs">加入于 {formatDate(user.created_at)}</span>
          </div>
        )}
      </div>
    </Card>
  );
};

export default UserProfileCard;
