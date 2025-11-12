'use client';

import { useState, useRef, useCallback } from 'react';
import { Plus, Upload, FileText, File, X } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import * as mammoth from 'mammoth';
import { fileTypeFromBuffer } from 'file-type';

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
import { Badge } from '@/components/ui/badge';

interface CreateKnowledgeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

// 文件大小限制 (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// 支持的文件类型
const SUPPORTED_TYPES = {
  'text/markdown': ['.md'],
  'text/plain': ['.txt'],
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/msword': ['.doc'],
};

export function CreateKnowledgeDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateKnowledgeDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const [uploadedFiles, setUploadedFiles] = useState<Array<{ file: File; content: string }>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 从文件名提取标题
  const getFileNameWithoutExtension = (fileName: string): string => {
    return fileName.replace(/\.[^/.]+$/, '');
  };

  // 格式化文件大小
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

  // 验证文件类型 (使用 file-type 库进行更准确的检测)
  const isValidFileType = async (file: File): Promise<boolean> => {
    try {
      // 读取文件前几个字节进行类型检测
      const buffer = await file.slice(0, 4100).arrayBuffer();
      const fileType = await fileTypeFromBuffer(buffer);

      const validTypes = Object.keys(SUPPORTED_TYPES);
      const validExtensions = Object.values(SUPPORTED_TYPES).flat();

      // 检查 MIME 类型或文件扩展名
      return (
        (fileType && validTypes.includes(fileType.mime)) ||
        validTypes.includes(file.type) ||
        validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext))
      );
    } catch {
      // 如果检测失败，回退到扩展名检查
      const validExtensions = Object.values(SUPPORTED_TYPES).flat();

      return validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext));
    }
  };

  // 解析PDF文件
  const parsePDF = async (file: File): Promise<string> => {
    try {
      // 动态导入 PDF.js 以避免 SSR 问题
      const pdfjs = await import('pdfjs-dist');

      // 设置PDF.js worker路径
      pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;

      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + '\n';
      }

      return fullText.trim();
    } catch (error) {
      console.error('PDF解析错误:', error);
      throw new Error('PDF文件解析失败，请确保文件未损坏');
    }
  };

  // 解析DOCX文件
  const parseDocx = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });

      if (result.messages && result.messages.length > 0) {
        console.warn('DOCX解析警告:', result.messages);
      }

      return result.value;
    } catch (error) {
      console.error('DOCX解析错误:', error);
      throw new Error('DOCX文件解析失败，请确保文件未损坏');
    }
  };

  // 解析文本文件
  const parseTextFile = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error('文件读取失败'));
      reader.readAsText(file, 'UTF-8');
    });
  };

  // 处理多文件上传
  const handleFileUpload = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      setIsProcessing(true);

      try {
        const validFileData: { file: File; content: string }[] = [];
        let totalWordCount = 0;

        // 处理每个文件
        for (let i = 0; i < files.length; i++) {
          const file = files[i];

          // 验证文件类型
          const isValid = await isValidFileType(file);

          if (!isValid) {
            toast.error(`文件 ${file.name} 格式不支持，跳过处理`);
            continue;
          }

          // 验证文件大小
          if (file.size > MAX_FILE_SIZE) {
            toast.error(`文件 ${file.name} 过大（${formatFileSize(file.size)}），跳过处理`);
            continue;
          }

          let fileContent = '';

          // 根据文件类型解析
          if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
            fileContent = await parsePDF(file);
          } else if (
            file.type ===
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
            file.name.toLowerCase().endsWith('.docx')
          ) {
            fileContent = await parseDocx(file);
          } else {
            fileContent = await parseTextFile(file);
          }

          if (fileContent.trim()) {
            validFileData.push({ file, content: fileContent });
            totalWordCount += getWordCount(fileContent);
          }
        }

        if (validFileData.length === 0) {
          toast.error('没有有效的文件被处理');

          // 重置文件输入框
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }

          return;
        }

        // 如果标题为空且只有一个文件，自动设置标题
        if (!title.trim() && validFileData.length === 1) {
          setTitle(getFileNameWithoutExtension(validFileData[0].file.name));
        } else if (!title.trim() && validFileData.length > 1) {
          setTitle(`${validFileData.length}个文档合集`);
        }

        // 将新内容追加到现有内容后面
        const newContent = validFileData.map((item) => item.content).join('\n\n');
        const updatedDescription = description.trim()
          ? description + '\n\n' + newContent
          : newContent;

        setDescription(updatedDescription);
        setUploadedFiles((prev) => [...prev, ...validFileData]);

        toast.success(`成功处理 ${validFileData.length} 个文件，新增 ${totalWordCount} 个字`);
      } catch (error) {
        // 移除 console.error，只显示 toast 提示
        toast.error(error instanceof Error ? error.message : '文件处理失败');
      } finally {
        setIsProcessing(false);

        // 每次处理完成后都重置文件输入框，确保可以重新选择相同文件
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    },
    [title, description],
  );

  // 重置表单
  const resetForm = useCallback(() => {
    setTitle('');
    setDescription('');
    setUploadedFiles([]);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  // 删除单个文件
  const handleRemoveFile = useCallback(
    (indexToRemove: number) => {
      const fileToRemove = uploadedFiles[indexToRemove];

      // 从文件列表中移除
      const newUploadedFiles = uploadedFiles.filter((_, index) => index !== indexToRemove);
      setUploadedFiles(newUploadedFiles);

      // 重新构建内容（移除被删除文件的内容）
      if (newUploadedFiles.length === 0) {
        // 如果没有文件了，清空内容
        setDescription('');
      } else {
        // 重新组合剩余文件的内容
        const remainingContents = newUploadedFiles.map((item) => item.content);
        const newDescription = remainingContents.join('\n\n');
        setDescription(newDescription);
      }

      // 重置文件输入框，确保可以重新上传
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      toast.success(`已删除文件 ${fileToRemove.file.name}`);
    },
    [uploadedFiles],
  );

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
            创建新的知识库，支持手动输入或上传文档文件（MD、TXT、PDF、DOCX）
            <br />
            <span className="text-xs text-muted-foreground mt-1 block">
              如遇到权限问题，请检查 API Key 配置是否正确
            </span>
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
              <Label htmlFor="description">内容 *</Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {isProcessing ? '处理中...' : '上传文件'}
                </Button>
                {uploadedFiles.length > 0 && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setUploadedFiles([]);
                      setDescription('');

                      // 确保重置文件输入框
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }

                      toast.success('已清除所有文件');
                    }}
                  >
                    <X className="h-4 w-4 mr-1" />
                    清除所有
                  </Button>
                )}
              </div>
            </div>

            {/* 文件信息显示 */}
            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  已上传 {uploadedFiles.length} 个文件
                </div>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {uploadedFiles.map((fileData, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                      <File className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm font-medium truncate flex-1">
                        {fileData.file.name}
                      </span>
                      <Badge variant="secondary" className="flex-shrink-0">
                        {formatFileSize(fileData.file.size)}
                      </Badge>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 flex-shrink-0 hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => handleRemoveFile(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept=".md,.txt,.pdf,.docx"
              multiple
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
            />

            <div className="relative">
              <Textarea
                id="description"
                placeholder="请输入知识库内容，支持 Markdown 格式...&#10;&#10;或点击上方按钮上传多个 MD、TXT、PDF、DOCX 文档（支持多选）"
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
                  {contentSize > MAX_FILE_SIZE && <span className="text-red-500">过大</span>}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>支持 Markdown 格式 | 可上传多个 MD、TXT、PDF、DOCX 文件</span>
              <span>最大文件大小: {formatFileSize(MAX_FILE_SIZE)}</span>
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
