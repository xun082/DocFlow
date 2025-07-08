import { useState } from 'react';

// ====== 常量、类型、枚举 ======
export enum DiagramType {
  FLOWCHART = 'flowchart',
  SEQUENCE = 'sequence',
  CLASS = 'class',
}

const DIAGRAM_TYPE_OPTIONS = [
  { value: DiagramType.FLOWCHART, label: '流程图 (Flowchart)' },
  { value: DiagramType.SEQUENCE, label: '时序图 (Sequence)' },
  { value: DiagramType.CLASS, label: '类图 (Class)' },
];

const DEFAULT_MERMAID_CODE = `flowchart TD\n    A[Christmas] --> B[Get money]\n    B --> C[Go shopping]\n    C --> D{Let me think}\n    D -->|One| E[Laptop]\n    D -->|Two| F[iPhone]\n    D -->|Three| G[Car]`;

const API_URL = 'http://localhost:8080/api/v1/ai/generate-diagram';
const API_TOKEN =
  'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTIzLCJuYW1lIjoiMjA0MjIwNDI4NUBxcS5jb20iLCJlbWFpbCI6IjIwNDIyMDQyODVAcXEuY29tIiwiaWF0IjoxNzUwNzQ2NDk3LCJleHAiOjE3NTEzNTEyOTd9.pukKyPTmVqPDuOQr1svifI1p2ivJ5N6Fk5QyKhs4-Eo';

async function fetchMermaidFromAI(description: string, diagramType: DiagramType): Promise<string> {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: API_TOKEN,
    },
    body: JSON.stringify({ text: description, diagramType }),
  });
  if (!response.ok) throw new Error(`请求失败: ${response.status} ${response.statusText}`);

  const data = await response.json();
  if (data.code !== 201) throw new Error(data.message || '生成失败');

  let code = data.data.mermaidCode;
  code = code
    .replace(/\\n/g, '\n')
    .replace(/\n+/g, '\n')
    .replace(/^\s+|\s+$/g, '')
    .replace(/\n\s+/g, '\n')
    .trim();

  return code;
}

interface DiagramModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (code: string) => void;
}

const DiagramModal = ({ isOpen, onClose, onGenerate }: DiagramModalProps) => {
  const [description, setDescription] = useState('');
  const [selectedType, setSelectedType] = useState<DiagramType>(DiagramType.FLOWCHART);
  const [mermaidCode, setMermaidCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!description.trim()) {
      setError('请输入图表描述');

      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const code = await fetchMermaidFromAI(description, selectedType);
      setMermaidCode(code);
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败，请检查网络连接或API服务');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApply = () => {
    if (mermaidCode.trim()) {
      onGenerate(mermaidCode);
      handleClose();
    }
  };

  const handleLoadExample = () => setMermaidCode(DEFAULT_MERMAID_CODE);
  const handleClose = () => {
    setDescription('');
    setMermaidCode('');
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-11/12 max-w-4xl h-5/6 flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">🎨 图表生成器</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold w-8 h-8 flex items-center justify-center"
          >
            ×
          </button>
        </div>
        <div className="flex flex-1 overflow-hidden">
          <div className="w-1/2 p-6 border-r border-gray-200 flex flex-col">
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-4">🤖 AI 自动生成</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-600 mb-2">图表类型</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as DiagramType)}
                  className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {DIAGRAM_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-600 mb-2">图表描述</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="描述您想要生成的图表..."
                  className="w-full h-24 p-3 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !description.trim()}
                className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isGenerating ? '🔄 AI 生成中...' : '🚀 AI 生成图表'}
              </button>
            </div>
            <div className="mb-4">
              <button
                onClick={handleLoadExample}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                📝 加载示例代码
              </button>
            </div>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
            <div className="mt-auto">
              <h4 className="text-sm font-medium text-gray-700 mb-2">语法参考:</h4>
              <div className="text-xs text-gray-600 space-y-1 bg-gray-50 p-3 rounded">
                <p>
                  <code>A[文本]</code> - 矩形节点
                </p>
                <p>
                  <code>B(文本)</code> - 圆角矩形
                </p>
                <p>
                  <code>C{'{文本}'}</code> - 菱形决策节点
                </p>
                <p>
                  <code>A --&gt; B</code> - 箭头连接
                </p>
                <p>
                  <code>A --&gt;|标签| B</code> - 带标签连接
                </p>
              </div>
            </div>
          </div>
          <div className="w-1/2 p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-700">Mermaid 代码</h3>
              <span className="text-xs text-gray-500">可手动编辑</span>
            </div>
            <textarea
              value={mermaidCode}
              onChange={(e) => setMermaidCode(e.target.value)}
              placeholder="在这里输入或编辑 Mermaid 代码..."
              className="flex-1 p-4 border border-gray-300 rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={handleClose}
            className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleApply}
            disabled={!mermaidCode.trim()}
            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            🎨 应用到画布
          </button>
        </div>
      </div>
    </div>
  );
};

export default DiagramModal;
