import React, { useEffect, useState } from 'react';
import { Sparkles, ChevronDown } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChatAiApi, type ChatModel } from '@/services/chat-ai';
import { cn } from '@/utils';

interface ModelSelectorProps {
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  disabled?: boolean;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModel,
  setSelectedModel,
  disabled = false,
}) => {
  const [models, setModels] = useState<ChatModel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        setLoading(true);

        const { data, error } = await ChatAiApi.ChatModels();

        if (error || !data) {
          console.error('获取模型列表失败:', error);

          return;
        }

        setModels(data.data.list);

        if (!selectedModel || !data.data.list.find((m) => m.id === selectedModel)) {
          if (data.data.list.length > 0) {
            setSelectedModel(data.data.list[0].id);
          }
        }
      } catch (error) {
        console.error('获取模型列表异常:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchModels();
  }, []);

  const currentModel = models.find((m) => m.id === selectedModel);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-green-700 bg-green-100/80 hover:bg-green-200/80 transition-all duration-200 border border-green-300/50"
          disabled={disabled}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="whitespace-nowrap">
            {currentModel?.name || selectedModel.split('/').pop()}
          </span>
          <ChevronDown className="w-3 h-3" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel className="text-xs">选择模型</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {loading ? (
          <div className="px-2 py-2 text-xs text-gray-500">加载中...</div>
        ) : models.length === 0 ? (
          <div className="px-2 py-2 text-xs text-gray-500">暂无可用模型</div>
        ) : (
          models.map((model) => (
            <DropdownMenuItem
              key={model.id}
              onClick={() => setSelectedModel(model.id)}
              className={cn('cursor-pointer', selectedModel === model.id && 'bg-green-50')}
            >
              <div className="flex flex-col gap-0.5">
                <span className="font-medium text-sm">{model.name}</span>
                {model.description && (
                  <span className="text-xs text-gray-500 line-clamp-1">{model.description}</span>
                )}
              </div>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ModelSelector;
