'use client';

import { Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/utils';

interface CommentItemProps {
  id: string;
  content: string;
  userName: string;
  userAvatar?: string;
  createdAt: string;
  isReply?: boolean;
  onDelete?: () => void;
  canDelete?: boolean;
}

export function CommentItem({
  content,
  userName,
  userAvatar,
  createdAt,
  isReply = false,
  onDelete,
  canDelete = false,
}: CommentItemProps) {
  const timeAgo = formatDistanceToNow(new Date(createdAt), {
    addSuffix: true,
    locale: zhCN,
  });

  return (
    <div className={cn('group flex gap-2', isReply && 'ml-8 mt-2')}>
      <Avatar className="h-6 w-6 flex-shrink-0">
        <AvatarImage src={userAvatar} alt={userName} />
        <AvatarFallback className="text-xs">{userName[0]?.toUpperCase()}</AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {userName}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
              {timeAgo}
            </span>
          </div>

          {canDelete && onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="h-3 w-3 text-gray-500 dark:text-gray-400" />
            </Button>
          )}
        </div>

        <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 break-words">{content}</p>
      </div>
    </div>
  );
}
