'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeftIcon } from 'lucide-react';

import { useFileUpload } from '@/hooks/useFileUpload';

// 上传结果类型
interface UploadResult {
  success: boolean;
  fileName?: string;
  fileSize?: number;
  fileUrl?: string;
  uploadTime?: number;
  averageSpeed?: string;
  message?: string;
}

// 工具函数
const formatTime = (seconds: number): string => {
  if (seconds < 60) return `${Math.round(seconds)}秒`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}分钟`;

  return `${Math.round(seconds / 3600)}小时`;
};

// 完整功能上传组件
const FullFeatureUploader = ({ onComplete }: { onComplete: (result: UploadResult) => void }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const startTimeRef = useRef<number>(0);

  const {
    progress,
    result,
    upload,
    cancel,
    retry,
    formatters,
    isIdle,
    isHashing,
    isUploading,
    isCompleted,
    isError,
    canRetry,
    canCancel,
  } = useFileUpload({
    chunkSize: 1 * 1024 * 1024, // 1MB 分块
    maxFileSize: 100 * 1024 * 1024, // 100MB
    onProgress: (progress) => {
      if (progress.status === 'hashing' && startTimeRef.current === 0) {
        startTimeRef.current = Date.now();
      }
    },
    onComplete: (fileUrl) => {
      const uploadTime = Date.now() - startTimeRef.current;
      onComplete({
        success: true,
        fileName: fileInputRef.current?.files?.[0]?.name,
        fileSize: progress.totalBytes,
        fileUrl,
        uploadTime,
        averageSpeed: progress.speed ? formatters.speed(progress.speed) : undefined,
      });
      startTimeRef.current = 0;
    },
    onError: (error) => {
      onComplete({
        success: false,
        fileName: fileInputRef.current?.files?.[0]?.name,
        message: error,
      });
      startTimeRef.current = 0;
    },
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      startTimeRef.current = Date.now();
      await upload(file);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6">
      <input ref={fileInputRef} type="file" onChange={handleFileSelect} className="hidden" />

      {/* 文件选择区域 */}
      <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-blue-600"
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

        <button
          onClick={triggerFileSelect}
          disabled={!isIdle}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            isIdle
              ? 'bg-blue-500 hover:bg-blue-600 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isIdle ? '选择文件上传' : '上传中...'}
        </button>

        <p className="text-sm text-gray-500 mt-2">支持所有文件类型，最大 100MB</p>
      </div>

      {/* 上传进度 */}
      {!isIdle && (
        <div className="bg-gray-50 p-6 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-700">
              状态:{' '}
              {isHashing
                ? '计算文件哈希'
                : isUploading
                  ? '上传中'
                  : isCompleted
                    ? '上传完成'
                    : isError
                      ? '上传失败'
                      : '处理中'}
            </span>

            {canCancel && (
              <button
                onClick={cancel}
                className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
              >
                取消
              </button>
            )}
          </div>

          {/* 进度条 */}
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div
              className="bg-blue-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress.progress}%` }}
            />
          </div>

          {/* 详细信息 */}
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div>进度: {formatters.progress(progress.progress)}</div>
            <div>
              大小: {formatters.size(progress.bytesUploaded)} /{' '}
              {formatters.size(progress.totalBytes)}
            </div>
            {progress.speed && <div>速度: {formatters.speed(progress.speed)}</div>}
            {progress.remainingTime && <div>剩余: {formatters.time(progress.remainingTime)}</div>}
            {progress.totalChunks && (
              <div>
                分块: {progress.uploadedChunks.length} / {progress.totalChunks}
              </div>
            )}
          </div>

          {/* 错误信息 */}
          {isError && progress.error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
              {progress.error}
            </div>
          )}

          {/* 操作按钮 */}
          {(isError || isCompleted) && (
            <div className="flex gap-3 mt-4">
              {canRetry && (
                <button
                  onClick={retry}
                  className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
                >
                  重试
                </button>
              )}

              {isCompleted && result.fileUrl && (
                <button
                  onClick={() => window.open(result.fileUrl, '_blank')}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  查看文件
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// 简化拖拽上传组件
const SimpleUploader = ({ onComplete }: { onComplete: (result: UploadResult) => void }) => {
  const [isDragging, setIsDragging] = useState(false);
  const startTimeRef = useRef<number>(0);

  const { progress, result, upload, formatters, isIdle, isCompleted, isError } = useFileUpload({
    chunkSize: 1 * 1024 * 1024,
    maxFileSize: 50 * 1024 * 1024, // 50MB
    allowedTypes: ['image/*', 'video/*', 'audio/*'],
    onComplete: (fileUrl) => {
      const uploadTime = Date.now() - startTimeRef.current;
      onComplete({
        success: true,
        fileUrl,
        uploadTime,
        averageSpeed: progress.speed ? formatters.speed(progress.speed) : undefined,
      });
    },
    onError: (error) => {
      onComplete({
        success: false,
        message: error,
      });
    },
  });

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);

    if (files.length > 0) {
      startTimeRef.current = Date.now();
      await upload(files[0]);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      startTimeRef.current = Date.now();
      await upload(file);
    }
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed p-8 text-center rounded-xl transition-colors min-h-[160px] flex flex-col justify-center
          ${isDragging ? 'border-green-400 bg-green-50' : 'border-gray-300'}
          ${!isIdle ? 'opacity-50' : 'hover:border-gray-400'}
        `}
      >
        {isIdle ? (
          <>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg
                className="w-6 h-6 text-green-600"
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
            <p className="text-gray-600 mb-2">拖拽文件到这里</p>
            <label className="text-green-500 cursor-pointer hover:underline">
              <input
                type="file"
                className="hidden"
                accept="image/*,video/*,audio/*"
                onChange={handleFileSelect}
              />
              或点击选择文件
            </label>
            <p className="text-xs text-gray-500 mt-2">支持图片、视频、音频，最大 50MB</p>
          </>
        ) : (
          <div>
            <p className="text-sm text-gray-600 mb-2">上传中...</p>
            <div className="w-full bg-gray-200 rounded h-2 mb-2">
              <div
                className="bg-green-500 h-2 rounded transition-all"
                style={{ width: `${progress.progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500">{progress.progress}%</p>
            {progress.speed && (
              <p className="text-xs text-gray-500">{formatters.speed(progress.speed)}</p>
            )}
          </div>
        )}
      </div>

      {/* 结果显示 */}
      {isCompleted && result.fileUrl && (
        <div className="p-3 bg-green-100 text-green-700 rounded text-sm">
          上传成功!{' '}
          <a href={result.fileUrl} target="_blank" rel="noopener noreferrer" className="underline">
            查看文件
          </a>
        </div>
      )}

      {isError && (
        <div className="p-3 bg-red-100 text-red-700 rounded text-sm">
          上传失败: {progress.error}
        </div>
      )}
    </div>
  );
};

// 按钮上传组件
const ButtonUploader = ({
  accept,
  variant = 'primary',
  children,
  onComplete,
}: {
  accept?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  children: React.ReactNode;
  onComplete: (result: UploadResult) => void;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const startTimeRef = useRef<number>(0);

  const { progress, upload, formatters, isIdle } = useFileUpload({
    chunkSize: 1 * 1024 * 1024,
    onComplete: (fileUrl) => {
      const uploadTime = Date.now() - startTimeRef.current;
      onComplete({
        success: true,
        fileName: fileInputRef.current?.files?.[0]?.name,
        fileSize: fileInputRef.current?.files?.[0]?.size,
        fileUrl,
        uploadTime,
        averageSpeed: progress.speed ? formatters.speed(progress.speed) : undefined,
      });
    },
    onError: (error) => {
      onComplete({
        success: false,
        fileName: fileInputRef.current?.files?.[0]?.name,
        message: error,
      });
    },
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      startTimeRef.current = Date.now();
      await upload(file);
    }
  };

  const getButtonClass = () => {
    const base = 'px-4 py-2 rounded-lg font-medium transition-colors w-full text-center';

    if (!isIdle) return `${base} bg-gray-300 text-gray-500 cursor-not-allowed`;

    switch (variant) {
      case 'primary':
        return `${base} bg-purple-500 hover:bg-purple-600 text-white`;
      case 'secondary':
        return `${base} bg-gray-500 hover:bg-gray-600 text-white`;
      case 'outline':
        return `${base} border-2 border-gray-300 hover:border-gray-400 text-gray-700`;
      default:
        return `${base} bg-purple-500 hover:bg-purple-600 text-white`;
    }
  };

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
      />

      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={!isIdle}
        className={getButtonClass()}
      >
        {children}
      </button>

      {/* 进度显示 */}
      {!isIdle && (
        <div className="text-xs">
          <div className="w-full bg-gray-200 rounded h-1">
            <div
              className="bg-purple-500 h-1 rounded transition-all"
              style={{ width: `${progress.progress}%` }}
            />
          </div>
          <div className="text-center text-gray-500 mt-1">
            {progress.progress}%{progress.speed && ` - ${formatters.speed(progress.speed)}`}
          </div>
        </div>
      )}
    </div>
  );
};

const UploadDemoPage = () => {
  const [results, setResults] = useState<UploadResult[]>([]);

  const addResult = (result: UploadResult) => {
    setResults((prev) => [result, ...prev].slice(0, 10)); // 保留最近10个结果
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 py-12">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* 导航 */}
        <div className="mb-12 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center space-x-3 text-gray-600 hover:text-blue-600 transition-all duration-200 bg-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            <span className="font-medium">返回首页</span>
          </Link>

          {results.length > 0 && (
            <button
              onClick={clearResults}
              className="px-6 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors shadow-sm font-medium"
            >
              清除结果 ({results.length})
            </button>
          )}
        </div>

        {/* 页面标题 */}
        <div className="text-center mb-16">
          <div className="inline-block p-3 bg-blue-100 rounded-full mb-6">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
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
          </div>

          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-6">
            useFileUpload Hook 演示
          </h1>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            使用 useFileUpload 自定义 Hook 实现的各种文件上传场景。
            <br />
            <span className="text-lg text-gray-500 mt-2 block">
              包含分块上传、断点续传、实时进度显示等高级功能
            </span>
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* 左侧：组件演示 */}
          <div className="xl:col-span-2 space-y-10">
            {/* 完整功能组件 */}
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
              <div className="mb-8 pb-6 border-b border-gray-100">
                <div className="flex items-center space-x-4 mb-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                    1
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">完整功能上传</h2>
                </div>
                <p className="text-gray-600 text-lg leading-relaxed">
                  功能最完整的文件上传实现，支持暂停、恢复、取消等所有操作。
                  <br />
                  <span className="text-sm text-blue-600 font-medium">
                    ✨ 支持大文件分块上传 • 🔄 断点续传 • ⚡ 实时进度监控
                  </span>
                </p>
              </div>

              <FullFeatureUploader onComplete={addResult} />
            </div>

            {/* 简化组件 */}
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
              <div className="mb-8 pb-6 border-b border-gray-100">
                <div className="flex items-center space-x-4 mb-3">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                    2
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">拖拽上传</h2>
                </div>
                <p className="text-gray-600 text-lg leading-relaxed">
                  简洁的拖拽上传实现，选择文件后自动开始上传。
                  <br />
                  <span className="text-sm text-green-600 font-medium">
                    🎯 专注体验 • 📁 支持多种格式 • 🔒 文件大小限制
                  </span>
                </p>
              </div>

              <SimpleUploader onComplete={addResult} />
            </div>

            {/* 按钮组件 */}
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
              <div className="mb-8 pb-6 border-b border-gray-100">
                <div className="flex items-center space-x-4 mb-3">
                  <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                    3
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">按钮上传</h2>
                </div>
                <p className="text-gray-600 text-lg leading-relaxed">
                  按钮式的文件上传实现，适用于表单或工具栏场景。
                  <br />
                  <span className="text-sm text-purple-600 font-medium">
                    🎨 多种样式 • 📎 文件类型过滤 • 🔧 灵活集成
                  </span>
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ButtonUploader
                  variant="primary"
                  accept=".pdf,.doc,.docx,.txt"
                  onComplete={addResult}
                >
                  📄 上传文档
                </ButtonUploader>

                <ButtonUploader variant="secondary" accept="image/*" onComplete={addResult}>
                  🖼️ 上传图片
                </ButtonUploader>

                <ButtonUploader variant="outline" onComplete={addResult}>
                  📎 任意文件
                </ButtonUploader>
              </div>
            </div>
          </div>

          {/* 右侧：上传结果 */}
          <div className="xl:col-span-1">
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 sticky top-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">上传结果</h2>
              </div>

              {results.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-gray-400"
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
                  <p className="text-xl font-medium text-gray-500 mb-2">暂无上传记录</p>
                  <p className="text-sm text-gray-400">选择文件并上传后，结果将在此显示</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {results.map((result, index) => (
                    <div
                      key={index}
                      className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                        result.success
                          ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:shadow-md'
                          : 'bg-gradient-to-br from-red-50 to-rose-50 border-red-200 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              result.success ? 'bg-green-100' : 'bg-red-100'
                            }`}
                          >
                            {result.success ? (
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
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            ) : (
                              <svg
                                className="w-4 h-4 text-red-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            )}
                          </div>
                          <p
                            className={`font-semibold ${
                              result.success ? 'text-green-800' : 'text-red-800'
                            }`}
                          >
                            {result.success ? '上传成功' : '上传失败'}
                          </p>
                        </div>
                        <span className="text-xs text-gray-400 font-mono">#{index + 1}</span>
                      </div>

                      {result.fileName && (
                        <div className="mb-2">
                          <p
                            className="text-sm font-medium text-gray-700 truncate"
                            title={result.fileName}
                          >
                            📁 {result.fileName}
                          </p>
                        </div>
                      )}

                      <div className="grid grid-cols-1 gap-2 text-xs text-gray-600">
                        {result.fileSize && (
                          <div className="flex justify-between">
                            <span>文件大小:</span>
                            <span className="font-mono">
                              {(result.fileSize / 1024 / 1024).toFixed(2)} MB
                            </span>
                          </div>
                        )}

                        {result.uploadTime && (
                          <div className="flex justify-between">
                            <span>上传耗时:</span>
                            <span className="font-mono">
                              {formatTime(result.uploadTime / 1000)}
                            </span>
                          </div>
                        )}

                        {result.averageSpeed && (
                          <div className="flex justify-between">
                            <span>平均速度:</span>
                            <span className="font-mono text-blue-600">{result.averageSpeed}</span>
                          </div>
                        )}
                      </div>

                      {result.fileUrl && (
                        <div className="mt-4 pt-3 border-t border-gray-200">
                          <a
                            href={result.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-xs text-blue-600 hover:text-blue-700 font-medium"
                          >
                            <svg
                              className="w-3 h-3 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                              />
                            </svg>
                            查看文件
                          </a>
                        </div>
                      )}

                      {!result.success && result.message && (
                        <div className="mt-3 p-3 bg-red-100 rounded-lg">
                          <p className="text-xs text-red-700">{result.message}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 底部说明 */}
        <div className="mt-16 bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            ✨ useFileUpload Hook 特性
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
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
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">简单易用</h4>
              <p className="text-sm text-gray-600">一个 Hook 解决所有上传需求</p>
            </div>

            <div className="text-center p-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">断点续传</h4>
              <p className="text-sm text-gray-600">网络中断后可继续上传</p>
            </div>

            <div className="text-center p-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                  />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">高度可配置</h4>
              <p className="text-sm text-gray-600">灵活的配置选项和回调</p>
            </div>

            <div className="text-center p-4">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg
                  className="w-6 h-6 text-orange-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">实时监控</h4>
              <p className="text-sm text-gray-600">详细的进度和速度信息</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadDemoPage;
