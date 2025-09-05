'use client';

import { BookOpen, Calendar, X, Eye } from 'lucide-react';
import { useState } from 'react';

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer';
import { ApiKnowledgeItem } from '@/services/knowledge/types';

interface KnowledgeCardProps {
  knowledge: ApiKnowledgeItem;
  onClick?: () => void;
}

export function KnowledgeCard({ knowledge, onClick }: KnowledgeCardProps) {
  const [showDrawer, setShowDrawer] = useState(false);

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

            {/* 预览按钮 */}
            {knowledge.content && (
              <button
                onClick={handlePreviewClick}
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 hover:bg-muted rounded-lg"
                title="预览完整内容"
              >
                <Eye className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>

          {/* 描述 */}
          {knowledge.content && (
            <p className="text-muted-foreground text-sm line-clamp-2">
              {knowledge.content.length > 100
                ? knowledge.content.substring(0, 100) + '...'
                : knowledge.content}
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
            {knowledge.content && (
              <span className="text-xs text-muted-foreground">{knowledge.content.length} 字符</span>
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
                {knowledge.content}
              </div>
            </div>

            {/* 底部信息 */}
            <div className="border-t bg-gray-50 p-4">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>知识库内容</span>
                <span>{knowledge.content?.length || 0} 字符</span>
              </div>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
