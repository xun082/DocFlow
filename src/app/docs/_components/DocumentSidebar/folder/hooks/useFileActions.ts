import { useFileStore } from '@/stores/fileStore';

export const useFileActions = () => {
  const {
    setNewItemFolder,
    setNewItemType,
    setNewItemName,
    setNewItemGroupId,
    finishCreateNewItem,
    cancelCreateNewItem,
  } = useFileStore();

  const startCreateNewItem = (folderId: string, type: 'file' | 'folder', groupId?: string) => {
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
