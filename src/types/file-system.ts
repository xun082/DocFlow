/**
 * File system types
 */

/**
 * File/Folder item type
 */
export type FileItem = {
  id: string;
  name: string;
  type: 'file' | 'folder';
  parentId?: string | null; // Parent ID
  collapsed?: boolean; // Default false, only true when folder is collapsed
  index?: number; // Display order required by dndSort
  order?: any;
  children?: FileItem[]; // Child nodes
  depth: number; // Indentation level
  is_starred?: boolean;
  created_at?: string;
  updated_at?: string;
};

/**
 * Search result item
 */
export type SearchResultItem = {
  item: FileItem;
  path: string[];
  ancestors: string[];
};

/**
 * File explorer props
 */
export interface FileExplorerProps {
  initialFiles?: FileItem[];
  onFileSelect?: (file: FileItem) => void;
}
