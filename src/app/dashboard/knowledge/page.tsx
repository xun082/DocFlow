'use client';

import { useState, useRef, useCallback } from 'react';
import { Search, Plus, BookOpen, FileText, Upload, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

import { CreateKnowledgeSchema, KnowledgeBase } from './types';
import { KnowledgeCard } from './_components/KnowledgeCard';

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
import { Alert, AlertDescription } from '@/components/ui/alert';

// API Key configuration - should be moved to environment variables in production
const API_KEY =
  process.env.NEXT_PUBLIC_KNOWLEDGE_API_KEY ||
  'sk-phjxmuhdlfheyxzqdhviixdpkjarcsqysncucualaflbqohw';

// File size limit (100KB)
const MAX_FILE_SIZE = 100 * 1024;

// Supported file types
const SUPPORTED_FILE_TYPES = {
  'text/markdown': ['.md'],
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'text/plain': ['.txt'],
};

export default function KnowledgePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 模拟知识库数据
  const knowledgeBases: KnowledgeBase[] = [
    {
      id: 1,
      title: '产品需求文档',
      description: '包含所有产品功能需求和用户故事',
      itemCount: 25,
      lastUpdated: '2024-01-15',
      category: '产品',
    },
    {
      id: 2,
      title: '技术文档',
      description: '系统架构、API文档和开发指南',
      itemCount: 18,
      lastUpdated: '2024-01-12',
      category: '技术',
    },
    {
      id: 3,
      title: '用户手册',
      description: '用户操作指南和常见问题解答',
      itemCount: 12,
      lastUpdated: '2024-01-10',
      category: '用户',
    },
  ];

  const filteredKnowledgeBases = knowledgeBases.filter(
    (kb) =>
      kb.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      kb.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // 验证文件类型
  const isValidFileType = useCallback((file: File): boolean => {
    const validTypes = Object.keys(SUPPORTED_FILE_TYPES);
    const validExtensions = Object.values(SUPPORTED_FILE_TYPES).flat();

    return (
      validTypes.includes(file.type) ||
      validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext))
    );
  }, []);

  // 文件解析函数
  const parseFile = useCallback(async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (e) => {
        const result = e.target?.result;

        try {
          if (file.type === 'text/markdown' || file.name.endsWith('.md')) {
            // Markdown 文件直接读取文本内容
            resolve(result as string);
          } else if (file.type === 'application/pdf') {
            // PDF 文件解析 (这里模拟解析，实际项目中需要使用 pdf-parse 等库)
            toast.info('PDF 文件解析功能需要后端支持，当前仅显示文件名');
            resolve(`[PDF文件: ${file.name}]\n\n这里应该是PDF的文本内容...`);
          } else if (
            file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          ) {
            // DOCX 文件解析 (这里模拟解析，实际项目中需要使用 mammoth 等库)
            toast.info('DOCX 文件解析功能需要后端支持，当前仅显示文件名');
            resolve(`[DOCX文件: ${file.name}]\n\n这里应该是DOCX的文本内容...`);
          } else {
            // 其他文本文件
            resolve(result as string);
          }
        } catch (error) {
          reject(new Error(`文件解析失败: ${error instanceof Error ? error.message : '未知错误'}`));
        }
      };

      reader.onerror = () => reject(new Error('文件读取失败'));

      // 根据文件类型选择读取方式
      if (
        file.type === 'application/pdf' ||
        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ) {
        reader.readAsArrayBuffer(file);
      } else {
        reader.readAsText(file, 'UTF-8');
      }
    });
  }, []);

  // 处理文件上传
  const handleFileUpload = useCallback(
    async (files: FileList | null) => {
      if (!files) return;

      // 过滤有效文件
      const validFiles = Array.from(files).filter(isValidFileType);
      const invalidFiles = Array.from(files).filter((file) => !isValidFileType(file));

      if (invalidFiles.length > 0) {
        toast.error(`不支持的文件格式: ${invalidFiles.map((f) => f.name).join(', ')}`);
      }

      if (validFiles.length === 0) {
        toast.error('请上传支持的文件格式：MD、PDF、DOCX、TXT');

        return;
      }

      // 检查文件大小
      const oversizedFiles = validFiles.filter((file) => file.size > MAX_FILE_SIZE);

      if (oversizedFiles.length > 0) {
        toast.error(`文件过大: ${oversizedFiles.map((f) => f.name).join(', ')} (最大100KB)`);

        return;
      }

      setIsProcessing(true);
      setSubmitError(null);
      setUploadedFiles((prev) => [...prev, ...validFiles]);

      try {
        let combinedContent = content;
        const processedFiles: string[] = [];

        for (const file of validFiles) {
          try {
            const fileContent = await parseFile(file);

            combinedContent +=
              (combinedContent ? '\n\n' : '') + `## ${file.name}\n\n${fileContent}`;
            processedFiles.push(file.name);
          } catch (error) {
            console.error(`Error processing file ${file.name}:`, error);
            toast.error(
              `处理文件 ${file.name} 失败: ${error instanceof Error ? error.message : '未知错误'}`,
            );
          }
        }

        if (processedFiles.length > 0) {
          setContent(combinedContent);
          toast.success(`成功处理 ${processedFiles.length} 个文件`);
        }
      } catch (error) {
        toast.error('文件处理失败');
        console.error('File processing error:', error);
      } finally {
        setIsProcessing(false);
      }
    },
    [content, isValidFileType, parseFile],
  );

  // 重置表单
  const resetForm = useCallback(() => {
    setTitle('');
    setContent('');
    setUploadedFiles([]);
    setSubmitError(null);
    setIsDialogOpen(false);

    // 重置文件输入
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  // 提交表单 - 集成API调用和Zod验证
  const handleSubmit = useCallback(async () => {
    // 防止重复提交
    if (isProcessing) {
      return;
    }

    setSubmitError(null);

    try {
      // 使用Zod验证数据
      const trimmedContent = content.trim();
      const trimmedTitle = title.trim();

      // 检查内容长度（限制为100KB，避免请求过大）
      const contentSize = new Blob([trimmedContent]).size;

      if (contentSize > MAX_FILE_SIZE) {
        const errorMsg = `内容过大，请减少内容长度（最大${(MAX_FILE_SIZE / 1024).toFixed(0)}KB）`;

        setSubmitError(errorMsg);
        toast.error(errorMsg);

        return;
      }

      const validatedData = CreateKnowledgeSchema.parse({
        apiKey: API_KEY,
        title: trimmedTitle,
        content: trimmedContent,
      });

      console.log('发送数据:', {
        title: validatedData.title,
        contentLength: validatedData.content.length,
        contentSize: `${(contentSize / 1024).toFixed(2)}KB`,
      });

      setIsProcessing(true);

      // 调用API创建知识库
      const result = await KnowledgeApi.CreateKnowledge(
        {
          apiKey: validatedData.apiKey,
          title: validatedData.title,
          content: validatedData.content,
        },
        (error) => {
          console.error('API Error:', error);

          const errorMsg = (error as any)?.message || '创建知识库失败';

          setSubmitError(errorMsg);
          // 错误处理已经在 errorHandler 中处理，这里不需要再显示 toast
        },
      );

      console.log('API响应:', result);

      if (result?.error) {
        const errorMsg = result.error;

        setSubmitError(errorMsg);
        toast.error(errorMsg);
      } else {
        toast.success('知识库创建成功！');
        resetForm();
      }
    } catch (error) {
      let errorMsg = '创建知识库失败';

      if (error instanceof z.ZodError) {
        // 处理Zod验证错误
        const firstError = error.errors[0];

        errorMsg = firstError.message;
      } else if (error instanceof Error) {
        errorMsg = error.message;
      }

      setSubmitError(errorMsg);
      toast.error(errorMsg);
      console.error('Submit error:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [content, title, isProcessing, resetForm]);

  return (
    <div className="p-6 space-y-6">
      {/* 页面标题和操作栏 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">知识库</h1>
          <p className="text-muted-foreground mt-2">管理和组织您的知识文档</p>
        </div>
        <Button className="flex items-center gap-2" onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          添加知识库
        </Button>
      </div>

      {/* 搜索栏 */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="搜索知识库..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* 知识库列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredKnowledgeBases.map((kb) => (
          <KnowledgeCard
            key={kb.id}
            knowledge={kb}
            onClick={() => {
              // 这里可以添加点击知识库卡片的逻辑
              console.log('点击知识库:', kb.title);
            }}
          />
        ))}
      </div>

      {/* 空状态 */}
      {filteredKnowledgeBases.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">没有找到知识库</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery ? '尝试调整搜索条件' : '开始创建您的第一个知识库'}
          </p>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            创建知识库
          </Button>
        </div>
      )}

      {/* 添加知识库对话框 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-xl font-semibold">添加知识库</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              创建新的知识库，支持手动输入或上传文档文件
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* 错误提示 */}
            {submitError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            )}

            {/* 标题输入 */}
            <div className="space-y-3">
              <Label htmlFor="title" className="text-sm font-medium">
                标题 *
              </Label>
              <Input
                id="title"
                placeholder="请输入知识库标题"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="border-2 focus:border-primary/50 transition-colors"
                disabled={isProcessing}
              />
            </div>

            {/* 内容输入区域 */}
            <div className="space-y-3">
              {/* 标签和上传按钮 */}
              <div className="flex items-center justify-between">
                <Label htmlFor="content" className="text-sm font-medium">
                  内容 *
                </Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessing}
                    className="h-7 px-3 text-xs border-dashed hover:border-solid transition-all"
                  >
                    <Upload className="h-3 w-3 mr-1.5" />
                    {isProcessing ? '处理中...' : '上传文件'}
                  </Button>
                  {uploadedFiles.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                        {uploadedFiles.length} 个文件
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setUploadedFiles([]);

                          if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                          }
                        }}
                        className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                      >
                        清除
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* 文件输入 */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".md,.pdf,.docx,.txt"
                onChange={(e) => handleFileUpload(e.target.files)}
                className="hidden"
              />

              {/* 文本域 */}
              <div className="relative">
                <Textarea
                  id="content"
                  placeholder="请输入知识库内容，支持 Markdown 格式...&#10;&#10;或点击右上角上传文件按钮导入 MD、PDF、DOCX 文档"
                  value={content}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setContent(e.target.value)
                  }
                  className="min-h-[320px] resize-y border-2 focus:border-primary/50 transition-colors"
                  disabled={isProcessing}
                />
                {/* 字符计数和大小提示 */}
                <div className="absolute bottom-3 right-3 text-xs text-muted-foreground bg-background/80 backdrop-blur-sm px-2 py-1 rounded">
                  {content.length} 字符 | {(new Blob([content]).size / 1024).toFixed(1)}KB
                  {new Blob([content]).size > 100 * 1024 && (
                    <span className="text-red-500 ml-1">过大</span>
                  )}
                </div>
              </div>

              {/* 支持格式提示 */}
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  支持 Markdown 格式 | 可上传 MD、PDF、DOCX、TXT 文件自动解析
                </p>
                <p className="text-xs text-muted-foreground">
                  内容限制: {(MAX_FILE_SIZE / 1024).toFixed(0)}KB
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-6 border-t">
            <div className="flex items-center gap-3 w-full">
              <Button variant="outline" onClick={resetForm} className="flex-1 sm:flex-none">
                取消
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isProcessing || !title.trim() || !content.trim()}
                className="flex-1 sm:flex-none bg-primary hover:bg-primary/90"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    处理中...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    创建知识库
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
