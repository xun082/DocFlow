/**
 * 高性能文件哈希计算 Worker
 * 使用 Web Crypto API 进行 SHA-256 哈希计算
 */

interface HashMessage {
  file: File;
  chunkSize: number;
}

interface ProgressMessage {
  type: 'progress';
  progress: number;
}

interface CompleteMessage {
  type: 'complete';
  hash: string;
}

interface ErrorMessage {
  type: 'error';
  error: string;
}

/**
 * 将 ArrayBuffer 转换为十六进制字符串
 */
function arrayBufferToHex(buffer: ArrayBuffer): string {
  const hashArray = Array.from(new Uint8Array(buffer));

  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * 计算文件哈希
 */
async function calculateFileHash(file: File, chunkSize: number): Promise<string> {
  // 对于小文件 (< 10MB)，直接计算
  if (file.size < 10 * 1024 * 1024) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);

      self.postMessage({
        type: 'progress',
        progress: 100,
      } as ProgressMessage);

      return arrayBufferToHex(hashBuffer);
    } catch (error) {
      throw new Error(
        `小文件哈希计算失败: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  // 对于大文件，分块计算
  const totalChunks = Math.ceil(file.size / chunkSize);
  const hashes: string[] = [];

  for (let i = 0; i < totalChunks; i++) {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, file.size);
    const chunk = file.slice(start, end);

    try {
      const chunkBuffer = await chunk.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', chunkBuffer);
      const hashHex = arrayBufferToHex(hashBuffer);
      hashes.push(hashHex);

      // 报告进度
      const progress = Math.round(((i + 1) / totalChunks) * 100);
      self.postMessage({
        type: 'progress',
        progress,
      } as ProgressMessage);

      // 让出执行权，避免阻塞
      if (i % 10 === 0) {
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    } catch (error) {
      throw new Error(
        `分块 ${i + 1} 哈希计算失败: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  // 将所有分块哈希合并，再计算最终哈希
  try {
    const combinedHash = hashes.join('');
    const encoder = new TextEncoder();
    const finalHashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(combinedHash));

    return arrayBufferToHex(finalHashBuffer);
  } catch (error) {
    throw new Error(
      `最终哈希计算失败: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/**
 * Worker 消息处理
 */
self.onmessage = async (e: MessageEvent<HashMessage>) => {
  const { file, chunkSize } = e.data;

  try {
    // 验证输入
    if (!file || !(file instanceof File)) {
      throw new Error('无效的文件对象');
    }

    if (!chunkSize || chunkSize <= 0) {
      throw new Error('无效的分块大小');
    }

    // 计算哈希
    const hash = await calculateFileHash(file, chunkSize);

    // 发送完成消息
    self.postMessage({
      type: 'complete',
      hash,
    } as CompleteMessage);
  } catch (error) {
    // 发送错误消息
    self.postMessage({
      type: 'error',
      error: error instanceof Error ? error.message : '哈希计算失败',
    } as ErrorMessage);
  }
};

/**
 * Worker 错误处理
 */
self.onerror = (error) => {
  self.postMessage({
    type: 'error',
    error: `Worker 执行错误: ${error instanceof ErrorEvent ? error.message : 'Unknown worker error'}`,
  } as ErrorMessage);
};

// 导出类型（用于类型检查）
export type { HashMessage, ProgressMessage, CompleteMessage, ErrorMessage };
