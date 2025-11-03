import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/utils/utils';

interface ModelSelectorProps {
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  disabled?: boolean;
  buttonConfig: {
    color: string;
    bgColor: string;
    hoverBgColor: string;
  };
}

const modelOptions = [
  { value: 'deepseek-ai/DeepSeek-V3', label: 'DeepSeek-V3' },
  { value: 'Qwen/QwQ-32B', label: 'Qwen/QwQ-32B' },
  { value: 'gpt-4', label: 'GPT-4' },
];

const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModel,
  setSelectedModel,
  disabled = false,
  buttonConfig,
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            'flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 hover:bg-gray-600/30',
            `${buttonConfig.bgColor} ${buttonConfig.hoverBgColor}`,
          )}
          style={{ color: buttonConfig.color }}
          disabled={disabled}
        >
          <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
            <motion.div
              animate={{ rotate: 0, scale: 1 }}
              whileHover={{
                scale: 1.1,
                transition: { type: 'spring', stiffness: 300, damping: 10 },
              }}
              transition={{ type: 'spring', stiffness: 260, damping: 25 }}
            >
              <Sparkles className="w-4 h-4" />
            </motion.div>
          </div>
          <span className="text-xs whitespace-nowrap">{selectedModel.split('/').pop()}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>模型选择</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {modelOptions.map((option) => (
          <DropdownMenuItem key={option.value} onClick={() => setSelectedModel(option.value)}>
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ModelSelector;
