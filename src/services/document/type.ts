interface DocumentItem {
  id: number;
  title: string;
  type: 'FILE' | 'FOLDER';
  sort_order: number;
  is_starred: boolean;
  is_deleted: boolean;
  created_at: string; // ISO 日期字符串，可根据需要改为 Date 类型
  updated_at: string;
  last_viewed: string | null;
  version: number;
  parent_id: number | null;
  owner_id: number;
}

// 返回结构类型
export interface DocumentResponse {
  owned: DocumentItem[];
  shared: DocumentItem[];
}

export interface CreateDocumentDto {
  title: string;
  type: 'FILE' | 'FOLDER';
  parent_id?: number;
  sort_order?: number;
  is_starred?: boolean;
  space_id?: number;
}
