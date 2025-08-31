'use client';

import { useState, Suspense } from 'react';
import { Plus } from 'lucide-react';

import { KnowledgeList } from './_components/KnowledgeList';
import { CreateKnowledgeDialog } from './_components/CreateKnowledgeDialog';
import { KnowledgeListSkeleton } from './_components/KnowledgeListSkeleton';

import { Button } from '@/components/ui/button';

export default function KnowledgePage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // 创建成功后刷新列表
  const handleCreateSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="p-6 space-y-6">
      {/* 页面标题和操作栏 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">知识库</h1>
          <p className="text-muted-foreground mt-2">管理和组织您的知识文档</p>
        </div>
        <Button className="flex items-center gap-2" onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          添加知识库
        </Button>
      </div>

      {/* 知识库列表组件 - 用Suspense包装 */}
      <Suspense fallback={<KnowledgeListSkeleton />}>
        <KnowledgeList
          onCreateClick={() => setIsDialogOpen(true)}
          refreshTrigger={refreshTrigger}
        />
      </Suspense>

      {/* 创建知识库对话框 */}
      <CreateKnowledgeDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
}
