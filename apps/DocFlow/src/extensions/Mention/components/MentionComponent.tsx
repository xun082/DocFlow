'use client';

import React, { useState } from 'react';
import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import * as HoverCard from '@radix-ui/react-hover-card';

import UserProfileCard from './UserProfileCard';

import UserApi from '@/services/users';
import type { User } from '@/services/users';

export const MentionComponent: React.FC<NodeViewProps> = ({ node }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserDetails = async () => {
    if (loading || user || error) return;

    setLoading(true);
    setError(null);

    try {
      const response = await UserApi.getUserById(node.attrs.id);

      // request 返回 { data: ApiResponse<User> | null, error: string | null }
      // ApiResponse<User> = { code, message, data: User, timestamp }
      if (response.data?.data) {
        setUser(response.data.data);
      } else if (response.error) {
        setError(response.error);
      } else {
        setError('未找到用户');
      }
    } catch (err) {
      console.error('获取用户信息失败:', err);
      setError('加载失败');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (open && !user && !loading && !error) {
      fetchUserDetails();
    }
  };

  return (
    <NodeViewWrapper as="span" className="mention-wrapper inline">
      <HoverCard.Root openDelay={300} closeDelay={100} onOpenChange={handleOpenChange}>
        <HoverCard.Trigger asChild>
          <span
            className="mention"
            data-id={node.attrs.id}
            data-label={node.attrs.label}
            data-email={node.attrs.email}
            contentEditable={false}
          >
            {node.attrs.label || node.attrs.id}
          </span>
        </HoverCard.Trigger>

        <HoverCard.Portal>
          <HoverCard.Content
            side="top"
            align="start"
            sideOffset={8}
            className="z-[99999]"
            style={{ zIndex: 99999 }}
          >
            {loading && (
              <div className="w-80 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600 dark:text-gray-400">加载中...</span>
                </div>
              </div>
            )}

            {error && (
              <div className="w-80 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-red-200 dark:border-red-700">
                <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>
              </div>
            )}

            {user && <UserProfileCard user={user} />}
          </HoverCard.Content>
        </HoverCard.Portal>
      </HoverCard.Root>
    </NodeViewWrapper>
  );
};

export default MentionComponent;
