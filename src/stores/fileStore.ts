import { create } from 'zustand';

import type { FileItem } from '@/types/file-system';
import DocumentApi from '@/services/document';
import { DocumentItem, OrganizationDocumentGroup } from '@/services/document/type';

export interface DocumentGroup {
  id: string;
  name: string;
  type: 'personal' | 'organization' | 'shared';
  files: FileItem[];
  organizationId?: number;
}

interface FileState {
  // 文件状态 - 分组数据
  documentGroups: DocumentGroup[];
  expandedFolders: Record<string, boolean>;
  expandedGroups: Record<string, boolean>; // 分组折叠状态
  selectedFileId: string | null;
  isLoading: boolean;

  // UI 状态
  isRenaming: string | null;
  newItemFolder: string | null;
  newItemType: 'file' | 'folder' | null;
  newItemName: string;
  newItemGroupId: string | null; // 新建项目所属的分组

  // 分享状态
  shareDialogOpen: boolean;
  shareDialogFile: FileItem | null;

  // Actions
  setDocumentGroups: (groups: DocumentGroup[]) => void;
  setExpandedFolders: (folders: Record<string, boolean>) => void;
  setExpandedGroups: (groups: Record<string, boolean>) => void;
  setSelectedFileId: (id: string | null) => void;
  setIsLoading: (loading: boolean) => void;
  toggleFolder: (folderId: string) => void;
  toggleGroup: (groupId: string) => void;
  collapseAll: () => void;

  // UI Actions
  setIsRenaming: (id: string | null) => void;
  setNewItemFolder: (id: string | null) => void;
  setNewItemType: (type: 'file' | 'folder' | null) => void;
  setNewItemName: (name: string) => void;
  setNewItemGroupId: (groupId: string | null) => void;

  // 分享 Actions
  setShareDialogOpen: (open: boolean) => void;
  setShareDialogFile: (file: FileItem | null) => void;

  // 文件操作
  loadFiles: (isInitialLoad?: boolean) => Promise<void>;
  processApiDocuments: (documents: DocumentItem[]) => FileItem[];
  createNewItem: (
    name: string,
    type: 'file' | 'folder',
    parentId?: string,
    groupId?: string,
  ) => Promise<boolean>;
  finishCreateNewItem: () => Promise<void>;
  cancelCreateNewItem: () => void;
}

export const useFileStore = create<FileState>((set, get) => ({
  // 初始状态
  documentGroups: [],
  expandedFolders: {},
  expandedGroups: {
    personal: true,
    shared: true,
  },
  selectedFileId: null,
  isLoading: true,

  // UI 状态
  isRenaming: null,
  newItemFolder: null,
  newItemType: null,
  newItemName: '',
  newItemGroupId: null,

  // 分享状态
  shareDialogOpen: false,
  shareDialogFile: null,

  // 基础 Actions
  setDocumentGroups: (groups) => set({ documentGroups: groups }),
  setExpandedFolders: (folders) => set({ expandedFolders: folders }),
  setExpandedGroups: (groups) => set({ expandedGroups: groups }),
  setSelectedFileId: (id) => set({ selectedFileId: id }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  toggleFolder: (folderId) =>
    set((state) => ({
      expandedFolders: {
        ...state.expandedFolders,
        [folderId]: !state.expandedFolders[folderId],
      },
    })),
  toggleGroup: (groupId) =>
    set((state) => ({
      expandedGroups: {
        ...state.expandedGroups,
        [groupId]: !state.expandedGroups[groupId],
      },
    })),
  collapseAll: () => set({ expandedFolders: {}, expandedGroups: {} }),

  // UI Actions
  setIsRenaming: (id) => set({ isRenaming: id }),
  setNewItemFolder: (id) => set({ newItemFolder: id }),
  setNewItemType: (type) => set({ newItemType: type }),
  setNewItemName: (name) => set({ newItemName: name }),
  setNewItemGroupId: (groupId) => set({ newItemGroupId: groupId }),

  // 分享 Actions
  setShareDialogOpen: (open) => set({ shareDialogOpen: open }),
  setShareDialogFile: (file) => set({ shareDialogFile: file }),

  // 处理API返回的文档数据
  processApiDocuments: (documents) => {
    const docMap = new Map<number, DocumentItem>();
    documents.forEach((doc) => {
      docMap.set(doc.id, doc);
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
    const {
      selectedFileId,
      processApiDocuments,
      setDocumentGroups,
      setExpandedFolders,
      setExpandedGroups,
      setSelectedFileId,
      setIsLoading,
    } = get();

    setIsLoading(true);

    const res = await DocumentApi.GetDocument();

    if (res?.data?.code === 200 && res?.data?.data) {
      const { personal, organizations, shared } = res.data.data;
      const groups: DocumentGroup[] = [];

      // 处理个人文档
      if (personal && personal.length > 0) {
        const personalFiles = processApiDocuments(personal);
        groups.push({
          id: 'personal',
          name: '个人文档',
          type: 'personal',
          files: personalFiles,
        });
      }

      // 处理组织文档
      if (organizations && organizations.length > 0) {
        organizations.forEach((org: OrganizationDocumentGroup) => {
          if (org.documents && org.documents.length > 0) {
            const orgFiles = processApiDocuments(org.documents);
            groups.push({
              id: `org-${org.id}`,
              name: org.name,
              type: 'organization',
              files: orgFiles,
              organizationId: org.id,
            });
          }
        });
      }

      // 处理分享文档
      if (shared && shared.length > 0) {
        const sharedFiles = processApiDocuments(shared);
        groups.push({
          id: 'shared',
          name: '分享给我',
          type: 'shared',
          files: sharedFiles,
        });
      }

      setDocumentGroups(groups);

      // 检查选中的文件是否仍然存在
      if (!isInitialLoad && selectedFileId) {
        const findFileById = (items: FileItem[], id: string): boolean => {
          for (const item of items) {
            if (item.id === id) return true;
            if (item.children && findFileById(item.children, id)) return true;
          }

          return false;
        };

        let fileExists = false;

        for (const group of groups) {
          if (findFileById(group.files, selectedFileId)) {
            fileExists = true;
            break;
          }
        }

        if (!fileExists) {
          setSelectedFileId(null);
        }
      }

      // 初始化展开状态
      if (isInitialLoad) {
        const initialExpandedFolders: Record<string, boolean> = {};
        const initialExpandedGroups: Record<string, boolean> = {
          personal: true,
          shared: true,
        };

        groups.forEach((group) => {
          // 默认展开所有组
          initialExpandedGroups[group.id] = true;

          // 展开根级文件夹
          const rootFolders = group.files
            .filter((file) => file.type === 'folder')
            .map((folder) => folder.id);

          rootFolders.forEach((id) => {
            initialExpandedFolders[id] = true;
          });
        });

        setExpandedFolders(initialExpandedFolders);
        setExpandedGroups(initialExpandedGroups);
      }
    }

    setIsLoading(false);
  },

  // 创建新文件/文件夹
  createNewItem: async (name, type, parentId, groupId) => {
    const { documentGroups } = get();
    const group = documentGroups.find((g) => g.id === groupId);

    const payload: any = {
      title: name,
      type: type === 'folder' ? 'FOLDER' : 'FILE',
      parent_id: parentId ? Number(parentId) : undefined,
    };

    // 如果是组织文档，添加组织ID
    if (group?.type === 'organization' && group.organizationId) {
      payload.organization_id = group.organizationId;
    }

    const res = await DocumentApi.CreateDocument(payload);

    if (res?.data?.code === 200) {
      // 创建成功后自动刷新文件列表
      await get().loadFiles(false);

      return true;
    }

    return false;
  },

  // 完成创建新项目
  finishCreateNewItem: async () => {
    const {
      newItemName,
      newItemType,
      newItemFolder,
      newItemGroupId,
      createNewItem,
      setNewItemFolder,
      setNewItemType,
      setNewItemGroupId,
    } = get();

    if (!newItemFolder || !newItemType || !newItemName.trim() || !newItemGroupId) {
      setNewItemFolder(null);
      setNewItemType(null);
      setNewItemGroupId(null);

      return;
    }

    const success = await createNewItem(
      newItemName,
      newItemType,
      newItemFolder === 'root' ? undefined : newItemFolder,
      newItemGroupId,
    );

    if (success) {
      setNewItemFolder(null);
      setNewItemType(null);
      setNewItemGroupId(null);
    }
  },

  // 取消创建新项目
  cancelCreateNewItem: () => {
    set({ newItemFolder: null, newItemType: null, newItemGroupId: null });
  },
}));
