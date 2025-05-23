// 文件/文件夹类型
export type FileItem = {
  id: string;
  name: string;
  type: 'file' | 'folder';
  children?: FileItem[];
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
