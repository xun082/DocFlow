import { useState, useRef, useEffect } from 'react';

import { Comment } from '@/hooks/useCommentSidebar';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/Textarea';
import { Surface } from '@/components/ui/Surface';
import { Spinner } from '@/components/ui/Spinner';
import { cn } from '@/utils/utils';

interface CommentDrawerProps {
  isOpen: boolean;
  comments: Comment[];
  replies: { [commentId: string]: Comment[] };
  currentSelection: string;
  loading?: boolean;
  onClose: () => void;
  onAddComment: (text: string, selectedText: string) => void;
  onRemoveComment: (id: string) => void;
  addReply: (commentId: string, content: string) => Promise<void>;
  setReplyInput: (commentId: string, value: string) => void;
  replyInput: { [commentId: string]: string };
}

export const CommentDrawer = ({
  isOpen,
  comments,
  replies,
  currentSelection,
  loading,
  onClose,
  onAddComment,
  onRemoveComment,
  addReply,
  setReplyInput,
  replyInput,
}: CommentDrawerProps) => {
  const [commentText, setCommentText] = useState('');
  const [activeReplyBox, setActiveReplyBox] = useState<string | null>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) setActiveReplyBox(null);
  }, [isOpen]);

  const handleSubmitComment = async () => {
    if (commentText.trim() && currentSelection.trim()) {
      try {
        await onAddComment(commentText.trim(), currentSelection);
        setCommentText('');
      } catch (error) {
        console.error('添加评论失败:', error);
        // 这里可以添加错误提示
      }
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(timestamp);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmitComment();
    }
  };

  const relatedComments = currentSelection
    ? comments.filter((comment) => comment.selectedText === currentSelection)
    : comments;

  return (
    <div
      ref={drawerRef}
      className={cn(
        'fixed top-0 right-0 z-50 h-full w-96 max-w-[90vw] bg-white dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-800 shadow-xl transition-transform duration-300 ease-in-out',
        'flex flex-col',
        isOpen ? 'translate-x-0' : 'translate-x-full',
      )}
    >
      {/* 头部 */}
      <div className="flex flex-row items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800">
        <div className="flex items-center space-x-2">
          <Icon name="MessageSquare" className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <div>
            <div className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              划词评论
            </div>
            <div className="text-sm text-neutral-600 dark:text-neutral-400">
              为选中的文本添加和管理评论
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-700"
        >
          <Icon name="X" className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-col flex-1 overflow-hidden">
        {/* 当前选中文本 */}
        {currentSelection && (
          <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 bg-blue-50 dark:bg-blue-900/20">
            <div className="text-sm text-neutral-600 dark:text-neutral-400 mb-2 font-medium">
              当前选中的文本：
            </div>
            <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100 bg-yellow-100 dark:bg-yellow-900/30 px-3 py-2 rounded-md border border-yellow-200 dark:border-yellow-800 leading-relaxed">
              "{currentSelection}"
            </div>
          </div>
        )}

        {/* 添加评论区域 */}
        {currentSelection && currentSelection.trim() && (
          <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 block">
                  为 "
                  {currentSelection.length > 30
                    ? currentSelection.substring(0, 30) + '...'
                    : currentSelection}
                  " 添加评论
                </label>
                <Textarea
                  placeholder="为选中的文本添加评论...&#10;提示：按 Ctrl/Cmd + Enter 快速提交"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="min-h-[80px] resize-none text-sm leading-relaxed"
                  aria-label="评论输入框"
                  aria-describedby="comment-hint"
                />
              </div>
              <div className="flex justify-between items-center">
                <div id="comment-hint" className="text-xs text-neutral-500 dark:text-neutral-400">
                  按 Ctrl/Cmd + Enter 快速提交
                </div>
                <Button
                  onClick={handleSubmitComment}
                  disabled={!commentText.trim()}
                  size="sm"
                  className="px-4 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Icon name="Plus" className="h-3 w-3 mr-1" />
                  添加评论
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* 评论列表 */}
        <div className="flex-1 overflow-y-auto p-4 bg-neutral-50 dark:bg-neutral-900">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Spinner className="h-6 w-6" />
              <span className="ml-2 text-neutral-500">正在加载评论...</span>
            </div>
          ) : !currentSelection ? (
            <div className="text-center text-neutral-500 dark:text-neutral-400 mt-16">
              <div className="bg-neutral-100 dark:bg-neutral-800 rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Icon name="MousePointer" className="h-8 w-8 opacity-50" />
              </div>
              <h3 className="font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                请先选中文本
              </h3>
              <p className="text-sm">选中文档中的文本以查看相关评论</p>
            </div>
          ) : relatedComments.length === 0 ? (
            <div className="text-center text-neutral-500 dark:text-neutral-400 mt-16">
              <div className="bg-neutral-100 dark:bg-neutral-800 rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Icon name="MessageSquare" className="h-8 w-8 opacity-50" />
              </div>
              <h3 className="font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                此文本还没有评论
              </h3>
              <p className="text-sm">为当前选中的文本添加第一条评论</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-sm text-neutral-600 dark:text-neutral-400 font-medium mb-3">
                针对 "
                {currentSelection.length > 20
                  ? currentSelection.substring(0, 20) + '...'
                  : currentSelection}
                " 的 {relatedComments.length} 条评论
              </div>
              {relatedComments.map((comment) => {
                const cid = comment.id?.toString() || comment.id;

                return (
                  <Surface
                    key={comment.id}
                    data-comment-id={comment.id}
                    className="p-4 border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 rounded-lg shadow-sm hover:shadow-md transition-shadow relative"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="text-xs text-blue-600 dark:text-blue-400 mb-1 font-medium bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-md inline-block">
                          针对文本: "
                          {comment.selectedText.length > 30
                            ? comment.selectedText.substring(0, 30) + '...'
                            : comment.selectedText}
                          "
                        </div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center space-x-2">
                          <Icon name="User" className="h-3 w-3" />
                          <span>{comment.author}</span>
                          <span>·</span>
                          <Icon name="Clock" className="h-3 w-3" />
                          <span>{formatTimestamp(comment.timestamp)}</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveComment(comment.id)}
                        className="h-6 w-6 p-0 text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30"
                        title="删除评论"
                      >
                        <Icon name="Trash2" className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="text-sm text-neutral-800 dark:text-neutral-200 leading-relaxed bg-neutral-50 dark:bg-neutral-700/50 p-3 rounded-md">
                      {comment.text}
                    </div>
                    {/* 回复列表 */}
                    {replies[cid]?.length > 0 && (
                      <div className="mt-3 ml-8 space-y-2">
                        {replies[cid].map((reply) => (
                          <div
                            key={reply.id}
                            className="flex items-start gap-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg px-3 py-2"
                          >
                            <Icon name="User" className="h-5 w-5 text-blue-400 mt-1" />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1">
                                <span className="font-medium text-blue-700 dark:text-blue-300">
                                  {reply.author}
                                </span>
                                <span>·</span>
                                <span>{formatTimestamp(reply.timestamp)}</span>
                              </div>
                              <div className="text-sm text-neutral-800 dark:text-neutral-100 break-words">
                                {reply.text}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {/* 回复按钮和输入框，每条评论都独立 */}
                    {activeReplyBox !== cid && (
                      <div className="flex justify-end mt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-500 hover:bg-blue-100"
                          onClick={() => setActiveReplyBox(cid)}
                        >
                          <Icon name="MessageSquare" className="h-4 w-4" />
                          <span className="ml-1 text-xs">回复</span>
                        </Button>
                      </div>
                    )}
                    {activeReplyBox === cid && isOpen && (
                      <div className="flex items-center gap-2 mt-3 ml-8 bg-neutral-100 dark:bg-neutral-800 rounded-lg px-3 py-2 shadow-sm border border-neutral-200 dark:border-neutral-700">
                        <Textarea
                          value={replyInput[cid] || ''}
                          onChange={(e) => setReplyInput(cid, e.target.value)}
                          placeholder="写下你的回复…"
                          className="flex-1 min-h-[36px] max-h-[80px] resize-none text-sm border-none bg-transparent focus:ring-0 focus:outline-none"
                          rows={1}
                          style={{ boxShadow: 'none' }}
                        />
                        <Button
                          size="sm"
                          onClick={async () => {
                            await addReply(cid, replyInput[cid] || '');
                            setActiveReplyBox(null);
                          }}
                          disabled={!replyInput[cid]?.trim()}
                          className="ml-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 transition font-medium shadow-sm disabled:opacity-60"
                          style={{ minWidth: 60 }}
                        >
                          回复
                        </Button>
                      </div>
                    )}
                  </Surface>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
