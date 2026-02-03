import { X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface CreateSnapshotDialogProps {
  open: boolean;
  description: string;
  onDescriptionChange: (value: string) => void;
  onCreate: () => void;
  onCancel: () => void;
}

export function CreateSnapshotDialog({
  open,
  description,
  onDescriptionChange,
  onCreate,
  onCancel,
}: CreateSnapshotDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center justify-between">
            <AlertDialogTitle>创建快照</AlertDialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 absolute right-4 top-4"
              onClick={onCancel}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </AlertDialogHeader>
        <div className="py-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            快照描述
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="例如：完成初稿、重要修改等"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                onCreate();
              }
            }}
          />
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            快照将保存文档的当前状态，您可以随时恢复到此状态
          </p>
        </div>
        <AlertDialogFooter>
          <Button variant="outline" onClick={onCancel}>
            取消
          </Button>
          <Button onClick={onCreate} disabled={!description.trim()}>
            创建
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
