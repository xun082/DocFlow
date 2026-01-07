/**
 * DOCX export utilities
 */

import { toast } from 'sonner';
import { Editor } from '@tiptap/core';

import { generateDOCX } from '../export-doc';

/**
 * Export document as DOCX
 * @param name - Document name for file
 * @param editor - TipTap editor instance
 */
export async function handleExportDOCX(name: string, editor: Editor): Promise<void> {
  try {
    if (!editor) {
      toast.warning('请先打开文档后再导出DOCX');

      return;
    }

    const json = editor.getJSON();
    console.log('🚀 ~ Exporting DOCX ~ json:', json);

    if (!json?.content?.length) {
      toast.warning('文档内容为空');

      return;
    }

    const docx = await generateDOCX(
      {
        type: 'doc',
        content: json.content.map((item: any) => {
          // Transform custom image types to standard image nodes
          if (['textToImage', 'imageBlock'].includes(item.type)) {
            return {
              attrs: {
                ...item.attrs,
                src: item.attrs?.src ? item.attrs?.src : item.attrs?.imageUrl,
              },
              type: 'image',
            };
          }

          // Transform chart to image
          if (item.type === 'chart') {
            return {
              ...item,
              attrs: {
                ...item.attrs,
                src: item.attrs?.png,
              },
              type: 'image',
            };
          }

          return item;
        }),
      },
      { outputType: 'nodebuffer' },
    );

    // Convert Node.js Buffer to browser-compatible Blob
    const blob = new Blob([new Uint8Array(docx)], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });

    const sanitizedName = name.trim().replace(/\s+/g, '_');
    const fileName = `${sanitizedName}.docx`;

    // Download file
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  } catch (error: any) {
    toast.error(`导出DOCX失败: ${error.message || '未知错误'}`);
  }
}
