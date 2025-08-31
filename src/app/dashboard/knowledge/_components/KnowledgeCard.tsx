'use client';

import { BookOpen, Calendar, FileText } from 'lucide-react';

import { KnowledgeBase } from '@/services/knowledge/types';

interface KnowledgeCardProps {
  knowledge: KnowledgeBase;
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
              {knowledge.category && (
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                  {knowledge.category}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 描述 */}
        {knowledge.description && (
          <p className="text-muted-foreground text-sm line-clamp-2">{knowledge.description}</p>
        )}

        {/* 底部信息 */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {knowledge.itemCount && (
              <div className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                <span>{knowledge.itemCount} 项</span>
              </div>
            )}
            {knowledge.lastUpdated && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{knowledge.lastUpdated}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
