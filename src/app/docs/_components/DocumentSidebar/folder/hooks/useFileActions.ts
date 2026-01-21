import { useFileStore } from '@/stores/fileStore';

export const useFileActions = () => {
  const {
    expandedFolders,
    setExpandedFolders,
    setNewItemFolder,
    setNewItemType,
    setNewItemName,
    setNewItemGroupId,
    finishCreateNewItem,
    cancelCreateNewItem,
  } = useFileStore();

  const startCreateNewItem = (folderId: string, type: 'file' | 'folder', groupId?: string) => {
    // 确保文件夹是展开的
    if (!expandedFolders[folderId]) {
      setExpandedFolders({
        ...expandedFolders,
        [folderId]: true,
      });
    }

    setNewItemFolder(folderId);
    setNewItemType(type);
    setNewItemName('');

    if (groupId) {
      setNewItemGroupId(groupId);
    }
  };

  return {
    startCreateNewItem,
    finishCreateNewItem,
    cancelCreateNewItem,
    setNewItemName,
  };
};
