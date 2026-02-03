'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, ArrowRight, Trash2 } from 'lucide-react';

import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BLOG_CATEGORIES } from '@/utils/constants/blog';
import { formatDateTime } from '@/utils/format/date';

export interface BlogItem {
  id: number;
  title: string;
  summary: string;
  coverImage?: string;
  tags: string;
  category: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface BlogCardProps {
  blog: BlogItem;
  onDelete?: (id: number) => void;
}

export function BlogCard({ blog, onDelete }: BlogCardProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const tags = blog.tags
    ? blog.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean)
    : [];

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 relative">
      {blog.coverImage && (
        <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
          <img
            src={blog.coverImage}
            alt={blog.title}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full object-cover"
          />
        </div>
      )}
      <CardContent className="p-4">
        <div className="flex flex-wrap gap-2 mb-3">
          {tags.map((tag) => (
            <span key={tag} className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
              {tag}
            </span>
          ))}
        </div>
        <h3 className="font-semibold text-lg mb-2 line-clamp-2 hover:text-primary transition-colors">
          <Link href={`/dashboard/blogs/${blog.id}`}>{blog.title}</Link>
        </h3>
        <p className="text-muted-foreground text-sm line-clamp-2">{blog.summary}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <div className="flex items-center space-x-4 text-muted-foreground text-sm">
          <div className="flex items-center space-x-1">
            <Calendar className="h-3 w-3" />
            <span>{formatDateTime(blog.createdAt)}</span>
          </div>
        </div>
      </CardFooter>
      <div className="px-4 pb-4 flex items-center justify-between text-muted-foreground text-sm">
        <div className="flex items-center space-x-4">
          <span className="text-xs px-2 py-1 rounded-full bg-secondary/50">
            {BLOG_CATEGORIES.find((item) => item.key === blog.category)?.label || blog.category}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(blog.id)}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/blog/${blog.id}`} className="flex items-center gap-1">
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}
