import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
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

interface ButtonConfig {
  color?: string;
  bgColor?: string;
  hoverBgColor?: string;
  className?: string;
}

interface ModelSelectorProps {
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  disabled?: boolean;
  buttonConfig?: ButtonConfig;
  variant?: 'default' | 'green' | 'purple' | 'custom';
  useMotion?: boolean;
  showChevron?: boolean;
  align?: 'start' | 'center' | 'end';
  className?: string;
}

const variantStyles = {
  default: {
    className:
      'flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 hover:bg-gray-600/30',
    selectedClassName: 'bg-gray-100',
  },
  green: {
    className:
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-green-700 bg-green-100/80 hover:bg-green-200/80 transition-all duration-200 border border-green-300/50',
    selectedClassName: 'bg-green-50',
  },
  purple: {
    className:
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-purple-700 bg-purple-100/80 hover:bg-purple-200/80 transition-all duration-200 border border-purple-300/50',
    selectedClassName: 'bg-purple-50',
  },
  custom: {
    className: '',
    selectedClassName: '',
  },
};

const ITEMS_PER_PAGE = 10;

const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModel,
  setSelectedModel,
  disabled = false,
  buttonConfig,
  variant = 'default',
  useMotion = false,
  showChevron = true,
  align = 'start',
  className,
}) => {
  const [models, setModels] = useState<ChatModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        setLoading(true);

        const { data, error } = await ChatAiApi.ChatModels();

        if (error || !data) {
          setModels([]);

          return;
        }

        setModels(data.data.list);

        if (!selectedModel || !data.data.list.find((m) => m.id === selectedModel)) {
          if (data.data.list.length > 0) {
            setSelectedModel(data.data.list[0].id);
          }
        }
      } catch {
        // 静默处理，避免打扰用户
        setModels([]);
      } finally {
        setLoading(false);
      }
    };

    fetchModels();
  }, []);

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.currentTarget;
      const scrollPercentage = (target.scrollTop + target.clientHeight) / target.scrollHeight;

      // 当滚动到80%时加载更多
      if (scrollPercentage > 0.8 && displayCount < models.length) {
        setDisplayCount((prev) => Math.min(prev + ITEMS_PER_PAGE, models.length));
      }
    },
    [displayCount, models.length],
  );

  // 重置显示数量当下拉菜单打开时
  const handleOpenChange = useCallback((open: boolean) => {
    if (open) {
      setDisplayCount(ITEMS_PER_PAGE);
    }
  }, []);

  const currentModel = models.find((m) => m.id === selectedModel);
  const currentVariantStyles = variantStyles[variant];

  const getButtonClassName = () => {
    if (variant === 'custom' && buttonConfig) {
      return cn(
        currentVariantStyles.className,
        buttonConfig.className,
        `${buttonConfig.bgColor || ''} ${buttonConfig.hoverBgColor || ''}`,
        className,
      );
    }

    return cn(currentVariantStyles.className, className);
  };

  const getButtonStyle = () => {
    if (variant === 'custom' && buttonConfig?.color) {
      return { color: buttonConfig.color };
    }

    return undefined;
  };

  const SparklesIcon = useMotion ? (
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
  ) : (
    <Sparkles className="w-3.5 h-3.5" />
  );

  const displayedModels = models.slice(0, displayCount);

  return (
    <DropdownMenu onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <button className={getButtonClassName()} style={getButtonStyle()} disabled={disabled}>
          {useMotion ? (
            <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
              {SparklesIcon}
            </div>
          ) : (
            SparklesIcon
          )}
          <span className="text-xs whitespace-nowrap">
            {currentModel?.name || selectedModel.split('/').pop()}
          </span>
          {showChevron && <ChevronDown className="w-3 h-3" />}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-64 p-0">
        <div className="px-2 py-1.5">
          <DropdownMenuLabel className="text-xs px-0">选择模型</DropdownMenuLabel>
        </div>
        <DropdownMenuSeparator className="my-0" />
        {loading ? (
          <div className="px-4 py-3 text-xs text-gray-500">加载中...</div>
        ) : models.length === 0 ? (
          <div className="px-4 py-3 text-xs text-gray-500">暂无可用模型</div>
        ) : (
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="max-h-[400px] overflow-y-auto scrollbar-hide"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {displayedModels.map((model) => (
              <DropdownMenuItem
                key={model.id}
                onClick={() => setSelectedModel(model.id)}
                className={cn(
                  'cursor-pointer mx-1 my-0.5',
                  selectedModel === model.id && currentVariantStyles.selectedClassName,
                )}
              >
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium text-sm">{model.name}</span>
                  {model.description && (
                    <span className="text-xs text-gray-500 line-clamp-1">{model.description}</span>
                  )}
                </div>
              </DropdownMenuItem>
            ))}
            {displayCount < models.length && (
              <div className="px-4 py-2 text-xs text-gray-400 text-center">
                滚动加载更多... ({displayCount}/{models.length})
              </div>
            )}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ModelSelector;
