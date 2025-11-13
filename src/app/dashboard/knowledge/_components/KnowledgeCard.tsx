'use client';

import { BookOpen, Calendar, Eye, Trash } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

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
import { ApiKnowledgeItem } from '@/services/knowledge/types';
import { KnowledgeApi } from '@/services/knowledge';

interface KnowledgeCardProps {
  knowledge: ApiKnowledgeItem;
  onClick?: () => void;
  onDeleted?: () => void;
}

export function KnowledgeCard({ knowledge, onClick, onDeleted }: KnowledgeCardProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (onClick) {
      onClick();
    }
  };

  const handlePreviewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/dashboard/knowledge/${knowledge.id}`);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (deleting) return;

    try {
      setDeleting(true);
      await KnowledgeApi.DeleteKnowledge(knowledge.id, (err) => {
        console.error('删除知识库失败:', err);
      });

      setConfirmOpen(false);

      toast.success('删除成功', {
        onDismiss: () => {
          if (onDeleted) {
            onDeleted();
          }
        },
      });
    } catch (error) {
      console.error('删除失败:', error);
      toast.error('删除失败');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="group relative p-6 border rounded-lg bg-card hover:shadow-md transition-all duration-200 cursor-pointer">
        <div onClick={handleCardClick} className="space-y-4">
          {/* 标题和图标 */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg line-clamp-1">{knowledge.title}</h3>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                  知识库
                </span>
              </div>
            </div>

            {/* 预览与删除按钮 */}
            {knowledge.description && (
              <div className="flex items-center gap-1">
                <button
                  onClick={handlePreviewClick}
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 hover:bg-muted rounded-lg"
                  title="预览完整内容"
                >
                  <Eye className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                </button>
                <button
                  onClick={handleDeleteClick}
                  disabled={deleting}
                  className={`opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 rounded-lg ${
                    deleting ? 'cursor-not-allowed opacity-50' : 'hover:bg-muted'
                  }`}
                  title={deleting ? '正在删除...' : '删除'}
                >
                  <Trash className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                </button>
              </div>
            )}
          </div>

          {/* 描述 */}
          {knowledge.description && (
            <p className="text-muted-foreground text-sm line-clamp-2">
              {knowledge.description.length > 100
                ? knowledge.description.substring(0, 100) + '...'
                : knowledge.description}
            </p>
          )}

          {/* 底部信息 */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{new Date(knowledge.updated_at).toLocaleDateString('zh-CN')}</span>
              </div>
            </div>
            {knowledge.description && (
              <span className="text-xs text-muted-foreground">
                {knowledge.description.length} 字符
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 删除确认弹窗 */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除该知识库？</AlertDialogTitle>
            <AlertDialogDescription>删除后不可恢复，请谨慎操作。</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>取消</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={deleting}>
              {deleting ? '正在删除...' : '删除'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
