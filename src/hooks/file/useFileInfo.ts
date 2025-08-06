interface FileInfo {
  name: string;
  size: string;
  type: string;
}

// 格式化文件大小的工具函数
function formatFileSize(sizeInBytes: number): string {
  if (sizeInBytes < 1024) {
    return `${sizeInBytes} B`;
  } else if (sizeInBytes < 1024 * 1024) {
    return `${(sizeInBytes / 1024).toFixed(2)} KB`;
  } else if (sizeInBytes < 1024 * 1024 * 1024) {
    return `${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`;
  } else {
    return `${(sizeInBytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  }
}

export function useFileInfo(file: File | null): FileInfo | null {
  if (!file) return null;

  return {
    name: file.name,
    size: formatFileSize(file.size),
    type: file.type || '未知类型',
  };
}
