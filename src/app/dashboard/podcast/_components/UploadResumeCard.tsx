'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  ExternalLink,
  Settings,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Zap,
  Upload,
  FileText,
  X,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import PodcastApi, { PODCAST_CONSTANTS } from '@/services/podcast';
import { storage, STORAGE_KEYS } from '@/utils';

interface UploadResumeCardProps {
  onUploadSuccess?: () => void;
}

// 使用服务层的常量
const { INTERVIEWER_OPTIONS, DEFAULTS, SUPPORTED_FILE_TYPES } = PODCAST_CONSTANTS;

export const UploadResumeCard = ({ onUploadSuccess }: UploadResumeCardProps) => {
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [interviewer, setInterviewer] = useState<string>('front_end');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [hasMinimaxKey, setHasMinimaxKey] = useState<boolean>(false);
  const [isNoticeExpanded, setIsNoticeExpanded] = useState<boolean>(false);

  // 检查 Minimax API Key 是否存在
  useEffect(() => {
    const checkApiKey = () => {
      const apiKeys = storage.get(STORAGE_KEYS.API_KEYS, {});
      setHasMinimaxKey(!!apiKeys?.minimax);
    };

    checkApiKey();

    // 监听 storage 变化
    const handleStorageChange = () => {
      checkApiKey();
    };

    window.addEventListener('storage', handleStorageChange);

    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleFileSelect = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = SUPPORTED_FILE_TYPES;

    fileInput.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];

      if (file) {
        setSelectedFile(file);
        toast.success(`已选择文件: ${file.name}`);
      }
    };

    fileInput.click();
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('请先选择文件');

      return;
    }

    // 获取 Minimax API Key
    const apiKeys = storage.get(STORAGE_KEYS.API_KEYS, {});
    const minimaxKey = apiKeys?.minimax;

    if (!minimaxKey) {
      toast.error('请先在设置中配置 Minimax API Key');

      return;
    }

    try {
      setIsUploading(true);

      const res = await PodcastApi.generatePodcastFromFileAsync({
        file: selectedFile,
        interviewer: interviewer as 'front_end' | 'hrbp' | 'marketing_manager',
        interviewer_voice: DEFAULTS.INTERVIEWER_VOICE,
        candidate_voice: DEFAULTS.CANDIDATE_VOICE,
        speech_speed: DEFAULTS.SPEECH_SPEED,
        sample_rate: DEFAULTS.SAMPLE_RATE,
        temperature: DEFAULTS.TEMPERATURE,
      });

      // 检查请求是否成功
      if (res.error) {
        // 如果有错误，显示错误信息
        toast.error(res.error);

        return;
      }

      if (res.data?.code === 200) {
        toast.success('上传成功');
        setSelectedFile(null); // 清空选择的文件
        onUploadSuccess?.();
      } else {
        // 显示后端返回的具体错误信息
        const errorMessage = res.data?.message || '上传失败';
        toast.error(errorMessage);
      }
    } catch (error: any) {
      console.error('上传失败:', error);

      // 处理意外的异常情况
      const errorMessage = error?.message || '上传失败，请稍后重试';
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    toast.info('已取消选择文件');
  };

  // API Key 配置提示组件
  const ApiKeyNotice = () => (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setIsNoticeExpanded(!isNoticeExpanded)}
          >
            <h4 className="text-sm font-medium text-amber-800">需要配置 Minimax API Key</h4>
            {isNoticeExpanded ? (
              <ChevronUp className="w-4 h-4 text-amber-600" />
            ) : (
              <ChevronDown className="w-4 h-4 text-amber-600" />
            )}
          </div>

          {isNoticeExpanded && (
            <div className="mt-3 space-y-3">
              <p className="text-sm text-amber-700">
                使用 AI 播客功能需要先配置 Minimax API Key。请按以下步骤操作：
              </p>
              <div className="space-y-2 text-sm text-amber-700">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 bg-amber-200 text-amber-800 rounded-full flex items-center justify-center text-xs font-medium">
                    1
                  </span>
                  <span>前往</span>
                  <a
                    href="https://platform.minimaxi.com/user-center/basic-information/interface-key"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-amber-800 hover:text-amber-900 font-medium underline"
                  >
                    Minimax 官网
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <span>获取 API Key</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 bg-amber-200 text-amber-800 rounded-full flex items-center justify-center text-xs font-medium">
                    2
                  </span>
                  <span>在</span>
                  <Link
                    href="/dashboard/settings"
                    className="inline-flex items-center gap-1 text-amber-800 hover:text-amber-900 font-medium underline"
                  >
                    设置页面
                    <Settings className="w-3 h-3" />
                  </Link>
                  <span>配置 API Key</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 bg-amber-200 text-amber-800 rounded-full flex items-center justify-center text-xs font-medium">
                    3
                  </span>
                  <span>如有疑问请联系管理员微信：</span>
                  <span className="font-medium text-amber-800">yunmz777</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* API Key 配置提示 */}
      {!hasMinimaxKey && <ApiKeyNotice />}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        {/* 简洁的标题 */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">上传简历转为AI播客</h3>
            <p className="text-sm text-gray-500">将文件转换为结构化音频文件</p>
          </div>
        </div>

        {/* 紧凑的表单区域 */}
        <div className="space-y-4">
          {/* 面试官选择 - 水平布局 */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700 min-w-0 w-20">面试官</label>
            <Select onValueChange={setInterviewer} defaultValue="front_end">
              <SelectTrigger className="h-10 bg-gray-50 border-gray-200 rounded-lg hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 transition-colors">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-lg">
                {INTERVIEWER_OPTIONS.map(({ value, label }) => (
                  <SelectItem key={value} value={value} className="rounded-md">
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 文件选择区域 - 更紧凑 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">简历文件</label>
            {!selectedFile ? (
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer group"
                onClick={handleFileSelect}
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-200 transition-colors">
                  <Upload className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-sm font-medium text-gray-900 mb-1">点击选择文件</p>
                <p className="text-xs text-gray-500">支持 Word、PDF、Markdown、PPT 等格式</p>
              </div>
            ) : (
              <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(selectedFile.size / 1024).toFixed(0)} KB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveFile}
                    className="text-gray-400 hover:text-red-500 hover:bg-red-50 h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* 上传按钮 - 更简洁 */}
          <Button
            className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-medium shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isUploading || !selectedFile || !hasMinimaxKey}
            onClick={handleUpload}
          >
            {isUploading ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                转换中...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                开始转换
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
