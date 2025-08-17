// 文件/文件夹类型
export type FileItem = {
  id: string;
  name: string;
  type: 'file' | 'folder';
  parentId?: string | null; // 标记父级id
  collapsed?: boolean; // 默认为false 只有文件夹且文件夹折叠才为true
  index?: number; // dndSort要求的显示顺序
  order?: any;
  children?: FileItem[]; // 子节点
  depth: number; // 缩进层级
  is_starred?: boolean;
  created_at?: string;
  updated_at?: string;
};

// 搜索结果项
export type SearchResultItem = {
  item: FileItem;
  path: string[];
  ancestors: string[];
};

export interface FileExplorerProps {
  initialFiles?: FileItem[];
  onFileSelect?: (file: FileItem) => void;
}
