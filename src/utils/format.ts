/**
 * 格式化日期时间
 * @param dateStr - ISO 日期字符串
 * @param options - 格式化选项
 * @param options.showSeconds - 是否显示秒，默认 true
 * @returns 格式化后的日期时间字符串 (YYYY/MM/DD HH:mm:ss 或 YYYY/MM/DD HH:mm)
 */
export const formatDateTime = (
  dateStr: string,
  options: { showSeconds?: boolean } = {},
): string => {
  if (!dateStr) return '';

  const { showSeconds = true } = options;

  try {
    const date = new Date(dateStr);

    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      ...(showSeconds && { second: '2-digit' }),
    });
  } catch {
    return dateStr;
  }
};

/**
 * 格式化文件大小
 * @param bytes - 文件大小（字节）
 * @returns 格式化后的文件大小字符串 (B, KB, MB, GB)
 */
export const formatFileSize = (bytes: number | string): string => {
  const size = typeof bytes === 'string' ? parseInt(bytes, 10) : bytes;
  if (!size || size === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(size) / Math.log(k));

  return parseFloat((size / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * 获取文件类型对应的图标颜色
 * @param extension - 文件扩展名（带或不带点都可以）
 * @returns Tailwind CSS 颜色类名
 */
export const getFileTypeColor = (extension: string): string => {
  const ext = extension.toLowerCase().replace(/^\./, '');

  if (ext === 'pdf') return 'text-red-500';
  if (['doc', 'docx'].includes(ext)) return 'text-blue-500';
  if (['xls', 'xlsx'].includes(ext)) return 'text-green-500';
  if (['ppt', 'pptx'].includes(ext)) return 'text-orange-500';
  if (['txt', 'md'].includes(ext)) return 'text-gray-500';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext)) return 'text-purple-500';
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return 'text-yellow-500';
  if (['mp3', 'wav', 'ogg', 'flac'].includes(ext)) return 'text-pink-500';
  if (['mp4', 'avi', 'mov', 'wmv', 'flv'].includes(ext)) return 'text-indigo-500';

  return 'text-muted-foreground';
};
