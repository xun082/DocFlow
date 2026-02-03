'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { BLOG_CATEGORIES } from '@/utils/constants/blog';

const blogFilterSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
});

type BlogFilterFormValues = z.infer<typeof blogFilterSchema>;

export default function BlogFilters({
  initialSearch,
  initialCategory,
}: {
  initialSearch: string;
  initialCategory: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const form = useForm<BlogFilterFormValues>({
    resolver: zodResolver(blogFilterSchema),
    defaultValues: {
      search: '',
      category: 'all',
    },
  });

  useEffect(() => {
    form.reset({
      search: initialSearch,
      category: initialCategory || 'all',
    });
  }, [initialSearch, initialCategory]);

  const updateUrl = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'all') params.set(name, value);
    else params.delete(name);

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleSearchSubmit = (data: BlogFilterFormValues) => {
    updateUrl('search', data.search || '');
  };

  const handleCategoryChange = (value: string) => {
    form.setValue('category', value);
    updateUrl('category', value === 'all' ? '' : value);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSearchSubmit)}
        className="mb-12 flex flex-col md:flex-row gap-4 items-center"
      >
        <FormField
          control={form.control}
          name="search"
          render={({ field }) => (
            <FormItem className="flex-1 w-full">
              <FormControl>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    {...field}
                    type="text"
                    placeholder="按回车搜索标题..."
                    className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-violet-500 placeholder:text-gray-400"
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
            <FormItem className="w-full md:w-[200px] !space-y-0">
              <FormControl>
                <Select value={field.value} onValueChange={handleCategoryChange}>
                  <SelectTrigger className="!h-10 bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="分类" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 text-white">
                    <SelectItem value="all">全部分类</SelectItem>
                    {BLOG_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.key} value={cat.key}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
