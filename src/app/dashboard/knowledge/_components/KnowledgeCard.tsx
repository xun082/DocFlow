'use client';

import { BookOpen, Calendar } from 'lucide-react';

import { ApiKnowledgeItem } from '@/services/knowledge/types';

interface KnowledgeCardProps {
  knowledge: ApiKnowledgeItem;
  onClick?: () => void;
}

export function KnowledgeCard({ knowledge, onClick }: KnowledgeCardProps) {
  return (
    <div
      className="p-6 border rounded-lg bg-card hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="space-y-4">
        {/* 标题和图标 */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg line-clamp-1">{knowledge.title}</h3>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                知识库
              </span>
            </div>
          </div>
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
        </div>
      </div>
    </div>
  );
}
