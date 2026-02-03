declare module '@antv/hierarchy' {
  interface HierarchyOptions {
    direction?: string;
    getHeight?: () => number;
    getWidth?: () => number;
    getHGap?: () => number;
    getVGap?: () => number;
    getSide?: () => string;
  }

  interface HierarchyNode {
    id: number;
    x: number;
    y: number;
    children?: HierarchyNode[];
    data?: any;
  }

  const Hierarchy: {
    mindmap: (data: any, options: HierarchyOptions) => HierarchyNode;
  };

  export default Hierarchy;
}
