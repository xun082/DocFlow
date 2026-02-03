import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Database, Search, X, Plus, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { AiApi } from '@/services/ai';
import { KnowledgeOption } from '@/services/ai/type';
import { cn } from '@/utils';

interface KnowledgeBaseSelectorProps {
  selectedKnowledgeIds: number[];
  setSelectedKnowledgeIds: (ids: number[]) => void;
  knowledgeEnabled: boolean;
  setKnowledgeEnabled: (enabled: boolean) => void;
  disabled?: boolean;
  buttonConfig: {
    color: string;
    bgColor: string;
    hoverBgColor: string;
    isActive: boolean;
  };
}

const INITIAL_DISPLAY_COUNT = 5;
const LOAD_MORE_COUNT = 5;

const KnowledgeBaseSelector: React.FC<KnowledgeBaseSelectorProps> = ({
  selectedKnowledgeIds,
  setSelectedKnowledgeIds,
  knowledgeEnabled,
  setKnowledgeEnabled,
  disabled = false,
  buttonConfig,
}) => {
  const [knowledgeOptions, setKnowledgeOptions] = useState<KnowledgeOption[]>([]);
  const [filteredOptions, setFilteredOptions] = useState<KnowledgeOption[]>([]);
  const [displayCount, setDisplayCount] = useState(INITIAL_DISPLAY_COUNT);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string>('');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 获取知识库列表
  const fetchKnowledgeOptions = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const result = await AiApi.GetKnowledgeOptions();

      if (result.error) {
        const errorMsg = result.error || '获取知识库列表失败';
        setError(errorMsg);
        toast.error('获取失败', {
          description: errorMsg,
        });
        setKnowledgeOptions([]);

        return;
      }

      // API 返回结构: { code, message, data: { data: KnowledgeOption[] }, timestamp }
      if (result.data?.data?.data) {
        const data = result.data.data.data;

        // 确保是数组
        if (Array.isArray(data)) {
          setKnowledgeOptions(data);
          setError('');
        } else {
          const errorMsg = '知识库数据格式不正确';
          setError(errorMsg);
          toast.error('数据错误', {
            description: errorMsg,
          });
          setKnowledgeOptions([]);
        }
      } else {
        setKnowledgeOptions([]);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '获取知识库列表失败，请稍后重试';
      setError(errorMsg);
      toast.error('请求失败', {
        description: errorMsg,
      });
      setKnowledgeOptions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (buttonConfig.isActive && isOpen && knowledgeEnabled) {
      fetchKnowledgeOptions();
      setDisplayCount(INITIAL_DISPLAY_COUNT);
      setSearchQuery('');
    }
  }, [buttonConfig.isActive, isOpen, knowledgeEnabled, fetchKnowledgeOptions]);

  // 过滤知识库列表
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredOptions(knowledgeOptions);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = knowledgeOptions.filter((option) =>
        option.title.toLowerCase().includes(query),
      );

      setFilteredOptions(filtered);
      setDisplayCount(Math.min(INITIAL_DISPLAY_COUNT, filtered.length));
    }
  }, [knowledgeOptions, searchQuery]);

  // 滚动加载更多
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.currentTarget;
      const { scrollTop, scrollHeight, clientHeight } = target;

      // 接近底部时加载更多（距离底部 10px）
      if (scrollHeight - scrollTop - clientHeight < 10) {
        setDisplayCount((prev) => Math.min(prev + LOAD_MORE_COUNT, filteredOptions.length));
      }
    },
    [filteredOptions.length],
  );

  const handleToggleKnowledge = (knowledgeId: number) => {
    if (selectedKnowledgeIds.includes(knowledgeId)) {
      setSelectedKnowledgeIds(selectedKnowledgeIds.filter((id) => id !== knowledgeId));
    } else {
      setSelectedKnowledgeIds([...selectedKnowledgeIds, knowledgeId]);
    }
  };

  const handleKnowledgeToggle = (enabled: boolean) => {
    setKnowledgeEnabled(enabled);

    if (!enabled) {
      // 关闭知识库时清空已选择的知识库
      setSelectedKnowledgeIds([]);
    }
  };

  return (
    <Popover
      open={isOpen && buttonConfig.isActive}
      onOpenChange={(open) => {
        if (buttonConfig.isActive) {
          setIsOpen(open);
        }
      }}
    >
      <PopoverTrigger asChild>
        <button
          className={cn(
            'flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 hover:bg-gray-600/30',
            buttonConfig.isActive
              ? `${buttonConfig.bgColor} ${buttonConfig.hoverBgColor}`
              : 'text-[#9CA3AF] hover:text-[#D1D5DB]',
          )}
          style={{ color: buttonConfig.isActive ? buttonConfig.color : undefined }}
          disabled={disabled || !buttonConfig.isActive}
          onClick={(e) => {
            if (!buttonConfig.isActive) {
              e.preventDefault();
              e.stopPropagation();
            }
          }}
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
              <Database className="w-4 h-4" />
            </motion.div>
          </div>
          {buttonConfig.isActive && (
            <span className="text-xs whitespace-nowrap">
              {knowledgeEnabled
                ? selectedKnowledgeIds.length > 0
                  ? `已选 ${selectedKnowledgeIds.length} 个`
                  : '知识库'
                : '知识库 (关闭)'}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex flex-col">
          {/* 标题和开关 */}
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                  知识库增强
                </span>
              </div>
              <Switch
                checked={knowledgeEnabled}
                onCheckedChange={handleKnowledgeToggle}
                className="data-[state=checked]:bg-green-600"
              />
            </div>

            {knowledgeEnabled && (
              <>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs text-gray-600 dark:text-gray-400">选择知识库来源</div>
                  {selectedKnowledgeIds.length > 0 && (
                    <button
                      onClick={() => setSelectedKnowledgeIds([])}
                      className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                    >
                      清除选择
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="搜索知识库..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-8 h-8 text-sm border-gray-300 dark:border-gray-600"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </>
            )}
          </div>

          {/* 内容区域 */}
          {!knowledgeEnabled ? (
            <div className="py-8 px-4 text-center">
              <Database className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3 opacity-50" />
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">知识库功能已关闭</div>
              <div className="text-xs text-gray-400 dark:text-gray-500">
                开启后可选择知识库来增强 AI 回答质量
              </div>
            </div>
          ) : error ? (
            <div className="py-8 px-4 text-center">
              <AlertCircle className="w-12 h-12 text-red-400 dark:text-red-600 mx-auto mb-3" />
              <div className="text-sm text-gray-700 dark:text-gray-300 mb-2 font-medium">
                加载失败
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">{error}</div>
              <Button
                onClick={fetchKnowledgeOptions}
                className="bg-green-600 hover:bg-green-700 text-white"
                size="sm"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                重试
              </Button>
            </div>
          ) : isLoading ? (
            <div className="py-8 text-center">
              <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-gray-300 border-t-gray-600"></div>
              <div className="text-sm text-gray-500 mt-2">加载中...</div>
            </div>
          ) : !Array.isArray(filteredOptions) || filteredOptions.length === 0 ? (
            <div className="py-8 px-4 text-center">
              <Database className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {searchQuery ? '未找到匹配的知识库' : '暂无知识库，请先创建'}
              </div>
              {!searchQuery && (
                <Link href="/dashboard/knowledge" onClick={() => setIsOpen(false)}>
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white" size="sm">
                    <Plus className="w-4 h-4 mr-1.5" />
                    前往创建知识库
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className="max-h-80 overflow-y-auto overscroll-contain"
            >
              <div className="p-2 space-y-1">
                <AnimatePresence>
                  {filteredOptions.slice(0, displayCount).map((option, index) => {
                    const isSelected = selectedKnowledgeIds.includes(option.id);

                    return (
                      <motion.label
                        key={option.id}
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.02 }}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200',
                          isSelected
                            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 border border-transparent hover:border-gray-200 dark:hover:border-gray-700',
                        )}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleToggleKnowledge(option.id)}
                          className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                        />
                        <span
                          className={cn(
                            'text-sm flex-1 font-medium',
                            isSelected
                              ? 'text-green-700 dark:text-green-400'
                              : 'text-gray-700 dark:text-gray-300',
                          )}
                        >
                          {option.title}
                        </span>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-1.5 h-1.5 rounded-full bg-green-600 dark:bg-green-400"
                          />
                        )}
                      </motion.label>
                    );
                  })}
                </AnimatePresence>
              </div>

              {/* 加载更多提示 */}
              {displayCount < filteredOptions.length && (
                <div className="px-3 py-2 text-center border-t border-gray-200 dark:border-gray-700">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    已显示 {displayCount} / {filteredOptions.length}，继续滚动加载更多
                  </div>
                </div>
              )}

              {/* 已全部加载提示 */}
              {displayCount >= filteredOptions.length &&
                filteredOptions.length > INITIAL_DISPLAY_COUNT && (
                  <div className="px-3 py-2 text-center border-t border-gray-200 dark:border-gray-700">
                    <div className="text-xs text-gray-400 dark:text-gray-500">
                      已显示全部 {filteredOptions.length} 个
                    </div>
                  </div>
                )}
            </div>
          )}

          {/* 底部统计信息 */}
          {knowledgeEnabled && !isLoading && !error && filteredOptions.length > 0 && (
            <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600 dark:text-gray-400">
                  共 {filteredOptions.length} 个知识库
                </span>
                {selectedKnowledgeIds.length > 0 && (
                  <span className="text-green-600 dark:text-green-400 font-medium">
                    已选 {selectedKnowledgeIds.length} 个
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default KnowledgeBaseSelector;
