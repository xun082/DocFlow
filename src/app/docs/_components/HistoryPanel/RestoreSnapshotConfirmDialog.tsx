import { Users } from 'lucide-react';

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

interface CollaborationUser {
  id: string;
  name: string;
  color: string;
  avatar: string;
}

interface RestoreSnapshotConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  hasOtherUsers: boolean;
  otherUsers: CollaborationUser[];
}

export function RestoreSnapshotConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  hasOtherUsers,
  otherUsers,
}: RestoreSnapshotConfirmDialogProps) {
  const handleConfirm = async (e: React.MouseEvent) => {
    e.preventDefault();
    await onConfirm();
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
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
            onClick={handleConfirm}
            className={hasOtherUsers ? 'bg-red-600 hover:bg-red-700' : ''}
          >
            确认恢复
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
