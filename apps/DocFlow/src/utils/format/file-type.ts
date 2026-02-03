/**
 * File type utilities
 */

/**
 * Get Tailwind CSS color class for file type
 * @param extension - File extension (with or without dot)
 * @returns Tailwind CSS color class name
 */
export function getFileTypeColor(extension: string): string {
  const ext = extension.toLowerCase().replace(/^\./, '');

  const colorMap: Record<string, string> = {
    // Documents
    pdf: 'text-red-500',
    doc: 'text-blue-500',
    docx: 'text-blue-500',
    xls: 'text-green-500',
    xlsx: 'text-green-500',
    ppt: 'text-orange-500',
    pptx: 'text-orange-500',
    txt: 'text-gray-500',
    md: 'text-gray-500',

    // Images
    jpg: 'text-purple-500',
    jpeg: 'text-purple-500',
    png: 'text-purple-500',
    gif: 'text-purple-500',
    webp: 'text-purple-500',
    svg: 'text-purple-500',
    bmp: 'text-purple-500',

    // Archives
    zip: 'text-yellow-500',
    rar: 'text-yellow-500',
    '7z': 'text-yellow-500',
    tar: 'text-yellow-500',
    gz: 'text-yellow-500',

    // Audio
    mp3: 'text-pink-500',
    wav: 'text-pink-500',
    ogg: 'text-pink-500',
    flac: 'text-pink-500',

    // Video
    mp4: 'text-indigo-500',
    avi: 'text-indigo-500',
    mov: 'text-indigo-500',
    wmv: 'text-indigo-500',
    flv: 'text-indigo-500',
  };

  return colorMap[ext] || 'text-muted-foreground';
}
