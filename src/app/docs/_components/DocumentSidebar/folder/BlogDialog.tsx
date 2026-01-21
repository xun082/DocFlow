'use client';

import { useEffect, useState } from 'react';
import { X, Image as ImageIcon, Plus, Trash2 } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { uploadService } from '@/services/upload';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// 从 blog/page.tsx 复制的分类
const BLOG_CATEGORIES = [
  { key: 'ALL', label: '全部' },
  { key: 'TECH', label: '技术' },
  { key: 'LIFE', label: '生活' },
  { key: 'STUDY', label: '学习' },
  { key: 'ENTERTAINMENT', label: '娱乐' },
  { key: 'SPORTS', label: '运动' },
  { key: 'TRAVEL', label: '旅游' },
  { key: 'FOOD', label: '美食' },
  { key: 'PHOTOGRAPHY', label: '摄影' },
  { key: 'MUSIC', label: '音乐' },
  { key: 'MOVIE', label: '电影' },
  { key: 'READING', label: '阅读' },
  { key: 'OTHER', label: '其他' },
] as const;

// 表单验证模式
const formSchema = z.object({
  title: z.string().min(1, '标题不能为空'),
  summary: z.string().min(1, '摘要不能为空').max(500, '摘要不能超过500字'),
  category: z.string().min(1, '请选择分类'),
  tags: z.array(z.string()).min(1, '至少添加一个标签'),
  coverImage: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface BlogDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormValues) => void;
  htmlContent?: string;
  initialTitle?: string;
}

export function BlogDialog({ isOpen, onClose, onSubmit, initialTitle = '' }: BlogDialogProps) {
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialTitle,
      summary: '',
      category: '',
      tags: [],
      coverImage: undefined,
    },
  });

  // 当 initialTitle 变化时更新表单标题
  useEffect(() => {
    form.setValue('title', initialTitle);
  }, [initialTitle, form]);

  // 添加标签
  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      const updatedTags = [...tags, newTag.trim()];
      setTags(updatedTags);
      form.setValue('tags', updatedTags);
      setNewTag('');
    }
  };

  // 删除标签
  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = tags.filter((tag) => tag !== tagToRemove);
    setTags(updatedTags);
    form.setValue('tags', updatedTags);
  };

  // 图片上传处理
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      // 检查文件类型
      if (!file.type.startsWith('image/')) {
        toast.error('请选择图片文件');

        return;
      }

      // 检查文件大小（限制为5MB）
      if (file.size > 5 * 1024 * 1024) {
        toast.error('图片大小不能超过5MB');

        return;
      }

      setIsUploading(true);

      // 读取文件并显示预览
      const reader = new FileReader();

      reader.onload = (event) => {
        const result = event.target?.result as string;
        setImagePreview(result);
      };

      reader.readAsDataURL(file);

      try {
        // 使用项目现有的uploadService上传图片
        const imageUrl = await uploadService.uploadImage(file);

        // 保存服务器返回的图片URL
        form.setValue('coverImage', imageUrl);
        toast.success('图片上传成功');
      } catch (error) {
        console.error('上传图片失败:', error);
        toast.error('图片上传失败，请重试');
        setImagePreview(null);
        form.setValue('coverImage', undefined);
      } finally {
        setIsUploading(false);
      }
    }
  };

  // 移除图片
  const handleRemoveImage = () => {
    setImagePreview(null);
    form.setValue('coverImage', undefined);
  };

  // 表单提交
  const handleSubmit = (data: FormValues) => {
    console.log('🚀 ~ file: BlogDialog.tsx:167 ~ data:', data);
    onSubmit(data);
    onClose();
    // 重置表单
    form.reset();
    setTags([]);
    setImagePreview(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>创建博客文章</DialogTitle>
          <DialogDescription>填写博客文章的详细信息</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* 标题 */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>标题</FormLabel>
                  <FormControl>
                    <Input placeholder="输入博客标题" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 摘要 */}
            <FormField
              control={form.control}
              name="summary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>摘要</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="输入博客摘要（最多500字）"
                      className="resize-y min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <div className="flex justify-between items-center mt-1">
                    <FormMessage />
                    <span className="text-sm text-muted-foreground">{field.value.length}/500</span>
                  </div>
                </FormItem>
              )}
            />

            {/* 分类选择 */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>分类</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择分类" />
                    </SelectTrigger>
                    <SelectContent>
                      {BLOG_CATEGORIES.map((category) => (
                        <SelectItem key={category.key} value={category.key}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 标签 */}
            <FormField
              control={form.control}
              name="tags"
              render={() => (
                <FormItem>
                  <FormLabel>标签</FormLabel>
                  <div className="space-y-2">
                    {/* 标签列表 */}
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
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
                    {/* 添加标签输入 */}
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

            {/* 图片上传 */}
            <FormField
              control={form.control}
              name="coverImage"
              render={() => (
                <FormItem>
                  <FormLabel>封面图片</FormLabel>
                  <div className="space-y-2">
                    {imagePreview ? (
                      <Card className="overflow-hidden">
                        <div className="relative">
                          <img
                            src={imagePreview}
                            alt="封面预览"
                            className="w-full h-48 object-cover"
                          />
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="absolute top-2 right-2 bg-white/80 p-1 rounded-full hover:bg-white transition-colors shadow-sm"
                          >
                            <X className="h-4 w-4 text-destructive" />
                          </button>
                        </div>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">封面图片已上传</p>
                        </CardContent>
                      </Card>
                    ) : (
                      <label
                        htmlFor="image-upload"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-input rounded-md cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <ImageIcon className="h-6 w-6 mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">点击上传或拖拽文件</p>
                          <p className="text-xs text-muted-foreground mt-1">支持 JPG、PNG 格式</p>
                        </div>
                        <input
                          id="image-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                        />
                      </label>
                    )}
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                取消
              </Button>
              <Button type="submit" disabled={isUploading}>
                {isUploading ? '上传中...' : '创建'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default BlogDialog;
