'use client';

import { useState, useRef } from 'react';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';

import uploadService from '@/services/upload';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/utils';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove?: () => void;
  label?: string;
  description?: string;
}

export default function ImageUpload({ value, onChange, onRemove, description }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const validateFile = (file: File): boolean => {
    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      toast({
        title: '文件类型错误',
        description: '请上传图片文件（JPG、PNG、GIF）',
        variant: 'destructive',
      });

      return false;
    }

    // 验证文件大小（最大 5MB）
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: '文件过大',
        description: '图片大小不能超过 5MB',
        variant: 'destructive',
      });

      return false;
    }

    return true;
  };

  const uploadFile = async (file: File) => {
    if (!validateFile(file)) return;

    setUploading(true);

    try {
      const imageUrl = await uploadService.uploadImage(file);
      onChange(imageUrl);
      toast({
        title: '上传成功',
        description: '图片已成功上传',
      });
    } catch (error) {
      toast({
        title: '上传失败',
        description: error instanceof Error ? error.message : '图片上传失败',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    await uploadFile(file);

    // 清空 input，允许重新选择同一文件
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    await uploadFile(file);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');

    if (onRemove) {
      onRemove();
    }
  };

  const handleClick = () => {
    if (!uploading && !value) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />

      {/* 上传区域 - 横向紧凑布局 */}
      <div className="flex items-center space-x-4">
        {/* 预览区域 - 固定小尺寸 */}
        <div
          className={cn(
            'relative w-24 h-24 rounded-lg border-2 flex-shrink-0 overflow-hidden transition-all',
            dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50',
            !value && 'border-dashed cursor-pointer hover:border-gray-400 hover:bg-gray-100',
            uploading && 'opacity-60',
          )}
          onClick={handleClick}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {value ? (
            <>
              <img
                src={value}
                alt="Logo preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              {uploading && (
                <div className="absolute inset-0 bg-white/90 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              {uploading ? (
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              ) : (
                <ImageIcon className="w-10 h-10 text-gray-400" />
              )}
            </div>
          )}
        </div>

        {/* 操作区域 */}
        <div className="flex-1 min-w-0">
          {value ? (
            <div className="flex items-center space-x-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex-1"
              >
                <Upload className="w-4 h-4 mr-2" />
                更换图片
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRemove}
                disabled={uploading}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  上传中...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  上传图片
                </>
              )}
            </Button>
          )}
          <p className="text-xs text-gray-500 mt-2">
            {description || '支持 JPG、PNG、GIF 格式，最大 5MB'}
          </p>
        </div>
      </div>
    </div>
  );
}
