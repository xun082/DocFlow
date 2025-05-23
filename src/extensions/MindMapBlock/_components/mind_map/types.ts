// 思维导图相关类型定义
export interface MindMapNode {
  id: number;
  label: string;
  children?: MindMapNode[];
}

export interface HierarchyResult {
  id: number;
  x: number;
  y: number;
  children?: HierarchyResult[];
  data?: MindMapNode;
}

export interface MindMapProps {
  data: MindMapNode;
}
