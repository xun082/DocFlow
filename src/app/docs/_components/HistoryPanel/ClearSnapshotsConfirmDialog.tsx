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

interface ClearSnapshotsConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
}

export function ClearSnapshotsConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
}: ClearSnapshotsConfirmDialogProps) {
  const handleConfirm = async (e: React.MouseEvent) => {
    e.preventDefault();
    await onConfirm();
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>确认清空所有快照？</AlertDialogTitle>
          <AlertDialogDescription>
            此操作不可恢复！清空后，所有历史快照都将被永久删除。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>取消</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>确认清空</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
