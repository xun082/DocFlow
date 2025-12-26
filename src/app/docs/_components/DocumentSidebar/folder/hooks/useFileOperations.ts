import { toast } from 'sonner';
import { useState } from 'react';

import { FileItem } from '../type';

import { generateDOCX } from '@/utils/export-doc/generator';
import DocumentApi from '@/services/document';
import { CreateDocumentDto } from '@/services/document/type';
import { useEditorStore } from '@/stores/editorStore';

interface UseFileOperationsReturn {
  handleShare: (file: FileItem) => void;
  handleDownload: (file: FileItem) => Promise<void>;
  handleDuplicate: (file: FileItem) => Promise<void>;
  handleDelete: (file: FileItem) => Promise<void>;
  handleRename: (fileId: string, newName: string) => Promise<void>;
  handleCreate: (name: string, type: 'file' | 'folder', parentId?: string) => Promise<boolean>;
  showDeleteDialog: boolean;
  fileToDelete: FileItem | null;
  confirmDelete: () => Promise<void>;
  cancelDelete: () => void;
  handleExportPDF: (file: FileItem) => Promise<void>;
  handleExportDOCX: (file: FileItem) => void;
}

export const useFileOperations = (refreshFiles: () => Promise<void>): UseFileOperationsReturn => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<FileItem | null>(null);
  const { editor, documentId } = useEditorStore();

  // 处理文件分享
  const handleShare = (file: FileItem) => {
    // 这个会在主组件中处理，因为涉及到状态管理
    console.log('Share file:', file);
  };

  // 处理文件下载
  const handleDownload = async (file: FileItem) => {
    try {
      const response = await DocumentApi.DownloadDocument(parseInt(file.id));

      if (response?.data?.data) {
        // 创建下载链接
        const blob = response.data.data as unknown as Blob;
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        toast.success(`文件 "${file.name}" 下载成功`);
      }
    } catch (error) {
      console.error('下载文件失败:', error);
      toast.error('下载文件失败，请重试');
    }
  };

  // 处理文件复制
  const handleDuplicate = async (file: FileItem) => {
    try {
      const response = await DocumentApi.DuplicateDocument({
        document_id: parseInt(file.id),
        title: `${file.name} - 副本`,
      });

      if (response?.data?.code === 201) {
        // 刷新文件列表
        await refreshFiles();
        toast.success(`文件 "${file.name}" 已复制`);
      }
    } catch (error) {
      console.error('复制文件失败:', error);
      toast.error('复制文件失败，请重试');
    }
  };

  // 处理文件删除
  const handleDelete = (file: FileItem) => {
    setFileToDelete(file);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!fileToDelete) return;

    try {
      setShowDeleteDialog(false);

      const fileName = fileToDelete.name;
      const response = await DocumentApi.DeleteDocument({
        document_id: parseInt(fileToDelete.id),
        permanent: false, // 软删除
      });

      if (response?.data?.code === 200) {
        toast.success(`文件 "${fileName}" 已删除`);
        // 先清空状态，再刷新列表
        setFileToDelete(null);
        await refreshFiles();
      } else {
        toast.error('删除文件失败，请重试');
      }
    } catch (error) {
      console.error('删除文件失败:', error);
      toast.error('删除文件失败，请重试');
      setShowDeleteDialog(true);
    }
  };

  const cancelDelete = () => {
    setShowDeleteDialog(false);
    setFileToDelete(null);
  };

  // 处理文件重命名
  const handleRename = async (fileId: string, newName: string) => {
    try {
      const response = await DocumentApi.RenameDocument({
        document_id: parseInt(fileId),
        title: newName.trim(),
      });

      if (response?.data?.code === 200) {
        // 刷新文件列表
        await refreshFiles();
        toast.success(`重命名成功`);
      }
    } catch (error) {
      console.error('重命名失败:', error);
      toast.error('重命名失败，请重试');
    }
  };

  // 处理文件创建
  const handleCreate = async (name: string, type: 'file' | 'folder', parentId?: string) => {
    try {
      const createParams: CreateDocumentDto = {
        title: name.trim(),
        type: type === 'folder' ? 'FOLDER' : 'FILE',
        sort_order: 0,
        is_starred: false,
      };

      if (parentId && parentId !== 'root') {
        createParams.parent_id = parseInt(parentId);
      }

      const response = await DocumentApi.CreateDocument(createParams);

      if (response?.data?.code === 200) {
        // 刷新文件列表
        await refreshFiles();
        toast.success(`${type === 'folder' ? '文件夹' : '文件'} "${name}" 创建成功`);

        return true;
      }

      if (response?.data?.code === 201) {
        // 刷新文件列表
        await refreshFiles();
        toast.success(`${type === 'folder' ? '文件夹' : '文件'} "${name}" 已创建`);

        return true;
      }

      return false;
    } catch (error) {
      console.error('创建失败:', error);
      toast.error(`创建${type === 'folder' ? '文件夹' : '文件'}失败，请重试`);

      return false;
    }
  };

  // 处理文件导出pdf
  const handleExportPDF = async (file: FileItem) => {
    try {
      // 获取编辑器内容 - 尝试多个可能的选择器
      const editorSelectors = [
        '.prose-container .ProseMirror',
        '.ProseMirror',
        '[contenteditable="true"]',
        '.editor',
        '#editor',
      ];

      let editorElement: HTMLElement | null = null;

      for (const selector of editorSelectors) {
        editorElement = document.querySelector(selector) as HTMLElement;
        if (editorElement) break;
      }

      if (!editorElement) {
        throw new Error('找不到编辑器内容，请确保页面有可编辑的文档内容');
      }

      const title = file.name || '文档';

      try {
        const html2pdf = (await import('html2pdf.js')).default;

        // 简单的PDF配置
        const options = {
          filename: `${title}_${new Date().toISOString().split('T')[0]}.pdf`,
          margin: 10,
          image: { type: 'jpeg' as const, quality: 0.98 },
          html2canvas: { scale: 4 },
          jsPDF: { unit: 'mm', format: 'a4' },
          pagebreak: { mode: 'avoid-all' },
        };

        // 生成并保存PDF
        await html2pdf().set(options).from(editorElement).save();

        toast.success(`PDF文档 "${title}.pdf" 已下载`);
      } catch (pdfError) {
        console.error('PDF生成失败:', pdfError);
        toast('PDF生成失败，请重试');
      } finally {
      }
    } catch (error) {
      console.error('导出PDF失败:', error);
      toast('无法获取文档内容');
    }
  };

  // 下载 docx
  const handleExportDOCX = async (file: FileItem) => {
    try {
      if (!editor) {
        toast.warning('请先打开文档后再导出DOCX');

        return;
      }

      if (documentId !== file.id.toString()) {
        toast.warning('请先打开该文档后再导出DOCX');

        return;
      }

      const json = editor.getJSON();
      console.log('🚀 ~ file: useFileOperations.ts:248 ~ json:', json);

      const docx = await generateDOCX(
        {
          type: 'doc',
          content: json.content.map((item) => {
            if (['textToImage', 'imageBlock'].includes(item.type)) {
              return {
                attrs: {
                  ...item.attrs,
                  src: item.attrs?.src ? item.attrs?.src : item.attrs?.imageUrl,
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

      const sanitizedName = file.name.trim().replace(/\s+/g, '_');
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

  return {
    handleShare,
    handleDownload,
    handleDuplicate,
    handleDelete: async (file: FileItem) => {
      handleDelete(file);

      return new Promise<void>((resolve) => {
        // 这个 Promise 会在 confirmDelete 或 cancelDelete 中被处理
        resolve();
      });
    },
    handleRename,
    handleCreate,
    showDeleteDialog,
    fileToDelete,
    confirmDelete,
    cancelDelete,
    handleExportPDF,
    handleExportDOCX,
  };
};
