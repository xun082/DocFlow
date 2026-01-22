'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FileText, Search } from 'lucide-react';
import Link from 'next/link';

import { BlogCard, BlogItem } from './BlogCard';
import { BlogListSkeleton } from './BlogListSkeleton';

import { blogsClientApi } from '@/services/blogs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { BLOG_CATEGORIES } from '@/utils/constants/blog';
import { ROUTES } from '@/utils/constants/routes';

const searchFormSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
});

type SearchFormData = z.infer<typeof searchFormSchema>;

export function BlogList() {
  const [blogList, setBlogList] = useState<BlogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState<number | null>(null);

  const form = useForm<SearchFormData>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      search: '',
      category: 'ALL',
    },
  });

  const searchQuery = form.watch('search');
  const category = form.watch('category');

  const fetchBlogs = () => {
    setLoading(true);

    const formData = form.getValues();
    blogsClientApi
      .getMyBlogs({
        title: formData.search,
        category: formData.category === 'ALL' ? '' : formData.category,
      })
      .then((res) => {
        setBlogList(res?.data?.data?.list || []);
      })
      .catch((error) => {
        console.error('获取博客列表失败:', error);
        setBlogList([]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleDelete = (id: number) => {
    setBlogToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!blogToDelete) return;

    blogsClientApi
      .delete(blogToDelete)
      .then(() => {
        setBlogList((prev) => prev.filter((blog) => blog.id !== blogToDelete));
        setDeleteDialogOpen(false);
        setBlogToDelete(null);
      })
      .catch((error) => {
        console.error('删除博客失败:', error);
      });
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    fetchBlogs();
  }, [searchQuery, category]);

  return (
    <div className="space-y-6">
      {mounted && (
        <Form {...form}>
          <div className="flex gap-4">
            <FormField
              control={form.control}
              name="search"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="搜索博客标题、摘要或标签"
                        {...field}
                        className="pl-10 h-10"
                      />
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem className="w-[180px]">
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="!h-10 w-full">
                        <SelectValue placeholder="选择分类" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ALL">全部</SelectItem>
                      {BLOG_CATEGORIES.map((category) => (
                        <SelectItem key={category.key} value={category.key}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </div>
        </Form>
      )}

      {!loading && blogList.length > 0 && (
        <div className="text-sm text-muted-foreground">共 {blogList.length} 篇博客</div>
      )}

      {loading && <BlogListSkeleton />}

      {!loading && blogList.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogList.map((blog) => (
            <BlogCard key={blog.id} blog={blog} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {!loading && blogList.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">暂无博客</h3>
          <p className="text-muted-foreground mb-4">开始创建您的第一篇博客</p>
          <Button asChild className="cursor-pointer">
            <Link href={ROUTES.DOCS}>创建博客</Link>
          </Button>
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除这篇博客吗？删除后将无法恢复。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-white"
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
