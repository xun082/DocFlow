'use client';

import { useState, useCallback } from 'react';
import { Plus, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

import { CreateKnowledge } from '@/services/knowledge/types';
import { KnowledgeApi } from '@/services/knowledge';
import { storage, STORAGE_KEYS } from '@/utils/localstorage';
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

// 统计展示用工具函数

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

    // 获取 API Key（可选）
    const apiKeys = storage.get(STORAGE_KEYS.API_KEYS);
    const apiKey = apiKeys?.siliconflow;

    // Zod验证 - API Key 为可选字段
    const schema = z.object({
      title: z.string().min(1, '标题不能为空').max(100, '标题不能超过100个字符'),
      description: z.string().min(1, '内容不能为空'),
      apiKey: z.string().optional(), // API Key 设为可选
    });

    // 构建验证数据 - 只有存在API密钥时才包含
    const validationData: any = {
      title: title.trim(),
      description: description.trim(),
    };

    if (apiKey?.trim()) {
      validationData.apiKey = apiKey.trim();
    }

    const validationResult = schema.safeParse(validationData);

    if (!validationResult.success) {
      const errorMsg = validationResult.error.errors[0].message;
      toast.error(errorMsg);
      setIsProcessing(false);

      return;
    }

    const response = await KnowledgeApi.CreateKnowledge(validationResult.data as CreateKnowledge, {
      onError: (error: unknown) => {
        const errorMsg = error instanceof Error ? error.message : '创建知识库失败';
        toast.error(errorMsg);
        setIsProcessing(false);
      },
      unauthorized: () => {
        toast.error('API Key 无效或已过期，请检查配置或联系管理员');
        setIsProcessing(false);
      },
      forbidden: () => {
        toast.error('API Key 权限不足，请联系管理员获取正确的权限');
        setIsProcessing(false);
      },
      serverError: () => {
        toast.error('服务器内部错误，请稍后重试或联系技术支持');
        setIsProcessing(false);
      },
      networkError: () => {
        toast.error('网络连接失败，请检查网络连接后重试');
        setIsProcessing(false);
      },
      default: (error: unknown) => {
        const errorMsg = error instanceof Error ? error.message : '请求失败，请稍后重试';
        toast.error(errorMsg);
        setIsProcessing(false);
      },
    });

    if (response.error) {
      // 如果有错误但没有被 errorHandler 处理，显示通用错误
      toast.error(response.error);
      setIsProcessing(false);

      return;
    }

    if (response.data) {
      toast.success('知识库创建成功！');
      resetForm();
      onOpenChange(false);
      onSuccess?.();
    }

    setIsProcessing(false);
  }, [description, title, isProcessing, resetForm, onOpenChange, onSuccess]);

  const contentSize = new Blob([description]).size;
  const wordCount = getWordCount(description);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>添加知识库</DialogTitle>
          <DialogDescription>
            创建新的知识库
            <br />
          </DialogDescription>
        </DialogHeader>

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
                className="min-h-[400px] resize-y"
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isProcessing || !title.trim() || !description.trim()}
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
      </DialogContent>
    </Dialog>
  );
}
