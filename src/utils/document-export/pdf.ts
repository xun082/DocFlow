/**
 * PDF export utilities
 */

import { toast } from 'sonner';
import { jsPDF } from 'jspdf';
import { snapdom } from '@zumer/snapdom';

/**
 * Export document as PDF
 * @param name - Document name for file
 */
export async function handleExportPDF(name: string): Promise<void> {
  let toastId: string | number | null = null;
  let timeoutId: NodeJS.Timeout | null = null;

  try {
    // Find editor element
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

    if (!element) {
      throw new Error('找不到可导出的文档内容');
    }

    // Show loading toast
    toastId = toast.loading('正在利用 snapdom 生成高清文档...');

    // Timeout after 60 seconds
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error('PDF 生成超时')), 60000);
    });

    // Core generation logic
    const pdfPromise = (async () => {
      // Allow UI to render
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Convert DOM to canvas using snapdom
      const canvas = await snapdom.toCanvas(element, {
        filter: (node) => {
          return (node as HTMLElement).tagName !== 'BUTTON';
        },
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);

      // Create PDF with A4 dimensions
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Calculate image dimensions
      const margin = 10;
      const contentWidth = pdfWidth - margin * 2;
      const contentHeight = (canvas.height * contentWidth) / canvas.width;

      let heightLeft = contentHeight;
      let position = margin;

      // Add pages as needed
      pdf.addImage(imgData, 'JPEG', margin, position, contentWidth, contentHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - contentHeight + margin;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', margin, position, contentWidth, contentHeight);
        heightLeft -= pdfHeight;
      }

      const fileName = `${name || 'document'}_${new Date().getTime()}.pdf`;
      pdf.save(fileName);
    })();

    // Race between generation and timeout
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
}
