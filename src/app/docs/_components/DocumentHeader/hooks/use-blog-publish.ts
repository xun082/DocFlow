import { useState } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';
import type { Editor } from '@tiptap/react';

import { blogsClientApi } from '@/services/blogs';

// 博客表单输入数据 schema（允许可选字段）
export const blogFormInputSchema = z.object({
  title: z.string().max(100, '标题不能超过100字').optional(),
  summary: z.string().max(500, '摘要不能超过500字').optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).min(1, '至少添加一个标签'),
  coverImage: z.string().url('封面图片链接格式不正确').optional().or(z.literal('')),
});

export type BlogFormInput = z.infer<typeof blogFormInputSchema>;

// 发布请求数据校验 schema（完整校验）
const blogPublishSchema = z.object({
  title: z.string().min(1, '标题不能为空').max(100, '标题不能超过100字'),
  summary: z.string().max(500, '摘要不能超过500字').default(''),
  category: z.string().default('OTHER'),
  tags: z.array(z.string()).min(1, '至少添加一个标签'),
  coverImage: z.string().url('封面图片链接格式不正确').optional().or(z.literal('')),
  content: z.string().min(1, '文档内容不能为空'),
});

export function useBlogPublish(editor: Editor | null, defaultTitle: string) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBlogSubmit = async (data: BlogFormInput): Promise<boolean> => {
    const htmlContent = editor?.getHTML();

    // 使用 zod 校验完整的发布数据
    const validationResult = blogPublishSchema.safeParse({
      ...data,
      title: data.title || defaultTitle,
      content: htmlContent,
    });

    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      toast.error(firstError.message);

      return false;
    }

    const validatedData = validationResult.data;

    setIsSubmitting(true);

    const { error } = await blogsClientApi.create({
      title: validatedData.title,
      summary: validatedData.summary || '',
      content: validatedData.content,
      category: validatedData.category || 'OTHER',
      tags: validatedData.tags.join(','),
      coverImage: validatedData.coverImage || '',
    });

    setIsSubmitting(false);

    if (error) {
      toast.error(error);

      return false;
    }

    toast.success('博客发布成功');

    return true;
  };

  return {
    handleBlogSubmit,
    isSubmitting,
    blogFormInputSchema,
  };
}
