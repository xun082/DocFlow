import { toast } from 'sonner';
import { useState } from 'react';

import { FileItem } from '../type';

import DocumentApi from '@/services/document';
import { CreateDocumentDto } from '@/services/document/type';

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
}

export const useFileOperations = (refreshFiles: () => Promise<void>): UseFileOperationsReturn => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<FileItem | null>(null);

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
  };
};
