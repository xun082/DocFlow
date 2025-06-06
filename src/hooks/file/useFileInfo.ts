import { useMemo } from 'react';

interface FileInfo {
  name: string;
  size: string;
  type: string;
}

export function useFileInfo(file: File | null): FileInfo | null {
  return useMemo(() => {
    if (!file) return null;

    // 格式化文件大小
    const formatFileSize = (sizeInBytes: number): string => {
      if (sizeInBytes < 1024) {
        return `${sizeInBytes} B`;
      } else if (sizeInBytes < 1024 * 1024) {
        return `${(sizeInBytes / 1024).toFixed(2)} KB`;
      } else if (sizeInBytes < 1024 * 1024 * 1024) {
        return `${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`;
      } else {
        return `${(sizeInBytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
      }
    };

    return {
      name: file.name,
      size: formatFileSize(file.size),
      type: file.type || '未知类型',
    };
  }, [file]);
}
