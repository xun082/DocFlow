import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize2, ChevronDown } from 'lucide-react';

import { cn } from '@/utils/utils';

interface ImageSizeSelectorProps {
  selectedSize: string;
  setSelectedSize: (size: string) => void;
  disabled?: boolean;
}

// 常见图片尺寸配置
const imageSizes = [
  { value: '1024x1024', label: '正方形 1:1', description: '1024×1024' },
  { value: '1024x1792', label: '竖版 9:16', description: '1024×1792' },
  { value: '1792x1024', label: '横版 16:9', description: '1792×1024' },
  { value: '512x512', label: '小正方 1:1', description: '512×512' },
  { value: '768x768', label: '中正方 1:1', description: '768×768' },
];

const ImageSizeSelector: React.FC<ImageSizeSelectorProps> = ({
  selectedSize,
  setSelectedSize,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // 获取当前选中尺寸的标签
  const selectedSizeLabel =
    imageSizes.find((size) => size.value === selectedSize)?.label || '选择尺寸';

  // 点击外部关闭下拉菜单
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200',
          'bg-purple-500/20 hover:bg-purple-500/30 text-purple-600',
          disabled && 'opacity-50 cursor-not-allowed',
        )}
      >
        <div className="w-4 h-4 flex items-center justify-center">
          <Maximize2 className="w-3.5 h-3.5" />
        </div>
        <span className="max-w-[100px] truncate">{selectedSizeLabel}</span>
        <ChevronDown
          className={cn('w-3 h-3 transition-transform duration-200', isOpen && 'rotate-180')}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50"
          >
            <div className="p-2">
              <div className="text-xs font-semibold text-gray-500 px-3 py-2">选择图片尺寸</div>
              <div className="space-y-1">
                {imageSizes.map((size) => (
                  <button
                    key={size.value}
                    onClick={() => {
                      setSelectedSize(size.value);
                      setIsOpen(false);
                    }}
                    className={cn(
                      'w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-colors',
                      selectedSize === size.value
                        ? 'bg-purple-50 text-purple-700'
                        : 'hover:bg-gray-50 text-gray-700',
                    )}
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{size.label}</span>
                      <span className="text-xs text-gray-500">{size.description}</span>
                    </div>
                    {selectedSize === size.value && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center"
                      >
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </motion.div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ImageSizeSelector;
