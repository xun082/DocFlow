'use client';

import { useState } from 'react';
import { Check, MessageSquare, Send, X } from 'lucide-react';
import { toast } from 'sonner';

import { CommentItem } from './comment-item';

import { Button } from '@/components/ui/button';
import Textarea from '@/components/ui/Textarea';
import { cn } from '@/utils/utils';
import CommentApi from '@/services/comment';
import { useCommentStore } from '@/stores/commentStore';
import type { CommentThread as CommentThreadType } from '@/services/comment/type';

interface CommentThreadProps {
  thread: CommentThreadType;
  isActive?: boolean;
  isHovered?: boolean;
  onResolve?: () => void;
  onDelete?: () => void;
  onHover?: () => void;
  onLeave?: () => void;
  onCardClick?: () => void;
  currentUserId?: string;
}

export function CommentThread({
  thread,
  isActive = false,
  isHovered = false,
  onResolve,
  onDelete,
  onHover,
  onLeave,
  onCardClick,
  currentUserId,
}: CommentThreadProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { updateComment } = useCommentStore();

  const handleReply = async () => {
    if (!replyContent.trim()) {
      toast.error('回复内容不能为空');

      return;
    }

    setIsSubmitting(true);

    try {
      const newReply = await CommentApi.createReply({
        threadId: thread.id,
        content: replyContent.trim(),
      });

      // 更新本地状态
      updateComment(thread.id, {
        replies: [...thread.replies, newReply],
      });

      setReplyContent('');
      setIsReplying(false);
      toast.success('回复成功');
    } catch (error) {
      console.error('Failed to create reply:', error);
      toast.error('回复失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReply = async (replyId: string) => {
    try {
      await CommentApi.deleteReply({ id: replyId });

      // 更新本地状态
      updateComment(thread.id, {
        replies: thread.replies.filter((r) => r.id !== replyId),
      });

      toast.success('删除成功');
    } catch (error) {
      console.error('Failed to delete reply:', error);
      toast.error('删除失败，请重试');
    }
  };

  const canDeleteThread = currentUserId === thread.userId;
  const canResolve = currentUserId === thread.userId || thread.replies.length > 0;

  // 点击卡片时，激活评论（滚动逻辑由 CommentPanel 的 useEffect 处理）
  const handleCardClick = () => {
    // 调用回调函数，激活评论
    if (onCardClick) {
      onCardClick();
    }
  };

  return (
    <div
      className={cn(
        'group rounded-xl transition-all duration-200 cursor-pointer relative overflow-hidden',
        'bg-white dark:bg-gray-800 border',
        isActive
          ? 'border-blue-500 shadow-[0_0_0_1px_rgba(59,130,246,1)] shadow-blue-500/20 bg-blue-50/30 dark:bg-blue-900/10'
          : isHovered
            ? 'border-amber-400 bg-amber-50/30 dark:bg-amber-900/10 shadow-sm'
            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600',
        thread.resolved && 'opacity-60 hover:opacity-100',
      )}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={handleCardClick}
    >
      {/* 左侧装饰条 - 仅在激活或悬停时显示 */}
      <div
        className={cn(
          'absolute left-0 top-0 bottom-0 w-1 transition-colors duration-200',
          isActive ? 'bg-blue-500' : isHovered ? 'bg-amber-400' : 'bg-transparent',
        )}
      />

      <div className="p-4 pl-5">
        {/* 被评论的文本 - 更突出显示 */}
        <div className="mb-4 group/quote">
          <div className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1.5 font-semibold flex items-center gap-1.5">
            <span
              className={cn(
                'w-1.5 h-1.5 rounded-full',
                isActive ? 'bg-blue-500' : isHovered ? 'bg-amber-400' : 'bg-gray-300',
              )}
            />
            评论对象
          </div>
          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700 rounded-full" />
            <p className="text-sm text-gray-600 dark:text-gray-300 font-medium leading-relaxed pl-3 line-clamp-2 italic">
              &quot;{thread.text}&quot;
            </p>
          </div>
        </div>

        {/* 主评论 */}
        {thread.replies.length > 0 && (
          <CommentItem
            id={thread.id}
            content={thread.replies[0]?.content || ''}
            userName={thread.replies[0]?.userName || thread.userName}
            userAvatar={thread.replies[0]?.userAvatar || thread.userAvatar}
            createdAt={thread.replies[0]?.createdAt || thread.createdAt}
            onDelete={canDeleteThread ? onDelete : undefined}
            canDelete={canDeleteThread}
          />
        )}

        {/* 回复列表 */}
        {thread.replies.slice(1).map((reply) => (
          <CommentItem
            key={reply.id}
            id={reply.id}
            content={reply.content}
            userName={reply.userName}
            userAvatar={reply.userAvatar}
            createdAt={reply.createdAt}
            isReply
            onDelete={
              currentUserId === reply.userId ? () => handleDeleteReply(reply.id) : undefined
            }
            canDelete={currentUserId === reply.userId}
          />
        ))}

        {/* 回复输入框 */}
        {isReplying && (
          <div className="mt-3 ml-8">
            <Textarea
              value={replyContent}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setReplyContent(e.target.value)
              }
              placeholder="输入回复..."
              className="min-h-[60px] text-sm"
              autoFocus
            />
            <div className="flex gap-2 mt-2">
              <Button
                size="sm"
                onClick={handleReply}
                disabled={!replyContent.trim() || isSubmitting}
              >
                <Send className="h-3 w-3 mr-1" />
                回复
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setIsReplying(false)}>
                <X className="h-3 w-3 mr-1" />
                取消
              </Button>
            </div>
          </div>
        )}

        {/* 操作按钮 */}
        {!thread.resolved && (
          <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            {!isReplying && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsReplying(true)}
                className="h-7 text-xs"
              >
                <MessageSquare className="h-3 w-3 mr-1" />
                回复
              </Button>
            )}

            {canResolve && onResolve && (
              <Button size="sm" variant="ghost" onClick={onResolve} className="h-7 text-xs">
                <Check className="h-3 w-3 mr-1" />
                标记为已解决
              </Button>
            )}
          </div>
        )}

        {/* 已解决标记 */}
        {thread.resolved && (
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
              <Check className="h-3 w-3" />
              <span>已解决</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
