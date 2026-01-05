import { toast } from 'sonner';
import { Editor } from '@tiptap/core';
import { jsPDF } from 'jspdf';
import { snapdom } from '@zumer/snapdom'; // 请确保已安装 snapdom

import { generateDOCX } from '@/utils/export-doc/generator';

export const extraCss = `
          * { box-sizing: border-box; }
          img { display: block; max-width: 100%; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            line-height: 1.8;
            color: #333;
            font-size: 16px;
            padding: 10px;
            max-width: 677px;
            margin: 0 auto;
          }
          h1, h2, h3, h4, h5, h6 {
            margin-top: 24px;
            margin-bottom: 16px;
            font-weight: 600;
            line-height: 1.4;
          }
          h1 { font-size: 24px; }
          h2 { font-size: 20px; }
          h3 { font-size: 18px; }
          h4 { font-size: 16px; }
          p {
            margin-bottom: 16px;
            text-align: justify;
          }
          a {
            color: #576b95;
            text-decoration: none;
          }
          blockquote {
            border-left: 4px solid #576b95;
            padding-left: 16px;
            margin: 20px 0;
            color: #666;
            background-color: #f7f7f7;
            padding: 16px;
            border-radius: 4px;
          }
          ul, ol {
            padding-left: 24px;
            margin-bottom: 16px;
          }
          li {
            margin-bottom: 8px;
          }
          code {
            background-color: #f5f5f5;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: Consolas, Monaco, "Andale Mono", monospace;
            font-size: 14px;
            color: #d63384;
          }
          pre {
            background-color: #0d1117;
            color: #e6edf3;
            padding: 16px;
            border-radius: 8px;
            overflow-x: auto;
            margin: 20px 0;
            border: 1px solid #21262d;
            font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Consolas', monospace;
            font-size: 14px;
            line-height: 1.6;
          }
          pre code {
            background-color: transparent;
            padding: 0;
            color: inherit;
            font-size: inherit;
            font-family: inherit;
          }
          pre .hljs-comment,
          pre .hljs-quote {
            color: #8b949e;
            font-style: italic;
          }
          pre .hljs-keyword,
          pre .hljs-selector-tag,
          pre .hljs-literal,
          pre .hljs-section,
          pre .hljs-link {
            color: #ff7b72;
          }
          pre .hljs-function .hljs-keyword {
            color: #d2a8ff;
          }
          pre .hljs-subst {
            color: #e6edf3;
          }
          pre .hljs-string,
          pre .hljs-attr,
          pre .hljs-symbol,
          pre .hljs-bullet,
          pre .hljs-addition {
            color: #a5d6ff;
          }
          pre .hljs-title,
          pre .hljs-name,
          pre .hljs-selector-id,
          pre .hljs-selector-class,
          pre .hljs-type,
          pre .hljs-template-tag {
            color: #79c0ff;
          }
          pre .hljs-number,
          pre .hljs-meta,
          pre .hljs-built_in,
          pre .hljs-builtin-name,
          pre .hljs-params {
            color: #79c0ff;
          }
          pre .hljs-variable {
            color: #ffa657;
          }
          pre .hljs-attr {
            color: #ffa657;
          }
          pre .hljs-tag {
            color: #ffa657;
          }
          pre .hljs-regexp {
            color: #a5d6ff;
          }
          pre .hljs-deletion {
            color: #ffa198;
            background-color: #481f20;
          }
          pre .hljs-addition {
            color: #3fb950;
            background-color: #1f3923;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            font-size: 14px;
          }
          th, td {
            border: 1px solid #e0e0e0;
            padding: 12px;
            text-align: left;
          }
          th {
            background-color: #f5f5f5;
            font-weight: 600;
          }
          hr {
            border: none;
            border-top: 1px solid #e0e0e0;
            margin: 24px 0;
          }
          strong {
            font-weight: 600;
          }
          em {
            font-style: italic;
          }
          .ProseMirror {
            outline: none;
          }
        `;

/**
 * 清理元素属性，移除事件处理器和不必要的data属性
 * @param container - HTML容器元素
 * @param allowedDataAttributes - 需要保留的data属性列表，默认保留data-src和data-type
 */
export function cleanElementAttributes(
  container: HTMLElement,
  allowedDataAttributes: string[] = ['data-src', 'data-type'],
): void {
  const allElements = container.querySelectorAll('*');
  allElements.forEach((el) => {
    // 移除所有以on开头的属性（事件处理器）
    Array.from(el.attributes).forEach((attr) => {
      if (attr.name.startsWith('on')) {
        el.removeAttribute(attr.name);
      }
    });

    // 移除data-*属性（除了允许的必要属性）
    Array.from(el.attributes).forEach((attr) => {
      if (attr.name.startsWith('data-') && !allowedDataAttributes.includes(attr.name)) {
        el.removeAttribute(attr.name);
      }
    });
  });
}

/**
 * 将相对URL转换为绝对URL
 * @param url - 原始URL
 * @returns 绝对URL字符串
 */
function toAbsoluteUrl(url: string): string {
  if (url.startsWith('http') || url.startsWith('#')) {
    return url;
  }

  return new URL(url, window.location.origin).href;
}

/**
 * 处理图片URL，转换为绝对路径并移除不必要的属性
 * @param container - HTML容器元素
 * @param attributesToRemove - 需要移除的图片属性列表
 */
export function processImages(
  container: HTMLElement,
  attributesToRemove: string[] = ['loading', 'decoding'],
): void {
  const images = container.querySelectorAll('img');
  images.forEach((img) => {
    const src = img.getAttribute('src');

    if (src) {
      img.setAttribute('src', toAbsoluteUrl(src));
    }

    // 移除不必要的属性
    attributesToRemove.forEach((attr) => img.removeAttribute(attr));
  });
}

/**
 * 处理链接URL，确保使用绝对路径
 * @param container - HTML容器元素
 */
export function processLinks(container: HTMLElement): void {
  const links = container.querySelectorAll('a');
  links.forEach((link) => {
    const href = link.getAttribute('href');

    if (href) {
      link.setAttribute('href', toAbsoluteUrl(href));
    }
  });
}

// 导出文档为PDF
export const handleExportPDF = async (name: string) => {
  let toastId: string | number | null = null;
  let timeoutId: NodeJS.Timeout | null = null;

  try {
    // 1. 获取编辑器元素
    const editorSelectors = [
      '.prose-container .ProseMirror',
      '.ProseMirror',
      '#editor',
      '[contenteditable="true"]',
    ];

    let element: HTMLElement | null = null;

    for (const selector of editorSelectors) {
      element = document.querySelector(selector) as HTMLElement;
      if (element) break;
    }

    if (!element) throw new Error('找不到可导出的文档内容');

    // 2. 开启 Loading
    toastId = toast.loading('正在利用 snapdom 生成高清文档...');

    // 3. 超时处理 (60秒)
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error('PDF 生成超时')), 60000);
    });

    // 4. 核心生成逻辑
    const pdfPromise = (async () => {
      // 预留 UI 渲染时间
      await new Promise((resolve) => setTimeout(resolve, 150));

      // 使用 snapdom 将 DOM 转为 Canvas
      // snapdom 在处理现代 CSS (如 Gap, Flex) 时表现通常优于 html2canvas
      const canvas = await snapdom.toCanvas(element, {
        filter: (node) => {
          // 可以在这里过滤不需要导出的 DOM 节点（如悬浮按钮）
          return (node as HTMLElement).tagName !== 'BUTTON';
        },
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);

      // 创建 jsPDF 实例: A4 纸张, 单位 mm
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // 计算图片在 PDF 中的宽高
      // 宽度撑满 A4 (考虑到 margin 10mm，宽度设为 pdfWidth - 20)
      const margin = 10;
      const contentWidth = pdfWidth - margin * 2;
      const contentHeight = (canvas.height * contentWidth) / canvas.width;

      let heightLeft = contentHeight;
      let position = margin; // 初始 Y 轴位置

      // --- 分页算法 ---
      // 第一页
      pdf.addImage(imgData, 'JPEG', margin, position, contentWidth, contentHeight);
      heightLeft -= pdfHeight;

      // 如果高度超过一页，循环切片
      while (heightLeft > 0) {
        position = heightLeft - contentHeight + margin; // 向上偏移图片
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', margin, position, contentWidth, contentHeight);
        heightLeft -= pdfHeight;
      }

      const fileName = `${name || 'document'}_${new Date().getTime()}.pdf`;
      pdf.save(fileName);
    })();

    // 5. 竞速
    await Promise.race([pdfPromise, timeoutPromise]);

    if (timeoutId) clearTimeout(timeoutId);
    toast.success('PDF 导出成功', { id: toastId });
  } catch (error: any) {
    if (timeoutId) clearTimeout(timeoutId);
    console.error('PDF Export Error:', error);

    const msg = error.message || '导出失败';

    if (toastId) {
      toast.error(msg, { id: toastId });
    } else {
      toast.error(msg);
    }
  }
};

// 下载 docx
export const handleExportDOCX = async (name: string, editor: Editor) => {
  try {
    if (!editor) {
      toast.warning('请先打开文档后再导出DOCX');

      return;
    }

    const json = editor.getJSON();
    console.log('🚀 ~ file: wx.ts:309 ~ json:', json);

    if (!json?.content?.length) {
      toast.warning('文档内容为空');

      return;
    }

    const docx = await generateDOCX(
      {
        type: 'doc',
        content: json.content.map((item: any) => {
          if (['textToImage', 'imageBlock'].includes(item.type)) {
            return {
              attrs: {
                ...item.attrs,
                src: item.attrs?.src ? item.attrs?.src : item.attrs?.imageUrl,
              },
              type: 'image',
            };
          }

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

    // 将Node.js Buffer转换为浏览器兼容的Blob并下载
    const blob = new Blob([new Uint8Array(docx)], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });

    const sanitizedName = name.trim().replace(/\s+/g, '_');
    const fileName = `${sanitizedName}.docx`;

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
};
