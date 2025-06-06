import { useState, useCallback, useRef, useEffect } from 'react';

import { uploadService } from '@/services/upload';
import { ImageApi } from '@/services/image';
import {
  formatSpeed,
  formatTime,
  formatFileSize,
  generateFileId,
  calculateChunkCount,
  validateFile,
  handleUploadError,
  DEFAULT_UPLOAD_CONFIG,
} from '@/utils/upload';

// Worker 消息类型
interface HashWorkerMessage {
  type: 'progress' | 'complete' | 'error';
  progress?: number;
  hash?: string;
  error?: string;
}

interface UploadWorkerMessage {
  type: 'progress' | 'complete' | 'error';
  chunkNumber?: number;
  totalChunks?: number;
  bytesUploaded?: number;
  totalBytes?: number;
  uploadedChunks?: number[];
  fileUrl?: string;
  error?: string;
}

// 上传状态
export type UploadStatus = 'idle' | 'hashing' | 'uploading' | 'completed' | 'error' | 'cancelled';

// 上传进度信息
export interface UploadProgress {
  status: UploadStatus;
  progress: number; // 0-100
  speed?: number; // 字节/秒
  remainingTime?: number; // 秒
  bytesUploaded: number;
  totalBytes: number;
  currentChunk?: number;
  totalChunks?: number;
  uploadedChunks: number[];
  error?: string;
}

// 上传配置
export interface UploadConfig {
  chunkSize?: number;
  maxFileSize?: number;
  allowedTypes?: string[];
  autoStart?: boolean;
  enableResume?: boolean;
  maxRetries?: number;
  onProgress?: (progress: UploadProgress) => void;
  onComplete?: (fileUrl: string) => void;
  onError?: (error: string) => void;
}

// 上传结果
export interface UploadResult {
  fileUrl?: string;
  error?: string;
  fileHash?: string;
}

export const useFileUpload = (config: UploadConfig = {}) => {
  const {
    chunkSize = DEFAULT_UPLOAD_CONFIG.chunkSize,
    maxFileSize = DEFAULT_UPLOAD_CONFIG.maxFileSize,
    allowedTypes,
    //autoStart = true,
    enableResume = true,
    //maxRetries = DEFAULT_UPLOAD_CONFIG.maxRetries,
    onProgress,
    onComplete,
    onError,
  } = config;

  // 状态管理
  const [progress, setProgress] = useState<UploadProgress>({
    status: 'idle',
    progress: 0,
    bytesUploaded: 0,
    totalBytes: 0,
    uploadedChunks: [],
  });

  const [result, setResult] = useState<UploadResult>({});

  // 引用管理
  const hashWorkerRef = useRef<Worker | null>(null);
  const uploadWorkerRef = useRef<Worker | null>(null);
  const currentFileRef = useRef<File | null>(null);
  const fileIdRef = useRef<string>('');
  const fileHashRef = useRef<string>('');
  const speedCalculatorRef = useRef({
    startTime: 0,
    lastTime: 0,
    lastBytes: 0,
  });

  // 清理Workers
  const cleanupWorkers = useCallback(() => {
    if (hashWorkerRef.current) {
      hashWorkerRef.current.terminate();
      hashWorkerRef.current = null;
    }

    if (uploadWorkerRef.current) {
      uploadWorkerRef.current.terminate();
      uploadWorkerRef.current = null;
    }
  }, []);

  // 计算上传速度
  const calculateSpeed = useCallback((bytesUploaded: number) => {
    const now = Date.now();
    const calculator = speedCalculatorRef.current;

    if (calculator.startTime === 0) {
      calculator.startTime = now;
      calculator.lastTime = now;
      calculator.lastBytes = bytesUploaded;

      return 0;
    }

    const timeDiff = (now - calculator.lastTime) / 1000; // 秒
    const bytesDiff = bytesUploaded - calculator.lastBytes;

    if (timeDiff > 0.5) {
      // 每0.5秒计算一次速度
      const speed = bytesDiff / timeDiff;
      calculator.lastTime = now;
      calculator.lastBytes = bytesUploaded;

      return speed;
    }

    return 0;
  }, []);

  // 更新进度
  const updateProgress = useCallback(
    (updates: Partial<UploadProgress>) => {
      setProgress((prev) => {
        const newProgress = { ...prev, ...updates };

        // 计算速度和剩余时间
        if (updates.bytesUploaded !== undefined && updates.totalBytes) {
          const speed = calculateSpeed(updates.bytesUploaded);

          if (speed > 0) {
            const remainingBytes = updates.totalBytes - updates.bytesUploaded;
            const remainingTime = remainingBytes / speed;
            newProgress.speed = speed;
            newProgress.remainingTime = remainingTime;
          }
        }

        // 触发进度回调
        if (onProgress) {
          onProgress(newProgress);
        }

        return newProgress;
      });
    },
    [calculateSpeed, onProgress],
  );

  // 检查文件是否已存在
  const checkFileExists = useCallback(async (fileHash: string) => {
    try {
      const result = await uploadService.checkFileExists(fileHash);

      return result.exists ? result.fileUrl : null;
    } catch (error) {
      console.error('检查文件存在性失败:', error);

      return null;
    }
  }, []);

  // 获取已上传的分块
  const getUploadedChunks = useCallback(
    async (fileId: string) => {
      if (!enableResume) return [];

      try {
        return await uploadService.getUploadedChunks(fileId);
      } catch (error) {
        console.error('获取已上传分块失败:', error);

        return [];
      }
    },
    [enableResume],
  );

  // 开始哈希计算
  const startHashing = useCallback(
    (file: File) => {
      return new Promise<string>((resolve, reject) => {
        try {
          hashWorkerRef.current = new Worker(new URL('@/worker/hashWorker.ts', import.meta.url));

          hashWorkerRef.current.onmessage = (e: MessageEvent<HashWorkerMessage>) => {
            const { type, progress: hashProgress, hash, error } = e.data;

            switch (type) {
              case 'progress':
                updateProgress({
                  status: 'hashing',
                  progress: Math.round((hashProgress || 0) * 0.1), // 哈希占总进度的10%
                });
                break;

              case 'complete':
                if (hash) {
                  resolve(hash);
                } else {
                  reject(new Error('哈希计算失败'));
                }

                break;

              case 'error':
                reject(new Error(error || '哈希计算失败'));
                break;
            }
          };

          hashWorkerRef.current.onerror = (error) => {
            reject(new Error(`哈希计算Worker错误: ${error.message}`));
          };

          // 开始计算哈希
          hashWorkerRef.current.postMessage({
            file,
            chunkSize: DEFAULT_UPLOAD_CONFIG.hashChunkSize,
          });
        } catch (error) {
          reject(error);
        }
      });
    },
    [updateProgress],
  );

  // 开始上传
  const startUpload = useCallback(
    (file: File, fileId: string, fileHash: string, uploadedChunks: number[] = []) => {
      return new Promise<string>((resolve, reject) => {
        try {
          uploadWorkerRef.current = new Worker(
            new URL('@/worker/uploadWorker.ts', import.meta.url),
          );

          uploadWorkerRef.current.onmessage = (e: MessageEvent<UploadWorkerMessage>) => {
            const {
              type,
              chunkNumber,
              totalChunks,
              bytesUploaded,
              totalBytes,
              uploadedChunks: currentUploadedChunks,
              fileUrl,
              error,
            } = e.data;

            switch (type) {
              case 'progress':
                if (bytesUploaded !== undefined && totalBytes) {
                  const uploadProgress = 10 + Math.round((bytesUploaded / totalBytes) * 90); // 上传占90%
                  updateProgress({
                    status: 'uploading',
                    progress: uploadProgress,
                    bytesUploaded,
                    totalBytes,
                    currentChunk: chunkNumber,
                    totalChunks,
                    uploadedChunks: currentUploadedChunks || [],
                  });
                }

                break;

              case 'complete':
                if (fileUrl) {
                  resolve(fileUrl);
                } else {
                  reject(new Error('上传完成但未获取到文件URL'));
                }

                break;

              case 'error':
                reject(new Error(error || '上传失败'));
                break;
            }
          };

          uploadWorkerRef.current.onerror = (error) => {
            reject(new Error(`上传Worker错误: ${error.message}`));
          };

          // 开始上传
          uploadWorkerRef.current.postMessage({
            type: 'start',
            file,
            fileId,
            fileName: file.name,
            fileHash,
            chunkSize,
            uploadedChunks,
            maxConcurrency: 3,
          });
        } catch (error) {
          reject(error);
        }
      });
    },
    [chunkSize, updateProgress],
  );

  // 主上传函数
  const upload = useCallback(
    async (file: File) => {
      try {
        // 重置状态
        setResult({});
        speedCalculatorRef.current = { startTime: 0, lastTime: 0, lastBytes: 0 };
        currentFileRef.current = file;

        // 文件验证
        const validationError = validateFile(file, { maxSize: maxFileSize, allowedTypes });

        if (validationError) {
          throw new Error(validationError);
        }

        updateProgress({
          status: 'hashing',
          progress: 0,
          bytesUploaded: 0,
          totalBytes: file.size,
          uploadedChunks: [],
          error: undefined,
        });

        // 1. 计算文件哈希
        const fileHash = await startHashing(file);
        fileHashRef.current = fileHash;

        // 2. 检查文件是否已存在
        const existingUrl = await checkFileExists(fileHash);

        if (existingUrl) {
          updateProgress({
            status: 'completed',
            progress: 100,
            bytesUploaded: file.size,
            totalBytes: file.size,
          });

          const result = { fileUrl: existingUrl, fileHash };
          setResult(result);
          onComplete?.(existingUrl);

          return result;
        }

        // 3. 生成文件ID
        const fileId = generateFileId(fileHash);
        fileIdRef.current = fileId;

        // 4. 获取已上传的分块（断点续传）
        const uploadedChunks = await getUploadedChunks(fileId);
        const totalChunks = calculateChunkCount(file.size, chunkSize);

        updateProgress({
          status: 'uploading',
          progress: 10,
          totalChunks,
          uploadedChunks,
        });

        // 5. 开始分块上传
        const fileUrl = await startUpload(file, fileId, fileHash, uploadedChunks);

        // 6. 上传完成
        updateProgress({
          status: 'completed',
          progress: 100,
          bytesUploaded: file.size,
          totalBytes: file.size,
        });

        const result = { fileUrl, fileHash };
        setResult(result);
        onComplete?.(fileUrl);

        return result;
      } catch (error) {
        const errorMessage = handleUploadError(error, '文件上传');

        updateProgress({
          status: 'error',
          error: errorMessage,
        });

        setResult({ error: errorMessage });
        onError?.(errorMessage);
        throw error;
      } finally {
        cleanupWorkers();
      }
    },
    [
      maxFileSize,
      allowedTypes,
      updateProgress,
      startHashing,
      checkFileExists,
      getUploadedChunks,
      chunkSize,
      startUpload,
      onComplete,
      onError,
      cleanupWorkers,
    ],
  );

  // 取消上传
  const cancel = useCallback(async () => {
    try {
      if (fileIdRef.current) {
        await uploadService.cancelUpload(fileIdRef.current);
      }
    } catch (error) {
      console.error('取消上传失败:', error);
    } finally {
      updateProgress({
        status: 'cancelled',
        error: '上传已取消',
      });
      cleanupWorkers();
    }
  }, [updateProgress, cleanupWorkers]);

  // 重新开始上传
  const retry = useCallback(() => {
    if (currentFileRef.current) {
      return upload(currentFileRef.current);
    }

    throw new Error('没有可重试的文件');
  }, [upload]);

  // 获取图片元数据（如果是图片文件）
  const getImageMetadata = useCallback(async () => {
    if (!fileHashRef.current) {
      throw new Error('文件哈希不存在');
    }

    try {
      const result = await ImageApi.GetImageMetadata(fileHashRef.current);

      return result.data;
    } catch (error) {
      console.error('获取图片元数据失败:', error);
      throw error;
    }
  }, []);

  // 格式化工具函数
  const formatters = {
    speed: (speed?: number) => (speed ? formatSpeed(speed) : '计算中...'),
    time: (time?: number) => (time ? formatTime(time) : '计算中...'),
    size: formatFileSize,
    progress: (progress: number) => `${progress}%`,
  };

  // 清理资源
  useEffect(() => {
    return cleanupWorkers;
  }, [cleanupWorkers]);

  return {
    // 状态
    progress,
    result,

    // 操作函数
    upload,
    cancel,
    retry,
    getImageMetadata,

    // 工具函数
    formatters,

    // 便捷属性
    isIdle: progress.status === 'idle',
    isHashing: progress.status === 'hashing',
    isUploading: progress.status === 'uploading',
    isCompleted: progress.status === 'completed',
    isError: progress.status === 'error',
    isCancelled: progress.status === 'cancelled',
    canRetry: progress.status === 'error' && !!currentFileRef.current,
    canCancel: ['hashing', 'uploading'].includes(progress.status),
  };
};

export default useFileUpload;
