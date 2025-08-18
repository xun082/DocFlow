'use client';

import { useEffect, useState } from 'react';

import { Avatar } from '@/components/ui/avatar';
import { Surface } from '@/components/ui/Surface';
import { User } from '@/services/auth/type';

export default function UserProfile() {
  const [profile, setProfile] = useState<User | null>(null);

  useEffect(() => {
    const userProfile = localStorage.getItem('user_profile');

    if (userProfile) {
      try {
        setProfile(JSON.parse(userProfile));
      } catch {
        setProfile(null);
      }
    }
  }, []);

  if (!profile) {
    return <Surface className="p-8 text-center">未找到个人资料</Surface>;
  }

  return (
    <Surface className="max-w-md mx-auto mt-10 p-8 rounded-lg shadow-lg bg-white dark:bg-gray-900">
      <div className="flex flex-col items-center gap-4">
        <Avatar>
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.name}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <span className="text-2xl">{profile.name?.[0] || '?'}</span>
          )}
        </Avatar>
        <h2 className="text-2xl font-bold">{profile.name}</h2>
        <p className="text-gray-500 dark:text-gray-400">{profile.email}</p>
      </div>
      <div className="mt-6">
        {[
          { key: 'bio', label: '简介' },
          { key: 'company', label: '公司' },
          { key: 'location', label: '位置' },
          { key: 'role', label: '角色' },
          { key: 'website_url', label: '个人网站' },
          { key: 'github_id', label: 'GitHub' },
          { key: 'is_active', label: '在线状态' },
        ].map(({ key, label }) => {
          const value = (profile as Record<string, any>)[key];

          return (
            <div
              key={key}
              className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800"
            >
              <span className="font-medium text-gray-700 dark:text-gray-300">{label}</span>
              {key === 'is_active' ? (
                value === null || String(value) === 'null' ? (
                  <span className="text-gray-600 dark:text-gray-400">暂无</span>
                ) : value === true ? (
                  <span className="text-green-600 dark:text-green-400">在线</span>
                ) : (
                  <span className="text-gray-600 dark:text-gray-400">离线</span>
                )
              ) : String(value) === 'null' ? (
                <span className="text-gray-600 dark:text-gray-400">暂无</span>
              ) : (
                <span className="text-gray-600 dark:text-gray-400">{String(value)}</span>
              )}
            </div>
          );
        })}
      </div>
    </Surface>
  );
}
