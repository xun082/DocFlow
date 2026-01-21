import Link from 'next/link';
import { Calendar, Eye, Heart } from 'lucide-react';

import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export interface BlogItem {
  id: string;
  title: string;
  excerpt: string;
  coverImage?: string;
  author: {
    name: string;
    avatar?: string;
  };
  createdAt: string;
  views: number;
  likes: number;
  tags: string[];
}

interface BlogCardProps {
  blog: BlogItem;
}

export function BlogCard({ blog }: BlogCardProps) {
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
          {blog.tags.map((tag) => (
            <span key={tag} className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
              {tag}
            </span>
          ))}
        </div>
        <h3 className="font-semibold text-lg mb-2 line-clamp-2 hover:text-primary transition-colors">
          <Link href={`/dashboard/blogs/${blog.id}`}>{blog.title}</Link>
        </h3>
        <p className="text-muted-foreground text-sm line-clamp-2">{blog.excerpt}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={blog.author.avatar} />
            <AvatarFallback>{blog.author.name.slice(0, 2)}</AvatarFallback>
          </Avatar>
          <span className="text-sm text-muted-foreground">{blog.author.name}</span>
        </div>
        <div className="flex items-center space-x-4 text-muted-foreground text-sm">
          <div className="flex items-center space-x-1">
            <Calendar className="h-3 w-3" />
            <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </CardFooter>
      <div className="px-4 pb-4 flex items-center justify-between text-muted-foreground text-sm">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <Eye className="h-4 w-4" />
            <span>{blog.views}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Heart className="h-4 w-4" />
            <span>{blog.likes}</span>
          </div>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/dashboard/blogs/${blog.id}`}>阅读更多</Link>
        </Button>
      </div>
    </Card>
  );
}
