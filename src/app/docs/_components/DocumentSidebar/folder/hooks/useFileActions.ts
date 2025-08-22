import { useFileStore } from '@/stores/fileStore';

export const useFileActions = () => {
  const {
    setNewItemFolder,
    setNewItemType,
    setNewItemName,
    finishCreateNewItem,
    cancelCreateNewItem,
  } = useFileStore();

  const startCreateNewItem = (folderId: string, type: 'file' | 'folder') => {
    setNewItemFolder(folderId);
    setNewItemType(type);
    setNewItemName('');
  };

  return {
    startCreateNewItem,
    finishCreateNewItem,
    cancelCreateNewItem,
    setNewItemName,
  };
};
