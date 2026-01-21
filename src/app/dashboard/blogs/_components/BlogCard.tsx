import Link from 'next/link';
import { Calendar, ArrowRight } from 'lucide-react';

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
}

export function BlogCard({ blog }: BlogCardProps) {
  const tags = blog.tags
    ? blog.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean)
    : [];

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {blog.coverImage && (
        <div className="aspect-video w-full overflow-hidden">
          <img
            src={blog.coverImage}
            alt={blog.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      <CardContent className="p-4">
        <div className="flex flex-wrap gap-2 mb-3">
          {tags.map((tag, index) => (
            <span
              key={`${tag}-${index}`}
              className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary"
            >
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
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/dashboard/blogs/${blog.id}`} className="flex items-center gap-1">
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </Card>
  );
}
