'use client';

import { useEffect, useState } from 'react';
import { FileText } from 'lucide-react';

import { BlogCard, BlogItem } from './BlogCard';
import { BlogListSkeleton } from './BlogListSkeleton';

import { blogsClientApi } from '@/services/blogs';
import { Button } from '@/components/ui/button';

export function BlogList() {
  const [blogList, setBlogList] = useState<BlogItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    blogsClientApi
      .getMyBlogs()
      .then((res) => {
        setBlogList(res?.data?.data || []);
      })
      .catch((error) => {
        console.error('获取博客列表失败:', error);
        setBlogList([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6">
      {!loading && blogList.length > 0 && (
        <div className="text-sm text-muted-foreground">共 {blogList.length} 篇博客</div>
      )}

      {loading && <BlogListSkeleton />}

      {!loading && blogList.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogList.map((blog) => (
            <BlogCard key={blog.id} blog={blog} />
          ))}
        </div>
      )}

      {!loading && blogList.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">暂无博客</h3>
          <p className="text-muted-foreground mb-4">开始创建您的第一篇博客</p>
          <Button className="cursor-pointer">创建博客</Button>
        </div>
      )}
    </div>
  );
}
