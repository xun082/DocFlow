'use client';

import { useState } from 'react';
import { History, Clock, Trash2, RotateCcw, Plus, X, Users } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import * as Y from 'yjs';

import { useEditorHistory } from '@/hooks/useEditorHistory';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/utils';

interface CollaborationUser {
  id: string;
  name: string;
  color: string;
  avatar: string;
}

interface HistoryPanelProps {
  documentId: string;
  doc: Y.Doc;
  connectedUsers?: CollaborationUser[];
  currentUser?: CollaborationUser | null;
}

export default function HistoryPanel({
  documentId,
  doc,
  connectedUsers = [],
  currentUser,
}: HistoryPanelProps) {
  const otherUsers = connectedUsers.filter((user) => user.id !== currentUser?.id);
  const hasOtherUsers = otherUsers.length > 0;
  const [isOpen, setIsOpen] = useState(false);
  const [isRestoring, setIsRestoring] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [description, setDescription] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const { snapshots, isLoading, createSnapshot, restoreSnapshot, deleteSnapshot, clearSnapshots } =
    useEditorHistory({
      documentId,
      doc,
    });

  const handleCreateSnapshot = async () => {
    if (!description.trim()) {
      toast.error('请输入快照描述');

      return;
    }

    const newSnapshot = await createSnapshot(description);

    if (newSnapshot) {
      toast.success('快照创建成功');
      setDescription('');
      setShowCreateDialog(false);
    } else {
      toast.error('快照创建失败');
    }
  };

  const handleRestoreSnapshot = async (snapshotId: string) => {
    setShowRestoreConfirm(snapshotId);
  };

  const confirmRestoreSnapshot = async () => {
    if (!showRestoreConfirm) return;

    setIsRestoring(showRestoreConfirm);

    const success = await restoreSnapshot(showRestoreConfirm);
    setIsRestoring(null);

    if (success) {
      toast.success('快照恢复成功');
      setIsOpen(false);
    } else {
      toast.error('快照恢复失败');
    }

    setShowRestoreConfirm(null);
  };

  const handleDeleteSnapshot = async (snapshotId: string) => {
    setShowDeleteConfirm(snapshotId);
  };

  const confirmDeleteSnapshot = async () => {
    if (!showDeleteConfirm) return;

    setIsDeleting(showDeleteConfirm);

    const success = await deleteSnapshot(showDeleteConfirm);
    setIsDeleting(null);

    if (success) {
      toast.success('快照删除成功');
    } else {
      toast.error('快照删除失败');
    }

    setShowDeleteConfirm(null);
  };

  const handleClearAll = async () => {
    if (snapshots.length === 0) return;

    setShowClearConfirm(true);
  };

  const confirmClearAll = async () => {
    const success = await clearSnapshots();

    if (success) {
      toast.success('所有快照已删除');
    } else {
      toast.error('删除快照失败');
    }

    setShowClearConfirm(false);
  };

  const handleClearConfirmAction = async (e: React.MouseEvent) => {
    e.preventDefault();
    await confirmClearAll();
  };

  const handleRestoreConfirmAction = async (e: React.MouseEvent) => {
    e.preventDefault();
    await confirmRestoreSnapshot();
  };

  const handleDeleteConfirmAction = async (e: React.MouseEvent) => {
    e.preventDefault();
    await confirmDeleteSnapshot();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <div
            className="flex items-center gap-2 p-1.5 text-sm font-medium text-neutral-500 text-left bg-transparent w-full rounded hover:bg-neutral-100 hover:text-neutral-800 dark:hover:bg-neutral-900 dark:hover:text-neutral-200"
            aria-label="查看历史记录"
          >
            <History className="w-4 h-4" />
            <span>历史记录</span>
            {snapshots.length > 0 && (
              <span className="ml-auto px-1.5 py-0.5 text-xs font-semibold rounded-full bg-blue-500 text-white min-w-[20px] text-center">
                {snapshots.length}
              </span>
            )}
          </div>
        </DialogTrigger>
        <DialogContent className="h-[80vh] w-full max-w-2xl overflow-y-auto">
          <DialogDescription className="sr-only">
            查看和管理文档的历史快照，可以创建、恢复或删除快照
          </DialogDescription>
          <div className="flex flex-col h-full">
            <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
              <div className="flex items-center gap-2">
                <History className="h-5 w-5 text-blue-600" />
                <DialogTitle>文档历史</DialogTitle>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCreateDialog(true)}
                  className="gap-1"
                >
                  <Plus className="h-3 w-3" />
                  创建快照
                </Button>
                {snapshots.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearAll}
                    className="gap-1 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                    清空
                  </Button>
                )}
              </div>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto p-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="inline-block animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mb-2"></div>
                    <p className="text-sm text-gray-500">加载中...</p>
                  </div>
                </div>
              ) : snapshots.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <Clock className="h-16 w-16 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    暂无历史快照
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    创建第一个快照来保存文档的当前状态
                  </p>
                  <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    创建快照
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {snapshots.map((snapshot, index) => (
                    <div
                      key={snapshot.id}
                      className={cn(
                        'group relative p-4 rounded-lg border transition-all duration-200',
                        'bg-white dark:bg-gray-800',
                        'border-gray-200 dark:border-gray-700',
                        'hover:border-blue-300 dark:hover:border-blue-700',
                        'hover:shadow-md',
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                              {snapshot.description || `快照 ${index + 1}`}
                            </h4>
                            {index === 0 && (
                              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                                最新
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <Clock className="h-3 w-3" />
                            <span>
                              {formatDistanceToNow(new Date(snapshot.timestamp), {
                                addSuffix: true,
                                locale: zhCN,
                              })}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleRestoreSnapshot(snapshot.id)}
                            disabled={isRestoring === snapshot.id || showRestoreConfirm !== null}
                            title="恢复此快照"
                          >
                            <RotateCcw
                              className={cn(
                                'h-4 w-4',
                                isRestoring === snapshot.id && 'animate-spin',
                              )}
                            />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                            onClick={() => handleDeleteSnapshot(snapshot.id)}
                            disabled={isDeleting === snapshot.id || showDeleteConfirm !== null}
                            title="删除此快照"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {showCreateDialog && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
                  <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      创建快照
                    </h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        setShowCreateDialog(false);
                        setDescription('');
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="p-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      快照描述
                    </label>
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="例如：完成初稿、重要修改等"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleCreateSnapshot();
                        }
                      }}
                    />
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      快照将保存文档的当前状态，您可以随时恢复到此状态
                    </p>
                  </div>
                  <div className="flex justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowCreateDialog(false);
                        setDescription('');
                      }}
                    >
                      取消
                    </Button>
                    <Button onClick={handleCreateSnapshot} disabled={!description.trim()}>
                      创建
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认清空所有快照？</AlertDialogTitle>
            <AlertDialogDescription>
              此操作不可恢复！清空后，所有历史快照都将被永久删除。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearConfirmAction}>确认清空</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={showRestoreConfirm !== null}
        onOpenChange={() => setShowRestoreConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认恢复快照？</AlertDialogTitle>
            <AlertDialogDescription className="sr-only">
              {hasOtherUsers
                ? `当前有 ${otherUsers.length} 位用户正在编辑此文档，恢复快照后，当前文档内容将被快照内容覆盖，其他用户的更改可能会丢失。此操作不可撤销。`
                : '恢复后，当前文档内容将被快照内容覆盖，此操作不可撤销。'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            {hasOtherUsers ? (
              <>
                <div className="flex items-center gap-2 mb-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <Users className="h-5 w-5 text-red-600 dark:text-red-400" />
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-red-700 dark:text-red-300">
                      当前有 {otherUsers.length} 位用户正在编辑此文档
                    </div>
                    <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                      {otherUsers.map((user, index) => (
                        <span key={user.id}>
                          {index > 0 && '、'}
                          {user.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  恢复快照后，当前文档内容将被快照内容覆盖，其他用户的更改可能会丢失。
                  此操作不可撤销。
                </p>
              </>
            ) : (
              <p className="text-sm text-gray-700 dark:text-gray-300">
                恢复后，当前文档内容将被快照内容覆盖，此操作不可撤销。
              </p>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRestoreConfirmAction}
              className={hasOtherUsers ? 'bg-red-600 hover:bg-red-700' : ''}
            >
              确认恢复
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={showDeleteConfirm !== null}
        onOpenChange={() => setShowDeleteConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除快照？</AlertDialogTitle>
            <AlertDialogDescription>删除后，此快照将无法恢复。</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirmAction}>确认删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
