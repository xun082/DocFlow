/**
 * 上传工具函数集合
 * 专注于纯函数工具，不包含API调用逻辑
 */

// ==================== 文件大小和速度格式化 ====================

/**
 * 格式化上传速度显示
 * @param bytesPerSecond 每秒字节数
 * @returns 格式化的速度字符串
 */
export const formatSpeed = (bytesPerSecond: number): string => {
  if (bytesPerSecond < 1024) {
    return `${bytesPerSecond.toFixed(1)} B/s`;
  } else if (bytesPerSecond < 1024 * 1024) {
    return `${(bytesPerSecond / 1024).toFixed(1)} KB/s`;
  } else {
    return `${(bytesPerSecond / (1024 * 1024)).toFixed(1)} MB/s`;
  }
};

/**
 * 格式化剩余时间显示
 * @param seconds 剩余秒数
 * @returns 格式化的时间字符串
 */
export const formatTime = (seconds: number): string => {
  if (seconds < 60) {
    return `${Math.ceil(seconds)}s`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.ceil(seconds % 60);

    return `${minutes}m ${remainingSeconds}s`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    return `${hours}h ${minutes}m`;
  }
};

/**
 * 格式化文件大小显示
 * @param bytes 字节数
 * @returns 格式化的大小字符串
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';

  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));

  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${sizes[i]}`;
};

// ==================== 文件处理工具 ====================

/**
 * 清理文件名，移除特殊字符
 * @param fileName 原始文件名
 * @returns 清理后的文件名
 */
export const sanitizeFileName = (fileName: string): string => {
  return fileName.replace(/[^a-zA-Z0-9\u4e00-\u9fff.\-_]/g, '_');
};

/**
 * 生成文件唯一ID
 * @param fileHash 文件哈希值
 * @returns 文件ID
 */
export const generateFileId = (fileHash: string): string => {
  return `${fileHash.substring(0, 10)}-${Date.now()}`;
};

/**
 * 计算文件分块数量
 * @param fileSize 文件大小
 * @param chunkSize 分块大小
 * @returns 分块数量
 */
export const calculateChunkCount = (fileSize: number, chunkSize: number): number => {
  return Math.ceil(fileSize / chunkSize);
};

/**
 * 获取分块范围
 * @param chunkNumber 分块序号
 * @param chunkSize 分块大小
 * @param fileSize 文件总大小
 * @returns 分块的开始和结束位置
 */
export const getChunkRange = (
  chunkNumber: number,
  chunkSize: number,
  fileSize: number,
): { start: number; end: number; size: number } => {
  const start = chunkNumber * chunkSize;
  const end = Math.min(start + chunkSize, fileSize);
  const size = end - start;

  return { start, end, size };
};

// ==================== 上传状态工具 ====================

/**
 * 计算上传进度百分比
 * @param uploadedChunks 已上传的分块数组
 * @param totalChunks 总分块数
 * @returns 进度百分比 (0-100)
 */
export const calculateProgress = (uploadedChunks: number[], totalChunks: number): number => {
  return Math.round((uploadedChunks.length / totalChunks) * 100);
};

/**
 * 检查上传是否完成
 * @param uploadedChunks 已上传的分块数组
 * @param totalChunks 总分块数
 * @returns 是否完成
 */
export const isUploadComplete = (uploadedChunks: number[], totalChunks: number): boolean => {
  return uploadedChunks.length === totalChunks;
};

/**
 * 获取未上传的分块列表
 * @param uploadedChunks 已上传的分块数组
 * @param totalChunks 总分块数
 * @returns 未上传的分块数组
 */
export const getMissingChunks = (uploadedChunks: number[], totalChunks: number): number[] => {
  const missing: number[] = [];

  for (let i = 0; i < totalChunks; i++) {
    if (!uploadedChunks.includes(i)) {
      missing.push(i);
    }
  }

  return missing;
};

// ==================== 错误处理工具 ====================

/**
 * 统一的上传错误处理
 * @param error 错误对象
 * @param context 错误上下文
 * @returns 用户友好的错误信息
 */
export const handleUploadError = (error: unknown, context: string): string => {
  console.error(`${context} 错误:`, error);

  if (error instanceof Error) {
    // 网络错误
    if (error.message.includes('fetch')) {
      return '网络连接失败，请检查网络状态';
    }

    // 超时错误
    if (error.message.includes('timeout')) {
      return '请求超时，请重试';
    }

    // 服务器错误
    if (error.message.includes('500')) {
      return '服务器内部错误，请稍后重试';
    }

    // 参数错误
    if (error.message.includes('400')) {
      return '请求参数错误';
    }

    return error.message;
  }

  return `${context}时发生未知错误`;
};

// ==================== 文件验证工具 ====================

/**
 * 验证文件类型
 * @param file 文件对象
 * @param allowedTypes 允许的文件类型数组
 * @returns 验证结果
 */
export const validateFileType = (file: File, allowedTypes?: string[]): string | null => {
  if (!allowedTypes || allowedTypes.length === 0) {
    return null; // 无限制
  }

  const fileType = file.type || '';
  const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';

  const isTypeAllowed = allowedTypes.some((type) => {
    if (type.includes('/')) {
      // MIME type 检查
      return fileType === type || fileType.startsWith(type.replace('*', ''));
    } else {
      // 文件扩展名检查
      return fileExtension === type.toLowerCase().replace('.', '');
    }
  });

  return isTypeAllowed ? null : `不支持的文件类型。支持的类型: ${allowedTypes.join(', ')}`;
};

/**
 * 验证文件大小
 * @param file 文件对象
 * @param maxSize 最大文件大小(字节)
 * @returns 验证结果
 */
export const validateFileSize = (file: File, maxSize?: number): string | null => {
  if (!maxSize) {
    return null; // 无限制
  }

  return file.size <= maxSize
    ? null
    : `文件过大。最大允许: ${formatFileSize(maxSize)}，当前: ${formatFileSize(file.size)}`;
};

/**
 * 综合文件验证
 * @param file 文件对象
 * @param options 验证选项
 * @returns 验证结果
 */
export const validateFile = (
  file: File,
  options: {
    maxSize?: number;
    allowedTypes?: string[];
  } = {},
): string | null => {
  const sizeError = validateFileSize(file, options.maxSize);
  if (sizeError) return sizeError;

  const typeError = validateFileType(file, options.allowedTypes);
  if (typeError) return typeError;

  return null;
};

// ==================== 默认配置 ====================

/**
 * 默认上传配置
 */
export const DEFAULT_UPLOAD_CONFIG = {
  chunkSize: 2 * 1024 * 1024, // 2MB
  hashChunkSize: 5 * 1024 * 1024, // 5MB
  maxRetries: 3,
  retryDelay: 1000,
  timeout: 60000, // 60秒
  maxFileSize: 100 * 1024 * 1024, // 100MB
} as const;
