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

// 根据消息类型定义不同的消息结构
export type WorkerMessage =
  | {
      type: 'progress';
      progress: number; // progress 在 type === "progress" 时必须存在
    }
  | {
      type: 'complete';
      hash?: string;
      fileUrl?: string;
    }
  | {
      type: 'error';
      error: string;
    }
  | {
      type: 'progress';
      bytesUploaded: number;
      totalBytes: number;
    };

export interface UploadConfig {
  CHUNK_SIZE: number;
  HASH_CHUNK_SIZE: number;
  API_BASE_URL: string;
}
