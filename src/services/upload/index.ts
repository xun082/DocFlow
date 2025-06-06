import request from '@/services/request';

/**
 * 上传相关的API接口类型定义
 */
export interface FileExistsResponse {
  exists: boolean;
  fileUrl?: string;
}

export interface ChunkUploadResponse {
  success: boolean;
  message: string;
  isComplete?: boolean;
  fileUrl?: string;
}

export interface ChunkInfoResponse {
  uploadedChunks: number[];
  totalChunks: number;
  isComplete: boolean;
}

export interface CompleteUploadResponse {
  success: boolean;
  fileUrl: string;
  fileHash?: string;
  message: string;
}

export interface UploadProgressInfo {
  chunkNumber: number;
  totalChunks: number;
  bytesUploaded: number;
  totalBytes: number;
  speed?: number;
  remainingTime?: number;
}

/**
 * 上传服务类 - 完全基于你已有的 request 服务
 */
export class UploadService {
  private baseUrl = '/api/v1/upload';

  /**
   * 检查文件是否已存在（基于文件哈希）
   */
  async checkFileExists(fileHash: string) {
    const result = await request.get<FileExistsResponse>(`${this.baseUrl}/check-file`, {
      params: { fileHash },
      errorHandler: (error) => {
        console.error('检查文件存在性时出错:', error);
      },
    });

    return result.data?.data || { exists: false };
  }

  /**
   * 获取已上传的分块信息
   */
  async getUploadedChunks(fileId: string) {
    const result = await request.get<ChunkInfoResponse>(`${this.baseUrl}/chunk-info/${fileId}`, {
      errorHandler: (error) => {
        console.error('获取已上传分块信息时出错:', error);
      },
    });

    return result.data?.data?.uploadedChunks || [];
  }

  /**
   * 上传单个分块 - 直接使用你的 request 服务
   */
  async uploadChunk(
    chunk: Blob,
    fileId: string,
    chunkNumber: number,
    totalChunks: number,
    fileName: string,
    totalSize: number,
    mimeType: string,
    fileHash: string,
    chunkSize: number,
    onProgress?: (progress: UploadProgressInfo) => void,
  ) {
    const formData = new FormData();

    // 根据后端API要求添加所有必要字段
    formData.append('file', chunk);
    formData.append('fileId', fileId); // 后端需要的fileId字段
    formData.append('fileName', fileName);
    formData.append('totalSize', totalSize.toString());
    formData.append('mimeType', mimeType || 'application/octet-stream');
    formData.append('chunkNumber', chunkNumber.toString());
    formData.append('chunkSize', chunkSize.toString()); // 后端需要的chunkSize字段
    formData.append('totalChunks', totalChunks.toString());
    formData.append('fileHash', fileHash);

    console.log('上传参数:', {
      fileId,
      fileName,
      totalSize,
      mimeType,
      chunkNumber,
      chunkSize,
      totalChunks,
      fileHash,
    });

    const result = await request.post<ChunkUploadResponse>(`${this.baseUrl}/chunk`, {
      params: formData,
      timeout: 60000,
      retries: 2,
      errorHandler: (error) => {
        console.error(`上传分块 ${chunkNumber} 失败:`, error);
      },
    });

    // 触发进度回调
    if (onProgress) {
      const bytesUploaded = (chunkNumber + 1) * chunkSize;
      onProgress({
        chunkNumber,
        totalChunks,
        bytesUploaded: Math.min(bytesUploaded, totalSize),
        totalBytes: totalSize,
      });
    }

    if (result.error) {
      console.error('上传响应错误:', result.error);

      return { success: false, message: result.error };
    }

    return result.data?.data || { success: true, message: '上传成功' };
  }

  /**
   * 完成文件上传（合并分块）
   */
  async completeUpload(
    fileId: string,
    fileName: string,
    totalChunks: number,
    fileHash: string,
    totalSize: number,
    mimeType: string,
  ) {
    const result = await request.post<CompleteUploadResponse>(`${this.baseUrl}/complete-file`, {
      params: {
        fileId,
        fileName,
        totalChunks,
        fileHash,
        totalSize,
        mimeType,
      },
      errorHandler: (error) => {
        console.error('完成文件上传时出错:', error);
      },
    });

    return (
      result.data?.data || { success: false, fileUrl: '', message: result.error || '完成上传失败' }
    );
  }

  /**
   * 取消上传
   */
  async cancelUpload(fileId: string) {
    const result = await request.delete<{ success: boolean }>(`${this.baseUrl}/cancel/${fileId}`, {
      errorHandler: (error) => {
        console.error('取消上传时出错:', error);
      },
    });

    return result.data?.data?.success || false;
  }

  /**
   * 获取上传状态
   */
  async getUploadStatus(fileId: string) {
    const result = await request.get<ChunkInfoResponse>(`${this.baseUrl}/status/${fileId}`, {
      errorHandler: (error) => {
        console.error('获取上传状态时出错:', error);
      },
    });

    return result.data?.data || { uploadedChunks: [], totalChunks: 0, isComplete: false };
  }

  /**
   * 测试服务器连接
   */
  async testConnection() {
    const result = await request.get<{ status: string }>(`${this.baseUrl}/health`, {
      timeout: 5000,
      errorHandler: (error) => {
        console.error('测试服务器连接时出错:', error);
      },
    });

    if (result.error) {
      throw new Error(result.error);
    }

    return result.data?.data?.status === 'ok';
  }
}

// 创建单例实例
export const uploadService = new UploadService();

// 导出默认实例
export default uploadService;
