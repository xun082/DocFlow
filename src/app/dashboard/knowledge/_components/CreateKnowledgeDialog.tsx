'use client';

import { useState, useCallback, Activity } from 'react';
import { Plus, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

import { CreateKnowledge } from '@/services/knowledge/types';
import { KnowledgeApi } from '@/services/knowledge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Textarea from '@/components/ui/Textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface CreateKnowledgeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateKnowledgeDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateKnowledgeDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // 格式化文本内容大小
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 计算字数
  const getWordCount = (text: string): number => {
    // 中文字符 + 英文单词
    const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
    const englishWords = (text.match(/[a-zA-Z]+/g) || []).length;

    return chineseChars + englishWords;
  };

  // 重置表单
  const resetForm = useCallback(() => {
    setTitle('');
    setDescription('');
  }, []);

  // 提交表单
  const handleSubmit = useCallback(async () => {
    if (isProcessing) return;

    setIsProcessing(true);

    try {
      const schema = z.object({
        title: z.string().min(1, '标题不能为空').max(100, '标题不能超过100个字符'),
        description: z.string().min(1, '内容不能为空'),
      });

      const validationData: any = {
        title: title.trim(),
        description: description.trim(),
      };

      const validationResult = schema.safeParse(validationData);

      if (!validationResult.success) {
        const errorMsg = validationResult.error.errors[0].message;
        toast.error(errorMsg);
        setIsProcessing(false);

        return;
      }

      const response = await KnowledgeApi.CreateKnowledge(
        validationResult.data as CreateKnowledge,
        {
          onError: (error: unknown) => {
            const errorMsg = error instanceof Error ? error.message : '创建知识库失败';
            toast.error(errorMsg);
            setIsProcessing(false);
          },
        },
      );

      if (response.error) {
        // 如果有错误但没有被 errorHandler 处理，显示通用错误
        toast.error(response.error);
        setIsProcessing(false);

        return;
      }

      if (response.data) {
        toast.success('知识库创建成功！');
        resetForm();
        // 先触发刷新，再关闭对话框
        onSuccess?.();
        // 稍微延迟关闭对话框，确保刷新触发
        setTimeout(() => {
          onOpenChange(false);
        }, 100);
      }

      setIsProcessing(false);
    } catch (error) {
      // 捕获未预期的网络异常或其他错误
      const errorMsg = error instanceof Error ? error.message : '创建知识库时发生未知错误';
      console.error('创建知识库失败:', error);
      toast.error(errorMsg);
      setIsProcessing(false);
    }
  }, [description, title, isProcessing, resetForm, onOpenChange, onSuccess]);

  const contentSize = new Blob([description]).size;
  const wordCount = getWordCount(description);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>添加知识库</DialogTitle>
          <DialogDescription>创建新的知识库</DialogDescription>
        </DialogHeader>

        <Activity mode={open ? 'visible' : 'hidden'}>
          <div className="space-y-6">
            {/* 标题输入 */}
            <div className="space-y-2">
              <Label htmlFor="title">标题 *</Label>
              <Input
                id="title"
                placeholder="请输入知识库标题"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isProcessing}
              />
            </div>

            {/* 内容输入区域 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="description">描述 *</Label>
              </div>

              <div className="relative">
                <Textarea
                  id="description"
                  placeholder="请输入知识库内容，支持 Markdown 格式..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[200px] resize-y"
                  disabled={isProcessing}
                />

                {/* 统计信息 */}
                <div className="absolute bottom-3 right-3 flex items-center gap-3 text-xs text-muted-foreground bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-md border">
                  <div className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    <span>{wordCount} 字</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>{formatFileSize(contentSize)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>支持 Markdown 格式</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="cursor-pointer"
            >
              取消
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isProcessing || !title.trim() || !description.trim()}
              className="cursor-pointer disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  创建中...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  创建知识库
                </>
              )}
            </Button>
          </DialogFooter>
        </Activity>
      </DialogContent>
    </Dialog>
  );
}
