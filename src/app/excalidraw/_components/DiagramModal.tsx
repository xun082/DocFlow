import { useState } from 'react';
import toast from 'react-hot-toast';

import { AiGenerateDiagram } from '@/services/ai';

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

async function fetchMermaidFromAI(description: string, diagramType: DiagramType): Promise<string> {
  const response = await AiGenerateDiagram.CorrectText(
    { text: description, diagramType: diagramType },
    {
      onError: (error) => {
        console.error('AI生成图表错误:', error);
        toast.dismiss('generate-diagram-progress');
      },
      unauthorized: () => {
        toast.dismiss('generate-diagram-progress');
        toast.error('身份验证失败，请重新登录');
      },
      forbidden: () => {
        toast.dismiss('generate-diagram-progress');
        toast.error('没有权限使用AI生成图表功能');
      },
      serverError: () => {
        toast.dismiss('generate-diagram-progress');
        toast.error('AI服务暂时不可用，请稍后再试');
      },
      networkError: () => {
        toast.dismiss('generate-diagram-progress');
        toast.error('网络连接失败，请检查网络连接');
      },
      default: (error: any) => {
        toast.dismiss('generate-diagram-progress');

        if (error?.message?.includes('timeout') || error?.message?.includes('超时')) {
          toast.error('AI生成图表超时，请稍后重试或检查网络连接');
        } else {
          toast.error('AI生成图表失败，已切换到基础模式');
        }
      },
    },
  );

  if (response.data?.code !== 201) throw new Error(response.data?.message || '生成失败');

  let code = response.data?.data?.mermaidCode || '';
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
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="flex h-5/6 w-11/12 max-w-4xl flex-col rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-800">🎨 图表生成器</h2>
          <button
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center text-2xl font-bold text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>
        <div className="flex flex-1 overflow-hidden">
          <div className="flex w-1/2 flex-col border-r border-gray-200 p-6">
            <div className="mb-6 rounded-lg bg-blue-50 p-4">
              <h3 className="mb-4 text-sm font-medium text-gray-700">🤖 AI 自动生成</h3>
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-gray-600">图表类型</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as DiagramType)}
                  className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
                >
                  {DIAGRAM_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-gray-600">图表描述</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="描述您想要生成的图表..."
                  className="h-24 w-full resize-none rounded-lg border border-gray-300 p-3 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !description.trim()}
                className="w-full rounded-lg bg-blue-500 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                {isGenerating ? '🔄 AI 生成中...' : '🚀 AI 生成图表'}
              </button>
            </div>
            <div className="mb-4">
              <button
                onClick={handleLoadExample}
                className="w-full rounded-lg bg-gray-100 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-200"
              >
                📝 加载示例代码
              </button>
            </div>
            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            <div className="mt-auto">
              <h4 className="mb-2 text-sm font-medium text-gray-700">语法参考:</h4>
              <div className="space-y-1 rounded bg-gray-50 p-3 text-xs text-gray-600">
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
          <div className="flex w-1/2 flex-col p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-700">Mermaid 代码</h3>
              <span className="text-xs text-gray-500">可手动编辑</span>
            </div>
            <textarea
              value={mermaidCode}
              onChange={(e) => setMermaidCode(e.target.value)}
              placeholder="在这里输入或编辑 Mermaid 代码..."
              className="flex-1 resize-none rounded-lg border border-gray-300 p-4 font-mono text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 border-t border-gray-200 p-6">
          <button
            onClick={handleClose}
            className="rounded-lg border border-gray-300 px-6 py-2 text-gray-600 transition-colors hover:bg-gray-50"
          >
            取消
          </button>
          <button
            onClick={handleApply}
            disabled={!mermaidCode.trim()}
            className="rounded-lg bg-green-500 px-6 py-2 text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            🎨 应用到画布
          </button>
        </div>
      </div>
    </div>
  );
};

export default DiagramModal;
