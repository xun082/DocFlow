'use client';

import { BookOpen, Calendar, FileText, Link as LinkIcon, Trash } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { formatDateTime } from '@/utils';

interface KnowledgeCardProps {
  knowledge: ApiKnowledgeItem;
  onClick?: () => void;
  onDeleted?: () => void;
}

export function KnowledgeCard({ knowledge, onDeleted }: KnowledgeCardProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleCardClick = () => {
    // 点击整个卡片跳转到详情页
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
      <div
        onClick={handleCardClick}
        className="group relative p-6 border rounded-lg bg-card hover:shadow-md transition-all duration-200 cursor-pointer"
      >
        <div className="space-y-4">
          {/* 标题和图标 */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg line-clamp-1" title={knowledge.title}>
                  {knowledge.title}
                </h3>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                  知识库
                </span>
              </div>
            </div>

            {/* 删除按钮 */}
            <div className="flex items-center gap-1 flex-shrink-0">
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
          </div>

          {/* 描述 */}
          {knowledge.description && (
            <p className="text-muted-foreground text-sm line-clamp-2" title={knowledge.description}>
              {knowledge.description}
            </p>
          )}

          {/* 文件和链接数量统计 */}
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              <span>{knowledge.files_count || 0} 个文件</span>
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <LinkIcon className="h-3 w-3" />
              <span>{knowledge.urls_count || 0} 个链接</span>
            </Badge>
          </div>

          {/* 底部信息 */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span title={knowledge.created_at}>{formatDateTime(knowledge.created_at)}</span>
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
