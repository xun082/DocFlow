'use client';

import { useState } from 'react';
import type { Node, Edge } from 'reactflow';

import Canvas from './_components/canvas';
import NodePanel from './_components/node-panel';

interface NodeData {
  label: string;
}

const Workflow = () => {
  const [nodes, setNodes] = useState<Node<NodeData>[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(0);

  const handleAddNode = (type: string) => {
    // 触发自定义事件通知 Canvas 添加节点
    window.dispatchEvent(
      new CustomEvent('addNode', {
        detail: { type },
      }),
    );
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      {/* 左侧节点面板 */}
      <NodePanel onAddNode={handleAddNode} />

      {/* 中间画布区域 */}
      <div className="absolute bottom-16 left-64 right-0 top-0">
        <Canvas
          onNodesChange={setNodes}
          onEdgesChange={setEdges}
          onConnectionChange={setIsConnected}
          onOnlineUsersChange={setOnlineUsers}
        />
      </div>

      {/* 底部状态栏 */}
      <div className="fixed bottom-0 left-64 right-0 z-[1000] h-16 border-t border-gray-200 bg-white/95 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900/95">
        <div className="flex h-full items-center justify-between px-6">
          <div className="flex items-center gap-4">
            {/* 连接状态 */}
            <div className="flex items-center gap-2">
              <div
                className={`h-2 w-2 rounded-full ${
                  isConnected ? 'animate-pulse bg-green-500' : 'bg-red-500'
                }`}
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {isConnected ? '已连接' : '未连接'}
              </span>
            </div>

            {/* 分隔线 */}
            <div className="h-4 w-px bg-gray-300 dark:bg-gray-600" />

            {/* 在线人数 */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">在线人数：</span>
              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                {onlineUsers}
              </span>
            </div>
          </div>

          {/* 右侧统计信息 */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">节点：</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {nodes.length}
              </span>
            </div>
            <div className="h-4 w-px bg-gray-300 dark:bg-gray-600" />
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">连线：</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {edges.length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Workflow;
