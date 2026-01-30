'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Zap, Upload, FileText, X, Loader2 } from 'lucide-react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import PodcastApi, { PODCAST_CONSTANTS } from '@/services/podcast';
import { Interviewer, Voice } from '@/services/podcast/type';

interface UploadResumeCardProps {
  onUploadSuccess?: () => void;
}

// 使用服务层的常量
const { INTERVIEWER_OPTIONS, VOICE_OPTIONS, DEFAULTS, SUPPORTED_FILE_TYPES } = PODCAST_CONSTANTS;

export const UploadResumeCard = ({ onUploadSuccess }: UploadResumeCardProps) => {
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [interviewer, setInterviewer] = useState<Interviewer>(DEFAULTS.INTERVIEWER);
  const [interviewerVoice, setInterviewerVoice] = useState<Voice>(DEFAULTS.INTERVIEWER_VOICE);
  const [candidateVoice, setCandidateVoice] = useState<Voice>(DEFAULTS.CANDIDATE_VOICE);
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
      setIsUploading(true);

      const res = await PodcastApi.generatePodcastFromFileAsync({
        file: selectedFile,
        interviewer,
        interviewer_voice: interviewerVoice,
        candidate_voice: candidateVoice,
        temperature: DEFAULTS.TEMPERATURE,
      });

      // 检查请求是否成功
      if (res.error) {
        // 如果有错误，显示错误信息
        toast.error(res.error);

        return;
      }

      if (res.data?.code === 200) {
        toast.success('上传成功，AI 正在生成播客');
        setSelectedFile(null); // 清空选择的文件
        onUploadSuccess?.();
      } else {
        // 显示后端返回的具体错误信息
        const errorMessage = res.data?.message || '上传失败';
        toast.error(errorMessage);
      }
    } catch (error: any) {
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

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        {/* 简洁的标题 */}
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">上传简历转为AI播客</h3>
            <p className="text-xs text-gray-500">将文件转换为结构化音频文件</p>
          </div>
        </div>

        {/* 紧凑的表单区域 */}
        <div className="space-y-3">
          {/* 所有选择器 - 一排显示 */}
          <div className="grid grid-cols-3 gap-3">
            {/* 面试官选择 */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-700 block">面试官</label>
              <Select
                onValueChange={(value) => setInterviewer(value as Interviewer)}
                defaultValue={DEFAULTS.INTERVIEWER}
              >
                <SelectTrigger className="h-9 bg-gray-50 border-gray-200 rounded-lg hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 transition-colors">
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

            {/* 面试官音色 */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-700 block">面试官音色</label>
              <Select
                onValueChange={(value) => setInterviewerVoice(value as Voice)}
                defaultValue={DEFAULTS.INTERVIEWER_VOICE}
              >
                <SelectTrigger className="h-9 bg-gray-50 border-gray-200 rounded-lg hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 transition-colors">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-lg">
                  {VOICE_OPTIONS.map(({ value, label }) => (
                    <SelectItem key={value} value={value} className="rounded-md">
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 候选人音色 */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-700 block">候选人音色</label>
              <Select
                onValueChange={(value) => setCandidateVoice(value as Voice)}
                defaultValue={DEFAULTS.CANDIDATE_VOICE}
              >
                <SelectTrigger className="h-9 bg-gray-50 border-gray-200 rounded-lg hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 transition-colors">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-lg">
                  {VOICE_OPTIONS.map(({ value, label }) => (
                    <SelectItem key={value} value={value} className="rounded-md">
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 文件选择区域 */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-700">简历文件</label>
            {!selectedFile ? (
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg py-10 px-4 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer group"
                onClick={handleFileSelect}
              >
                <div className="flex items-center justify-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <Upload className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900">点击选择文件</p>
                    <p className="text-xs text-gray-500">支持 Word、PDF、Markdown、PPT 等格式</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="border border-green-200 rounded-lg p-5 bg-green-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-green-600" />
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
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="text-gray-400 hover:text-red-500 hover:bg-red-50 h-8 w-8 p-0 rounded-md transition-colors flex items-center justify-center shrink-0"
                    aria-label="删除文件"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 上传按钮 - 紧凑 */}
          <button
            type="button"
            className="w-full h-10 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-medium shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
            disabled={isUploading || !selectedFile}
            onClick={handleUpload}
          >
            {isUploading ? (
              <>
                <Loader2 className="animate-spin h-4 w-4 text-white" />
                转换中...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                开始转换
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
