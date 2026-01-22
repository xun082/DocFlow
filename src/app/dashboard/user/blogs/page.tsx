'use client';

import { Suspense } from 'react';

import { BlogList } from './_components/BlogList';
import { BlogListSkeleton } from './_components/BlogListSkeleton';

export default function BlogsPage() {
  return (
    <div className="p-6 space-y-6">
      <Suspense fallback={<BlogListSkeleton />}>
        <BlogList />
      </Suspense>
    </div>
  );
}
