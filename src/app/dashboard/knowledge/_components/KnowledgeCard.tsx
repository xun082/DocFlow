import type { KnowledgeBase } from '../types';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface KnowledgeCardProps {
  knowledge: KnowledgeBase;
  onClick?: (knowledge: KnowledgeBase) => void;
}

export function KnowledgeCard({ knowledge, onClick }: KnowledgeCardProps) {
  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onClick?.(knowledge)}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{knowledge.title}</CardTitle>
          <span className="px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded-full">
            {knowledge.category}
          </span>
        </div>
        <CardDescription className="line-clamp-2">{knowledge.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{knowledge.itemCount} 个条目</span>
          <span>更新于 {knowledge.lastUpdated}</span>
        </div>
      </CardContent>
    </Card>
  );
}
