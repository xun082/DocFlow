'use client';

import { BookOpen, Calendar, X, Eye, Trash } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import KnowledgeDocumentList from './KnowledgeDocumentList';

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer';
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
  const [showDrawer, setShowDrawer] = useState(false);
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
    setShowDrawer(true);
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

      {/* 使用优化后的 Drawer 组件 */}
      <Drawer open={showDrawer} onOpenChange={setShowDrawer}>
        <DrawerContent side="right" width="500px">
          <div className="flex flex-col h-full">
            {/* 头部 */}
            <DrawerHeader className="border-b bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <DrawerTitle className="text-lg font-semibold text-gray-900">
                      {knowledge.title}
                    </DrawerTitle>
                    <DrawerDescription className="text-sm text-gray-500">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        更新于 {new Date(knowledge.updated_at).toLocaleDateString('zh-CN')}
                      </span>
                    </DrawerDescription>
                  </div>
                </div>
                <button
                  onClick={() => setShowDrawer(false)}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <X className="h-4 w-4 text-gray-600" />
                </button>
              </div>
            </DrawerHeader>

            {/* 内容区域 */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800">
                {knowledge.description}
              </div>

              <div className="mt-6">
                <KnowledgeDocumentList knowledgeId={knowledge.id} />
              </div>
            </div>

            {/* 底部信息 */}
            <div className="border-t bg-gray-50 p-4">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>知识库内容</span>
                <span>{knowledge.description?.length || 0} 字符</span>
              </div>
            </div>
          </div>
        </DrawerContent>
      </Drawer>

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
