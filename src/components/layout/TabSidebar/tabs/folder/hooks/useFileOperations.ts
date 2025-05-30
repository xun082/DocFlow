import { useCallback } from 'react';
import { toast } from 'sonner';

import { FileItem } from '../type';

import DocumentApi from '@/services/document';

interface UseFileOperationsReturn {
  handleShare: (file: FileItem) => void;
  handleDownload: (file: FileItem) => Promise<void>;
  handleDuplicate: (file: FileItem) => Promise<void>;
  handleDelete: (file: FileItem) => Promise<void>;
}

export const useFileOperations = (refreshFiles: () => Promise<void>): UseFileOperationsReturn => {
  // 处理文件分享
  const handleShare = useCallback((file: FileItem) => {
    // 这个会在主组件中处理，因为涉及到状态管理
    console.log('Share file:', file);
  }, []);

  // 处理文件下载
  const handleDownload = useCallback(async (file: FileItem) => {
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
  }, []);

  // 处理文件复制
  const handleDuplicate = useCallback(
    async (file: FileItem) => {
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
    },
    [refreshFiles],
  );

  // 处理文件删除
  const handleDelete = useCallback(
    async (file: FileItem) => {
      if (confirm(`确定要删除 "${file.name}" 吗？`)) {
        try {
          const response = await DocumentApi.DeleteDocument({
            document_id: parseInt(file.id),
            permanent: false, // 软删除
          });

          if (response?.data?.data?.success) {
            // 刷新文件列表
            await refreshFiles();
            toast.success(`文件 "${file.name}" 已删除`);
          }
        } catch (error) {
          console.error('删除文件失败:', error);
          toast.error('删除文件失败，请重试');
        }
      }
    },
    [refreshFiles],
  );

  return {
    handleShare,
    handleDownload,
    handleDuplicate,
    handleDelete,
  };
};
