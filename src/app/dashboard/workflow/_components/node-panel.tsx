import { memo } from 'react';

interface NodeType {
  id: string;
  type: string;
  label: string;
  icon: string;
  color: string;
}

const nodeTypes: NodeType[] = [
  {
    id: 'input',
    type: 'input',
    label: '开始节点',
    icon: '▶️',
    color: 'bg-blue-500',
  },
  {
    id: 'default',
    type: 'default',
    label: '处理节点',
    icon: '⚙️',
    color: 'bg-purple-500',
  },
  {
    id: 'output',
    type: 'output',
    label: '结束节点',
    icon: '🏁',
    color: 'bg-green-500',
  },
];

interface NodePanelProps {
  onAddNode: (type: string) => void;
}

const NodePanel = memo(({ onAddNode }: NodePanelProps) => {
  return (
    <div className="absolute left-0 top-0 z-[1000] flex h-full w-64 flex-col border-r border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
      {/* 标题 */}
      <div className="border-b border-gray-200 p-4 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">节点面板</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">点击添加节点到画布</p>
      </div>

      {/* 节点列表 */}
      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {nodeTypes.map((node) => (
          <button
            key={node.id}
            onClick={() => onAddNode(node.type)}
            className="group w-full rounded-lg border border-gray-200 bg-white p-4 text-left transition-all hover:border-gray-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600"
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg text-xl ${node.color} bg-opacity-10 transition-transform group-hover:scale-110`}
              >
                {node.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 dark:text-white">{node.label}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {node.type === 'input' && '流程开始'}
                  {node.type === 'default' && '数据处理'}
                  {node.type === 'output' && '流程结束'}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* 底部提示 */}
      <div className="border-t border-gray-200 p-4 dark:border-gray-700">
        <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
          <p className="text-xs text-blue-700 dark:text-blue-300">
            💡 提示：拖动节点可以移动位置，点击节点间的连接点可以创建连线
          </p>
        </div>
      </div>
    </div>
  );
});

NodePanel.displayName = 'NodePanel';

export default NodePanel;
