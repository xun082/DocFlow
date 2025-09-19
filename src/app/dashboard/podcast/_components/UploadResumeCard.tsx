'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import PodcastApi from '@/services/podcast';

interface UploadResumeCardProps {
  onUploadSuccess?: () => void;
}

const INTERVIEWER_OPTIONS = [
  { value: 'front_end', label: '前端面试官' },
  { value: 'hrbp', label: 'HRBP面试官' },
  { value: 'marketing_manager', label: '经理面试官' },
];

const CANDIDATE_ID = 'hunyin_6';
const VOICE_ID = 'Chinese (Mandarin)_News_Anchor';
const SUPPORTED_FILE_TYPES = '.pdf,.md,.doc,.docx';

export const UploadResumeCard = ({ onUploadSuccess }: UploadResumeCardProps) => {
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [interviewer, setInterviewer] = useState<string>('front_end');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('interviewer', interviewer);
      formData.append('candidate_id', CANDIDATE_ID);
      formData.append('interviewer_voice_id', VOICE_ID);
      setIsUploading(true);

      const res = await PodcastApi.uploadFileAsync(formData);

      if (res?.data?.code === 200) {
        toast.success('上传成功');
        setSelectedFile(null); // 清空选择的文件
        onUploadSuccess?.();
      } else {
        toast.error('上传失败');
      }
    } catch (error) {
      console.error('上传失败:', error);
      toast.error('上传失败');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    toast.info('已取消选择文件');
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      {/* 简洁的标题 */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
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
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-900 mb-1">点击选择文件</p>
              <p className="text-xs text-gray-500">支持 Word、PDF、Markdown、PPT 等格式</p>
            </div>
          ) : (
            <div className="border border-green-200 rounded-lg p-4 bg-green-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveFile}
                  className="text-gray-400 hover:text-red-500 hover:bg-red-50 h-8 w-8 p-0"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* 上传按钮 - 更简洁 */}
        <Button
          className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-medium shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isUploading || !selectedFile}
          onClick={handleUpload}
        >
          {isUploading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              转换中...
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              开始转换
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
