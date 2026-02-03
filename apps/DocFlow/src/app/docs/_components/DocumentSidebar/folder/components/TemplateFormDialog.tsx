'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import Textarea from '@/components/ui/Textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TemplateResponse } from '@/services/template/type';

const CATEGORIES = [
  { category: 'TECH', name: '技术', icon: 'Code' },
  { category: 'BUSINESS', name: '商务', icon: 'Users' },
  { category: 'PROJECT', name: '项目', icon: 'Calendar' },
  { category: 'EDUCATION', name: '教育', icon: 'BookOpen' },
  { category: 'PRODUCT', name: '产品', icon: 'Package' },
  { category: 'DESIGN', name: '设计', icon: 'Palette' },
];

const formSchema = z.object({
  name: z.string().min(1, '名称不能为空'),
  description: z.string().min(1, '描述不能为空'),
  category: z.string().min(1, '请选择分类'),
  tags: z.string().min(1, '至少添加一个标签'),
  content: z.string().min(1, '内容不能为空'),
});

type FormValues = z.infer<typeof formSchema>;

interface TemplateFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (data: FormValues) => void;
  template?: TemplateResponse | null;
}

export function TemplateFormDialog({
  open,
  onOpenChange,
  onConfirm,
  template,
}: TemplateFormDialogProps) {
  const [tags, setTags] = useState<string>('');
  const [newTag, setNewTag] = useState('');

  const isEditMode = !!template;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      category: '',
      tags: '',
      content: '',
    },
  });

  useEffect(() => {
    if (isEditMode) {
      form.reset(template);
      setTags(template.tags || '');
    } else {
      form.reset({
        name: '',
        description: '',
        category: '',
        tags: '',
        content: '',
      });
      setTags('');
    }
  }, [template, isEditMode, form]);

  const handleAddTag = () => {
    if (newTag.trim()) {
      const currentTags = tags
        ? tags
            .split(',')
            .map((t) => t.trim())
            .filter((t) => t)
        : [];

      if (!currentTags.includes(newTag.trim())) {
        const updatedTags = [...currentTags, newTag.trim()];
        const tagsString = updatedTags.join(',');
        setTags(tagsString);
        form.setValue('tags', tagsString);
      }

      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const currentTags = tags
      ? tags
          .split(',')
          .map((t) => t.trim())
          .filter((t) => t)
      : [];
    const updatedTags = currentTags.filter((tag) => tag !== tagToRemove);
    const tagsString = updatedTags.join(',');
    setTags(tagsString);
    form.setValue('tags', tagsString);
  };

  const handleSubmit = (data: FormValues) => {
    onConfirm(data);
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>{isEditMode ? '编辑模版' : '创建模版'}</AlertDialogTitle>
        </AlertDialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>名称</FormLabel>
                  <FormControl>
                    <Input placeholder="输入文档名称" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>描述</FormLabel>
                  <FormControl>
                    <Input placeholder="输入文档描述" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>分类</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="选择分类" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((category) => (
                        <SelectItem key={category.category} value={category.category}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tags"
              render={() => (
                <FormItem>
                  <FormLabel>标签</FormLabel>
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {tags
                        .split(',')
                        .filter((t) => t)
                        .map((tag) => (
                          <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                            {tag}
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(tag)}
                              className="ml-1 hover:text-destructive transition-colors"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="输入标签并按回车"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddTag();
                          }
                        }}
                        className="flex-1"
                      />
                      <Button type="button" variant="outline" onClick={handleAddTag}>
                        <Plus className="h-4 w-4 mr-1" />
                        添加
                      </Button>
                    </div>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>预览内容</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="输入预览内容（Markdown格式）"
                      className="resize-y min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => onOpenChange(false)}>取消</AlertDialogCancel>
              <Button type="submit">{isEditMode ? '更新' : '创建'}</Button>
            </AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
