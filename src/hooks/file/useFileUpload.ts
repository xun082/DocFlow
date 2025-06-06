import { useState, useRef, useCallback } from 'react';

import { useUploadProgress } from './useUploadProgress';

import { uploadService, UploadProgressInfo } from '@/services/upload';

// 默认配置
const DEFAULT_UPLOAD_CONFIG = {
  chunkSize: 2 * 1024 * 1024, // 2MB
  hashChunkSize: 1 * 1024 * 1024, // 1MB
  maxRetries: 3,
  retryDelay: 1000, // 1秒
  maxFileSize: 100 * 1024 * 1024, // 100MB
};

// 工具函数
const formatFileSize = (size: number): string => {
  if (size === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(size) / Math.log(k));

  return parseFloat((size / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const generateFileId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

const validateFile = (file: File, options: { maxSize?: number } = {}): string | null => {
  if (options.maxSize && file.size > options.maxSize) {
    return `文件过大，最大允许 ${formatFileSize(options.maxSize)}`;
  }

  return null;
};

const handleUploadError = (error: any): string => {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;

  return '上传失败，请重试';
};

export interface UploadState {
  // 文件信息
  file: File | null;
  fileHash: string | null;

  // 上传状态
  uploading: boolean;
  progress: number;
  uploadSpeed: string | null;
  remainingTime: string | null;

  // 哈希计算状态
  hashing: boolean;
  hashProgress: number;

  // 结果状态
  uploadedFileUrl: string | null;
  error: string | null;

  // 上传控制
  isPaused: boolean;
  canResume: boolean;
}

export interface UseFileUploadOptions {
  chunkSize?: number;
  hashChunkSize?: number;
  maxRetries?: number;
  retryDelay?: number;
  maxConcurrency?: number; // 最大并发数
  autoUpload?: boolean;
  onProgress?: (progressInfo: UploadProgressInfo) => void;
  onComplete?: (fileUrl: string) => void;
  onError?: (error: string) => void;
}

export interface UseFileUploadReturn {
  // 状态
  state: UploadState;

  // 操作方法
  selectFile: (file: File) => void;
  startUpload: () => Promise<void>;
  pauseUpload: () => void;
  resumeUpload: () => Promise<void>;
  cancelUpload: () => void;
  resetUpload: () => void;

  // 工具方法
  validateFile: (file: File) => string | null;
  formatFileSize: (size: number) => string;
}

const DEFAULT_OPTIONS: Required<UseFileUploadOptions> = {
  chunkSize: DEFAULT_UPLOAD_CONFIG.chunkSize,
  hashChunkSize: DEFAULT_UPLOAD_CONFIG.hashChunkSize,
  maxRetries: DEFAULT_UPLOAD_CONFIG.maxRetries,
  retryDelay: DEFAULT_UPLOAD_CONFIG.retryDelay,
  maxConcurrency: 3, // 默认并发数
  autoUpload: false,
  onProgress: () => {},
  onComplete: () => {},
  onError: () => {},
};

export const useFileUpload = (options: UseFileUploadOptions = {}): UseFileUploadReturn => {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // 状态管理
  const [state, setState] = useState<UploadState>({
    file: null,
    fileHash: null,
    uploading: false,
    progress: 0,
    uploadSpeed: null,
    remainingTime: null,
    hashing: false,
    hashProgress: 0,
    uploadedFileUrl: null,
    error: null,
    isPaused: false,
    canResume: false,
  });

  // Workers和控制引用
  const hashWorkerRef = useRef<Worker | null>(null);
  const uploadWorkerRef = useRef<Worker | null>(null);
  const currentFileIdRef = useRef<string | null>(null);
  const isPausedRef = useRef<boolean>(false);

  // 进度Hook
  const { updateProgress, resetProgress } = useUploadProgress(
    (progress) => setState((prev) => ({ ...prev, progress })),
    (speed) => setState((prev) => ({ ...prev, uploadSpeed: speed })),
    (time) => setState((prev) => ({ ...prev, remainingTime: time })),
  );

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

  // 创建哈希Worker
  const createHashWorker = useCallback(() => {
    cleanupWorkers();

    try {
      hashWorkerRef.current = new Worker(new URL('../../worker/hashWorker.ts', import.meta.url), {
        type: 'module',
      });

      return hashWorkerRef.current;
    } catch (error) {
      console.error('创建哈希Worker失败:', error);
      throw new Error('无法创建哈希计算Worker');
    }
  }, [cleanupWorkers]);

  // 创建上传Worker
  const createUploadWorker = useCallback(() => {
    if (uploadWorkerRef.current) {
      uploadWorkerRef.current.terminate();
    }

    try {
      uploadWorkerRef.current = new Worker(
        new URL('../../worker/uploadWorker.ts', import.meta.url),
        { type: 'module' },
      );

      return uploadWorkerRef.current;
    } catch (error) {
      console.error('创建上传Worker失败:', error);
      throw new Error('无法创建上传Worker');
    }
  }, []);

  // 计算文件哈希
  const calculateFileHash = useCallback(
    async (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        try {
          const worker = createHashWorker();

          const timeoutId = setTimeout(
            () => {
              worker.terminate();
              reject(new Error('哈希计算超时'));
            },
            5 * 60 * 1000,
          ); // 5分钟超时

          worker.onmessage = (e) => {
            const { type, progress, hash, error } = e.data;

            switch (type) {
              case 'progress':
                setState((prev) => ({ ...prev, hashProgress: progress }));
                break;
              case 'complete':
                clearTimeout(timeoutId);
                setState((prev) => ({ ...prev, hashProgress: 100 }));
                resolve(hash);
                break;
              case 'error':
                clearTimeout(timeoutId);
                reject(new Error(error));
                break;
            }
          };

          worker.onerror = () => {
            clearTimeout(timeoutId);
            reject(new Error('哈希计算Worker错误'));
          };

          // 发送计算任务
          worker.postMessage({ file, chunkSize: opts.hashChunkSize });
        } catch (error) {
          reject(error);
        }
      });
    },
    [opts.hashChunkSize, createHashWorker],
  );

  // 文件验证函数
  const validateFileInput = useCallback((file: File): string | null => {
    return validateFile(file, {
      maxSize: DEFAULT_UPLOAD_CONFIG.maxFileSize,
    });
  }, []);

  // 使用Worker执行分块上传
  const performChunkUploadWithWorker = useCallback(
    async (
      file: File,
      fileId: string,
      fileHash: string,
      uploadedChunks: number[] = [],
    ): Promise<string> => {
      return new Promise((resolve, reject) => {
        try {
          const worker = createUploadWorker();

          const timeoutId = setTimeout(
            () => {
              worker.terminate();
              reject(new Error('上传超时'));
            },
            30 * 60 * 1000,
          ); // 30分钟超时

          worker.onmessage = (e) => {
            const {
              type,
              chunkNumber,
              totalChunks,
              bytesUploaded,
              totalBytes,
              fileUrl,
              error,
              uploadedChunks: currentUploadedChunks,
            } = e.data;

            // 检查是否已暂停
            if (isPausedRef.current) {
              worker.terminate();

              return;
            }

            switch (type) {
              case 'progress':
                // 更新进度
                updateProgress(bytesUploaded, totalBytes);

                // 触发用户回调
                opts.onProgress({
                  chunkNumber,
                  totalChunks,
                  bytesUploaded,
                  totalBytes,
                });

                // 保存断点续传信息
                if (currentUploadedChunks && currentUploadedChunks.length > 0) {
                  setState((prev) => ({ ...prev, canResume: true }));
                }

                break;

              case 'complete':
                clearTimeout(timeoutId);

                if (fileUrl) {
                  resolve(fileUrl);
                } else {
                  reject(new Error('服务器未返回文件URL'));
                }

                break;

              case 'error':
                clearTimeout(timeoutId);
                reject(new Error(error));
                break;
            }
          };

          worker.onerror = () => {
            clearTimeout(timeoutId);
            reject(new Error('上传Worker执行失败'));
          };

          // 启动Worker上传
          worker.postMessage({
            type: 'start',
            file,
            fileId,
            fileName: file.name,
            fileHash,
            chunkSize: opts.chunkSize,
            uploadedChunks,
            maxConcurrency: opts.maxConcurrency,
          });
        } catch (error) {
          reject(error);
        }
      });
    },
    [opts, updateProgress, createUploadWorker],
  );

  // 选择文件
  const selectFile = useCallback(
    (file: File) => {
      const error = validateFileInput(file);

      if (error) {
        setState((prev) => ({ ...prev, error }));
        opts.onError(error);

        return;
      }

      setState((prev) => ({
        ...prev,
        file,
        fileHash: null,
        error: null,
        progress: 0,
        hashProgress: 0,
        uploadedFileUrl: null,
        canResume: false,
        isPaused: false,
      }));

      resetProgress();
      isPausedRef.current = false;

      if (opts.autoUpload) {
        startUpload();
      }
    },
    [opts, resetProgress, validateFileInput],
  );

  // 开始上传
  const startUpload = useCallback(async () => {
    if (!state.file) {
      const error = '请先选择文件';
      setState((prev) => ({ ...prev, error }));
      opts.onError(error);

      return;
    }

    try {
      setState((prev) => ({
        ...prev,
        uploading: true,
        error: null,
        hashing: true,
        isPaused: false,
      }));
      isPausedRef.current = false;

      // 计算文件哈希
      const fileHash = await calculateFileHash(state.file);

      // 检查是否在哈希计算过程中被暂停
      if (isPausedRef.current) {
        return;
      }

      setState((prev) => ({ ...prev, fileHash, hashing: false }));

      // 检查文件是否已存在 - 使用 uploadService
      const existsResult = await uploadService.checkFileExists(fileHash);

      if (existsResult.exists && existsResult.fileUrl) {
        setState((prev) => ({
          ...prev,
          uploadedFileUrl: existsResult.fileUrl || null,
          progress: 100,
          uploading: false,
        }));
        opts.onComplete(existsResult.fileUrl);

        return;
      }

      // 生成文件ID
      const fileId = generateFileId();
      currentFileIdRef.current = fileId;

      // 获取已上传的分块 - 使用 uploadService
      const uploadedChunks = await uploadService.getUploadedChunks(fileId);

      if (uploadedChunks.length > 0) {
        setState((prev) => ({ ...prev, canResume: true }));
      }

      // 检查是否在检查过程中被暂停
      if (isPausedRef.current) {
        return;
      }

      // 使用Worker执行上传
      const fileUrl = await performChunkUploadWithWorker(
        state.file,
        fileId,
        fileHash,
        uploadedChunks,
      );

      setState((prev) => ({
        ...prev,
        uploadedFileUrl: fileUrl,
        uploading: false,
        progress: 100,
      }));

      opts.onComplete(fileUrl);
    } catch (error) {
      if (isPausedRef.current) {
        // 如果是暂停导致的错误，不显示错误信息
        setState((prev) => ({ ...prev, uploading: false, hashing: false }));

        return;
      }

      const errorMessage = handleUploadError(error);
      setState((prev) => ({
        ...prev,
        error: errorMessage,
        uploading: false,
        hashing: false,
        canResume: true,
      }));
      opts.onError(errorMessage);
    }
  }, [state.file, calculateFileHash, performChunkUploadWithWorker, opts]);

  // 暂停上传
  const pauseUpload = useCallback(() => {
    isPausedRef.current = true;
    setState((prev) => ({ ...prev, isPaused: true }));

    // 终止Workers
    cleanupWorkers();
  }, [cleanupWorkers]);

  // 恢复上传
  const resumeUpload = useCallback(async () => {
    isPausedRef.current = false;
    setState((prev) => ({ ...prev, isPaused: false }));

    if (!state.uploading && state.canResume) {
      await startUpload();
    }
  }, [state.uploading, state.canResume, startUpload]);

  // 取消上传
  const cancelUpload = useCallback(async () => {
    isPausedRef.current = true;

    // 终止所有Worker
    cleanupWorkers();

    // 如果有当前文件ID，尝试取消服务器端的上传
    if (currentFileIdRef.current) {
      try {
        await uploadService.cancelUpload(currentFileIdRef.current);
      } catch (error) {
        console.warn('取消服务器端上传失败:', error);
      }
    }

    // 重置状态
    setState((prev) => ({
      ...prev,
      uploading: false,
      hashing: false,
      isPaused: false,
      progress: 0,
      hashProgress: 0,
      error: null,
    }));

    // 清理当前文件ID
    currentFileIdRef.current = null;
    resetProgress();
  }, [cleanupWorkers, resetProgress]);

  // 重置上传
  const resetUpload = useCallback(() => {
    cancelUpload();
    setState((prev) => ({
      ...prev,
      file: null,
      fileHash: null,
      uploadedFileUrl: null,
      canResume: false,
      error: null,
    }));
    resetProgress();
  }, [cancelUpload, resetProgress]);

  return {
    state,
    selectFile,
    startUpload,
    pauseUpload,
    resumeUpload,
    cancelUpload,
    resetUpload,
    validateFile: validateFileInput,
    formatFileSize,
  };
};
