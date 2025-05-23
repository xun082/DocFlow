'use client';

import { useEffect, useRef, useState } from 'react';
import { Graph, Model } from '@antv/x6';
import Hierarchy from '@antv/hierarchy';

import { MindMapProps, HierarchyResult, MindMapNode } from './types';

export default function MindMap({ data }: MindMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<Graph | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!containerRef.current || !data) return;

    // 清理之前的图表
    if (graphRef.current) {
      graphRef.current.dispose();
    }

    // 获取容器尺寸
    const containerRect = containerRef.current.getBoundingClientRect();
    const width = Math.max(containerRect.width, 1000);
    const height = Math.max(containerRect.height, 600);

    // 创建新的图表实例
    const graph = new Graph({
      container: containerRef.current,
      width: width,
      height: height,
      background: {
        color: '#fafbfc',
      },
      grid: {
        visible: true,
        type: 'doubleMesh',
        args: [
          {
            color: '#f0f2f5',
            thickness: 1,
          },
          {
            color: '#e8eaed',
            thickness: 1,
            factor: 4,
          },
        ],
      },
      panning: {
        enabled: true,
        eventTypes: ['leftMouseDown', 'mouseWheel'],
      },
      mousewheel: {
        enabled: true,
        modifiers: ['ctrl', 'meta'],
        factor: 1.1,
        maxScale: 3,
        minScale: 0.3,
      },
      connecting: {
        anchor: 'center',
        connectionPoint: 'boundary',
        connector: {
          name: 'smooth',
          args: {
            direction: 'H',
          },
        },
      },
    });

    graphRef.current = graph;

    try {
      // 使用 mindmap 布局处理数据
      const result = Hierarchy.mindmap(data, {
        direction: 'LR',
        getHeight: () => 50,
        getWidth: () => 150,
        getHGap: () => 120,
        getVGap: () => 30,
        getSide: () => 'right',
      });

      // 创建节点和边的数据
      const model: Model.FromJSONData = { nodes: [], edges: [] };

      // 定义美观的颜色方案
      const colorSchemes = [
        {
          // 根节点 - 深蓝渐变
          gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          shadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
          textColor: '#ffffff',
        },
        {
          // 二级节点 - 绿色渐变
          gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
          shadow: '0 6px 24px rgba(168, 237, 234, 0.3)',
          textColor: '#2d3748',
        },
        {
          // 三级节点 - 橙色渐变
          gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
          shadow: '0 4px 16px rgba(252, 182, 159, 0.3)',
          textColor: '#2d3748',
        },
      ];

      const traverse = (node: HierarchyResult, depth: number = 0) => {
        if (!node) return;

        const nodeData = node.data || ({ label: `节点${node.id}` } as MindMapNode);
        const label = nodeData.label || `节点${node.id}`;

        // 根据层级设置样式
        const isRoot = depth === 0;
        const colorScheme = colorSchemes[Math.min(depth, colorSchemes.length - 1)];

        let nodeWidth: number;
        let nodeHeight: number;
        let fontSize: number;

        if (isRoot) {
          nodeWidth = 180;
          nodeHeight = 60;
          fontSize = 16;
        } else if (depth === 1) {
          nodeWidth = 140;
          nodeHeight = 50;
          fontSize = 14;
        } else {
          nodeWidth = 120;
          nodeHeight = 40;
          fontSize = 12;
        }

        // 调整节点位置，确保居中显示
        const adjustedX = node.x + width / 2 - 300;
        const adjustedY = node.y + height / 2;

        // 创建自定义节点样式
        model.nodes?.push({
          id: `${node.id}`,
          x: adjustedX,
          y: adjustedY,
          width: nodeWidth,
          height: nodeHeight,
          shape: 'rect',
          label: label,
          // 设置连接锚点
          ports: {
            groups: {
              left: {
                position: 'left',
                attrs: {
                  circle: {
                    r: 3,
                    magnet: true,
                    stroke: '#31d0c6',
                    strokeWidth: 2,
                    fill: '#fff',
                  },
                },
              },
              right: {
                position: 'right',
                attrs: {
                  circle: {
                    r: 3,
                    magnet: true,
                    stroke: '#31d0c6',
                    strokeWidth: 2,
                    fill: '#fff',
                  },
                },
              },
            },
          },
          attrs: {
            body: {
              fill: {
                type: 'linearGradient',
                stops: [
                  {
                    offset: '0%',
                    color: colorScheme.gradient.includes('667eea')
                      ? '#667eea'
                      : colorScheme.gradient.includes('a8edea')
                        ? '#a8edea'
                        : '#ffecd2',
                  },
                  {
                    offset: '100%',
                    color: colorScheme.gradient.includes('764ba2')
                      ? '#764ba2'
                      : colorScheme.gradient.includes('fed6e3')
                        ? '#fed6e3'
                        : '#fcb69f',
                  },
                ],
                attrs: { x1: '0%', y1: '0%', x2: '100%', y2: '100%' },
              },
              stroke: 'rgba(255, 255, 255, 0.8)',
              strokeWidth: 2,
              rx: nodeHeight / 2,
              ry: nodeHeight / 2,
              filter: {
                name: 'dropShadow',
                args: {
                  dx: 0,
                  dy: 4,
                  blur: 8,
                  color: 'rgba(0, 0, 0, 0.15)',
                },
              },
            },
            label: {
              fill: colorScheme.textColor,
              fontSize: fontSize,
              fontWeight: isRoot ? 'bold' : '600',
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
              textAnchor: 'middle',
              textVerticalAnchor: 'middle',
              textWrap: {
                width: nodeWidth - 20,
                height: nodeHeight - 10,
                ellipsis: true,
              },
            },
          },
        });

        // 创建美观的连接线
        if (node.children) {
          node.children.forEach((child: HierarchyResult) => {
            model.edges?.push({
              source: {
                cell: `${node.id}`,
                anchor: {
                  name: 'right',
                  args: {
                    dx: 0,
                    dy: 0,
                  },
                },
                connectionPoint: {
                  name: 'boundary',
                  args: {
                    sticky: true,
                  },
                },
              },
              target: {
                cell: `${child.id}`,
                anchor: {
                  name: 'left',
                  args: {
                    dx: 0,
                    dy: 0,
                  },
                },
                connectionPoint: {
                  name: 'boundary',
                  args: {
                    sticky: true,
                  },
                },
              },
              attrs: {
                line: {
                  stroke: {
                    type: 'linearGradient',
                    stops: [
                      { offset: '0%', color: '#e2e8f0' },
                      { offset: '100%', color: '#cbd5e0' },
                    ],
                  },
                  strokeWidth: 3,
                  strokeDasharray: '0',
                  sourceMarker: null,
                  targetMarker: {
                    name: 'classic',
                    size: 8,
                    fill: '#94a3b8',
                    stroke: '#94a3b8',
                  },
                },
              },
              connector: {
                name: 'smooth',
                args: {
                  direction: 'H',
                  curvature: 0.3,
                },
              },
            });
            traverse(child, depth + 1);
          });
        }
      };

      traverse(result);

      // 渲染图表
      graph.fromJSON(model);

      // 添加节点交互效果 - 修复TypeScript错误
      graph.on('node:mouseenter', ({ node }) => {
        const currentBodyAttrs = node.attr('body') as Record<string, unknown>;
        node.attr('body', {
          ...currentBodyAttrs,
          filter: {
            name: 'dropShadow',
            args: {
              dx: 0,
              dy: 6,
              blur: 12,
              color: 'rgba(0, 0, 0, 0.25)',
            },
          },
        });
        node.toFront();
      });

      graph.on('node:mouseleave', ({ node }) => {
        const currentBodyAttrs = node.attr('body') as Record<string, unknown>;
        node.attr('body', {
          ...currentBodyAttrs,
          filter: {
            name: 'dropShadow',
            args: {
              dx: 0,
              dy: 4,
              blur: 8,
              color: 'rgba(0, 0, 0, 0.15)',
            },
          },
        });
      });

      // 延迟调整视图，确保渲染完成
      setTimeout(() => {
        graph.centerContent();
        graph.zoomToFit({ padding: 80, maxScale: 1.2 });
        setIsLoading(false);
      }, 300);
    } catch (error) {
      console.error('渲染思维导图时出错:', error);
      setIsLoading(false);
    }

    // 监听窗口大小变化
    const handleResize = () => {
      if (containerRef.current && graphRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        graphRef.current.resize(rect.width, rect.height);
        setTimeout(() => {
          graphRef.current?.centerContent();
        }, 100);
      }
    };

    window.addEventListener('resize', handleResize);

    // 清理函数
    return () => {
      window.removeEventListener('resize', handleResize);

      if (graphRef.current) {
        graphRef.current.dispose();
        graphRef.current = null;
      }
    };
  }, [data]);

  return (
    <div className="w-full h-full relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 bg-opacity-90 z-10 rounded-lg">
          <div className="flex flex-col items-center space-y-3">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <div className="text-lg text-gray-700 font-medium">生成思维导图中...</div>
          </div>
        </div>
      )}
      <div
        ref={containerRef}
        className="w-full h-full min-h-[600px] border-2 border-gray-200 rounded-xl shadow-lg bg-gradient-to-br from-gray-50 to-white"
        style={{ cursor: 'grab' }}
      />
      <div className="mt-3 text-sm text-gray-500 text-center bg-white bg-opacity-80 rounded-lg p-2">
        <div className="flex items-center justify-center space-x-4">
          <span className="flex items-center">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
            拖拽移动视图
          </span>
          <span className="flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            Ctrl/Cmd + 滚轮缩放
          </span>
        </div>
      </div>
    </div>
  );
}
