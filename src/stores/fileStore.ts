import { create } from 'zustand';

import { FileItem } from '@/app/docs/_components/DocumentSidebar/folder/type';
import DocumentApi from '@/services/document';
import { DocumentResponse } from '@/services/document/type';

interface FileState {
  // 文件状态
  files: FileItem[];
  expandedFolders: Record<string, boolean>;
  selectedFileId: string | null;

  // UI 状态
  isRenaming: string | null;
  newItemFolder: string | null;
  newItemType: 'file' | 'folder' | null;
  newItemName: string;

  // 分享状态
  shareDialogOpen: boolean;
  shareDialogFile: FileItem | null;
  sharedDocsExpanded: boolean;

  // Actions
  setFiles: (files: FileItem[]) => void;
  setExpandedFolders: (folders: Record<string, boolean>) => void;
  setSelectedFileId: (id: string | null) => void;
  toggleFolder: (folderId: string) => void;
  collapseAll: () => void;

  // UI Actions
  setIsRenaming: (id: string | null) => void;
  setNewItemFolder: (id: string | null) => void;
  setNewItemType: (type: 'file' | 'folder' | null) => void;
  setNewItemName: (name: string) => void;

  // 分享 Actions
  setShareDialogOpen: (open: boolean) => void;
  setShareDialogFile: (file: FileItem | null) => void;
  setSharedDocsExpanded: (expanded: boolean) => void;

  // 文件操作
  loadFiles: (isInitialLoad?: boolean) => Promise<void>;
  processApiDocuments: (documents: DocumentResponse['owned']) => FileItem[];
  createNewItem: (name: string, type: 'file' | 'folder', parentId?: string) => Promise<boolean>;
  finishCreateNewItem: () => Promise<void>;
  cancelCreateNewItem: () => void;
}

export const useFileStore = create<FileState>((set, get) => ({
  // 初始状态
  files: [],
  expandedFolders: {},
  selectedFileId: null,

  // UI 状态
  isRenaming: null,
  newItemFolder: null,
  newItemType: null,
  newItemName: '',

  // 分享状态
  shareDialogOpen: false,
  shareDialogFile: null,
  sharedDocsExpanded: false,

  // 基础 Actions
  setFiles: (files) => set({ files }),
  setExpandedFolders: (folders) => set({ expandedFolders: folders }),
  setSelectedFileId: (id) => set({ selectedFileId: id }),
  toggleFolder: (folderId) =>
    set((state) => ({
      expandedFolders: {
        ...state.expandedFolders,
        [folderId]: !state.expandedFolders[folderId],
      },
    })),
  collapseAll: () => set({ expandedFolders: {} }),

  // UI Actions
  setIsRenaming: (id) => set({ isRenaming: id }),
  setNewItemFolder: (id) => set({ newItemFolder: id }),
  setNewItemType: (type) => set({ newItemType: type }),
  setNewItemName: (name) => set({ newItemName: name }),

  // 分享 Actions
  setShareDialogOpen: (open) => set({ shareDialogOpen: open }),
  setShareDialogFile: (file) => set({ shareDialogFile: file }),
  setSharedDocsExpanded: (expanded) => set({ sharedDocsExpanded: expanded }),

  // 处理API返回的文档数据
  processApiDocuments: (documents) => {
    const docMap = new Map<number, DocumentResponse['owned'][0]>();
    documents.forEach((doc) => {
      if (!doc.is_deleted) {
        docMap.set(doc.id, doc);
      }
    });

    const result: FileItem[] = [];
    const childrenMap = new Map<number, FileItem[]>();

    docMap.forEach((doc) => {
      childrenMap.set(doc.id, []);
    });

    docMap.forEach((doc) => {
      const fileItem: FileItem = {
        id: String(doc.id),
        name: doc.title,
        type: doc.type === 'FOLDER' ? 'folder' : 'file',
        order: doc.sort_order,
        is_starred: doc.is_starred,
        created_at: doc.created_at,
        updated_at: doc.updated_at,
        depth: 0,
      };

      if (doc.type === 'FOLDER') {
        fileItem.children = childrenMap.get(doc.id) || [];
      }

      if (doc.parent_id === null) {
        result.push(fileItem);
      } else if (docMap.has(doc.parent_id)) {
        const parentChildren = childrenMap.get(doc.parent_id) || [];
        parentChildren.push(fileItem);
        childrenMap.set(doc.parent_id, parentChildren);
      }
    });

    // 递归设置深度
    const setDepthRecursively = (items: FileItem[], depth: number = 0) => {
      items.forEach((item) => {
        item.depth = depth;

        if (item.children && item.children.length > 0) {
          setDepthRecursively(item.children, depth + 1);
        }
      });
    };

    setDepthRecursively(result);

    return result;
  },

  // 加载文件列表
  loadFiles: async (isInitialLoad = false) => {
    const { selectedFileId, processApiDocuments, setFiles, setExpandedFolders, setSelectedFileId } =
      get();

    try {
      const res = await DocumentApi.GetDocument();

      if (res?.data?.code === 200 && res?.data?.data) {
        const documentResponse = res.data.data as DocumentResponse;
        const apiDocuments = documentResponse.owned || [];
        const convertedFiles = processApiDocuments(apiDocuments);
        setFiles(convertedFiles);

        if (!isInitialLoad && selectedFileId) {
          const findFileById = (items: FileItem[], id: string): boolean => {
            for (const item of items) {
              if (item.id === id) return true;
              if (item.children && findFileById(item.children, id)) return true;
            }

            return false;
          };

          if (!findFileById(convertedFiles, selectedFileId)) {
            setSelectedFileId(null);
          }
        }

        if (isInitialLoad && convertedFiles.length > 0) {
          const rootFolders = convertedFiles
            .filter((file) => file.type === 'folder')
            .map((folder) => folder.id);

          const initialExpanded: Record<string, boolean> = {};
          rootFolders.forEach((id) => {
            initialExpanded[id] = true;
          });

          setExpandedFolders(initialExpanded);
          setExpandedFolders(initialExpanded);
        }
      }
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    }
  },

  // 创建新文件/文件夹
  createNewItem: async (name, type, parentId) => {
    try {
      const res = await DocumentApi.CreateDocument({
        title: name,
        type: type === 'folder' ? 'FOLDER' : 'FILE',
        parent_id: parentId ? Number(parentId) : undefined,
      });

      if (res?.data?.code === 200) {
        // 创建成功后自动刷新文件列表
        await get().loadFiles(false);

        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to create item:', error);

      return false;
    }
  },

  // 完成创建新项目
  finishCreateNewItem: async () => {
    const {
      newItemName,
      newItemType,
      newItemFolder,
      createNewItem,
      setNewItemFolder,
      setNewItemType,
    } = get();

    if (!newItemFolder || !newItemType || !newItemName.trim()) {
      setNewItemFolder(null);
      setNewItemType(null);

      return;
    }

    const success = await createNewItem(
      newItemName,
      newItemType,
      newItemFolder === 'root' ? undefined : newItemFolder,
    );

    if (success) {
      setNewItemFolder(null);
      setNewItemType(null);
    }
  },

  // 取消创建新项目
  cancelCreateNewItem: () => {
    set({ newItemFolder: null, newItemType: null });
  },
}));
