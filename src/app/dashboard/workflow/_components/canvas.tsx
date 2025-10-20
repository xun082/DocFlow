'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  BackgroundVariant,
  ConnectionMode,
  type Connection,
  type Edge,
  type Node,
  type ReactFlowInstance,
  type NodeChange,
  type EdgeChange,
} from 'reactflow';
import 'reactflow/dist/style.css';
import * as Y from 'yjs';
import { HocuspocusProvider } from '@hocuspocus/provider';

import CursorsLayer from './cursors-layer';

interface NodeData {
  label: string;
}

interface AwarenessState {
  cursor: { x: number; y: number } | null;
  color: string;
  clientId: number;
  name?: string;
}

interface CanvasProps {
  onNodesChange: (nodes: Node<NodeData>[]) => void;
  onEdgesChange: (edges: Edge[]) => void;
  onConnectionChange: (isConnected: boolean) => void;
  onOnlineUsersChange: (count: number) => void;
}

const generateRandomColor = () => {
  const colors = [
    '#FF6B6B',
    '#4ECDC4',
    '#45B7D1',
    '#FFA07A',
    '#98D8C8',
    '#F7DC6F',
    '#BB8FCE',
    '#85C1E2',
    '#F8B739',
    '#52B788',
    '#E63946',
    '#A8DADC',
    '#457B9D',
    '#F4A261',
    '#2A9D8F',
  ];

  return colors[Math.floor(Math.random() * colors.length)];
};

const generateRandomName = () => {
  const adjectives = ['快速的', '聪明的', '友好的', '酷炫的', '优雅的', '强大的'];
  const animals = ['狐狸', '熊猫', '老虎', '狮子', '猎豹', '海豚'];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const animal = animals[Math.floor(Math.random() * animals.length)];

  return `${adj}${animal}`;
};

const initialNodes: Node<NodeData>[] = [
  {
    id: '1',
    type: 'input',
    data: { label: '节点1' },
    position: { x: 250, y: 25 },
  },
  {
    id: '2',
    data: { label: '节点2' },
    position: { x: 100, y: 125 },
  },
  {
    id: '3',
    type: 'output',
    data: { label: '节点3' },
    position: { x: 250, y: 250 },
  },
];

export default function Canvas({
  onNodesChange: onNodesChangeProp,
  onEdgesChange: onEdgesChangeProp,
  onConnectionChange,
  onOnlineUsersChange,
}: CanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<NodeData>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [cursors, setCursors] = useState<Map<number, AwarenessState>>(new Map());
  const [isConnected, setIsConnected] = useState(false);

  const ydoc = useRef<Y.Doc | undefined>(undefined);
  const provider = useRef<HocuspocusProvider | undefined>(undefined);
  const flowRef = useRef<HTMLDivElement>(null);
  const userColor = useRef(generateRandomColor());
  const userName = useRef(generateRandomName());
  const reactFlowInstance = useRef<ReactFlowInstance<NodeData> | null>(null);

  // 通知父组件状态变化
  useEffect(() => {
    onNodesChangeProp(nodes);
  }, [nodes, onNodesChangeProp]);

  useEffect(() => {
    onEdgesChangeProp(edges);
  }, [edges, onEdgesChangeProp]);

  useEffect(() => {
    onConnectionChange(isConnected);
  }, [isConnected, onConnectionChange]);

  useEffect(() => {
    onOnlineUsersChange(cursors.size);
  }, [cursors.size, onOnlineUsersChange]);

  useEffect(() => {
    const doc = new Y.Doc();
    const hocusProvider = new HocuspocusProvider({
      url: 'wss://flow.codecrack.cn',
      name: 'flow-room',
      document: doc,
      onConnect: () => {
        console.log('✅ Hocuspocus connected');
        setIsConnected(true);
      },
      onDisconnect: () => {
        console.log('❌ Hocuspocus disconnected');
        setIsConnected(false);
      },
    });
    const nodesMap = doc.getMap('nodes');
    const edgesMap = doc.getMap('edges');

    ydoc.current = doc;
    provider.current = hocusProvider;

    // 等待 provider 完全初始化后再设置 awareness
    const setupAwareness = () => {
      if (hocusProvider.awareness) {
        const awareness = hocusProvider.awareness;

        // 设置初始状态
        awareness.setLocalState({
          cursor: null,
          color: userColor.current,
          clientId: awareness.clientID,
          name: userName.current,
        });

        console.log(
          '🎨 User:',
          userName.current,
          'Color:',
          userColor.current,
          'Client ID:',
          awareness.clientID,
        );

        // 监听 awareness 变化 - 实时更新，无防抖
        const updateCursors = () => {
          const states = awareness.getStates();
          const cursorsMap = new Map<number, AwarenessState>();

          states.forEach((state, clientId) => {
            if (state && typeof state === 'object' && 'cursor' in state) {
              cursorsMap.set(clientId, state as AwarenessState);
            }
          });

          setCursors(cursorsMap);
        };

        awareness.on('change', updateCursors);
        updateCursors(); // 立即更新一次
      }
    };

    // 延迟设置 awareness，确保连接已建立
    setTimeout(setupAwareness, 100);

    if (nodesMap.size === 0) {
      initialNodes.forEach((node) => {
        nodesMap.set(node.id, JSON.parse(JSON.stringify(node)));
      });
    }

    nodesMap.observe(() => {
      const yNodes = Array.from(nodesMap.values()) as Node<NodeData>[];
      const validNodes = yNodes.map((node) => ({
        id: node.id,
        type: node.type || 'default',
        data: node.data,
        position: {
          x: node.position.x,
          y: node.position.y,
        },
      }));
      setNodes(validNodes);
    });

    edgesMap.observe(() => {
      const yEdges = Array.from(edgesMap.values()) as Edge[];
      setEdges(yEdges);
    });

    const initialYNodes = Array.from(nodesMap.values()) as Node<NodeData>[];
    const validNodes = initialYNodes.map((node) => ({
      id: node.id,
      type: node.type || 'default',
      data: node.data,
      position: {
        x: node.position.x,
        y: node.position.y,
      },
    }));
    setNodes(validNodes);
    setEdges(Array.from(edgesMap.values()) as Edge[]);

    return () => {
      // 清理 RAF
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }

      hocusProvider.destroy();
      doc.destroy();
    };
  }, [setEdges, setNodes]);

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      onNodesChange(changes);

      if (!ydoc.current) return;

      changes.forEach((change) => {
        if (change.type === 'position') {
          const node = nodes.find((n) => n.id === change.id);

          if (node) {
            const updatedNode = {
              ...node,
              position: change.position || node.position,
            };
            ydoc.current?.getMap('nodes').set(change.id, JSON.parse(JSON.stringify(updatedNode)));
          }
        }
      });
    },
    [nodes, onNodesChange],
  );

  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      onEdgesChange(changes);

      if (!ydoc.current) return;

      changes.forEach((change) => {
        if (change.type === 'remove') {
          ydoc.current?.getMap('edges').delete(change.id);
        }
      });
    },
    [onEdgesChange],
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return;

      const newEdge: Edge = {
        id: `e${connection.source}-${connection.target}`,
        source: connection.source,
        target: connection.target,
        sourceHandle: connection.sourceHandle || undefined,
        targetHandle: connection.targetHandle || undefined,
      };

      if (ydoc.current) {
        ydoc.current.getMap('edges').set(newEdge.id, newEdge);
      }

      setEdges((eds) => addEdge(connection, eds));
    },
    [setEdges],
  );

  // 使用 requestAnimationFrame 实现流畅的实时更新
  const rafRef = useRef<number | null>(null);
  const pendingPositionRef = useRef<{ x: number; y: number } | null>(null);

  const updateCursorPosition = useCallback((flowPos: { x: number; y: number }) => {
    if (!provider.current?.awareness) return;

    const currentState = provider.current.awareness.getLocalState();
    provider.current.awareness.setLocalState({
      ...currentState,
      cursor: flowPos,
      color: userColor.current,
      clientId: provider.current.awareness.clientID,
      name: userName.current,
    });
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (
        !provider.current?.awareness ||
        !flowRef.current ||
        !isConnected ||
        !reactFlowInstance.current
      )
        return;

      const bounds = flowRef.current.getBoundingClientRect();
      const screenPos = {
        x: e.clientX - bounds.left,
        y: e.clientY - bounds.top,
      };

      // 将屏幕坐标转换为 Flow 画布坐标
      const flowPos = reactFlowInstance.current.screenToFlowPosition(screenPos);

      // 保存待处理的位置
      pendingPositionRef.current = flowPos;

      // 如果已有待处理的 RAF，跳过
      if (rafRef.current !== null) {
        return;
      }

      // 使用 requestAnimationFrame 确保在下一帧更新
      rafRef.current = requestAnimationFrame(() => {
        if (pendingPositionRef.current) {
          updateCursorPosition(pendingPositionRef.current);
          pendingPositionRef.current = null;
        }

        rafRef.current = null;
      });
    },
    [isConnected, updateCursorPosition],
  );

  const handleMouseLeave = useCallback(() => {
    if (!provider.current?.awareness || !isConnected) return;

    // 取消待处理的 RAF
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    // 清除光标位置但保留其他状态
    const currentState = provider.current.awareness.getLocalState();
    provider.current.awareness.setLocalState({
      ...currentState,
      cursor: null,
      color: userColor.current,
      clientId: provider.current.awareness.clientID,
      name: userName.current,
    });
  }, [isConnected]);

  // 暴露添加节点的方法给父组件（通过 ref 或回调）
  useEffect(() => {
    const handleAddNode = (type: string) => {
      if (!ydoc.current || !reactFlowInstance.current) return;

      // 在画布中心创建新节点
      const center = reactFlowInstance.current.screenToFlowPosition({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      });

      const newNode: Node<NodeData> = {
        id: `node-${Date.now()}`,
        type,
        data: { label: `新节点 ${nodes.length + 1}` },
        position: center,
      };

      // 更新到 Yjs
      ydoc.current.getMap('nodes').set(newNode.id, newNode);

      // 更新本地状态
      setNodes((nds) => [...nds, newNode]);
    };

    // 暂时使用 window 事件来处理（后续可以改用 ref）
    const handler = (e: CustomEvent) => handleAddNode(e.detail.type);
    window.addEventListener('addNode' as never, handler as never);

    return () => {
      window.removeEventListener('addNode' as never, handler as never);
    };
  }, [nodes.length, setNodes]);

  return (
    <div
      ref={flowRef}
      className="h-full w-full"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onNodeDrag={handleMouseMove}
        onInit={(instance) => {
          reactFlowInstance.current = instance;
        }}
        connectionMode={ConnectionMode.Loose}
        fitView
      >
        <Controls />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        <CursorsLayer cursors={cursors} provider={provider} isConnected={isConnected} />
      </ReactFlow>
    </div>
  );
}
