'use client';

import { Suspense } from 'react';
import { Plus } from 'lucide-react';

import { BlogList } from './_components/BlogList';
import { BlogListSkeleton } from './_components/BlogListSkeleton';

import { Button } from '@/components/ui/button';

export default function BlogsPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">博客</h1>
          <p className="text-muted-foreground mt-2">管理和发布您的博客文章</p>
        </div>
        <Button className="flex items-center gap-2 cursor-pointer">
          <Plus className="h-4 w-4" />
          创建博客
        </Button>
      </div>

      <Suspense fallback={<BlogListSkeleton />}>
        <BlogList />
      </Suspense>
    </div>
  );
}
