import React from 'react';

import { cn } from '@/utils';

interface ImageSizeButtonsProps {
  selectedSize: string;
  setSelectedSize: (size: string) => void;
  disabled?: boolean;
}

// 图片尺寸配置（根据后端API支持的尺寸）
const imageSizes = [
  { value: '1328x1328', label: '1:1' },
  { value: '1664x928', label: '16:9' },
  { value: '928x1664', label: '9:16' },
  { value: '1472x1140', label: '4:3' },
  { value: '1140x1472', label: '3:4' },
  { value: '1584x1056', label: '3:2' },
  { value: '1056x1584', label: '2:3' },
];

const ImageSizeButtons: React.FC<ImageSizeButtonsProps> = ({
  selectedSize,
  setSelectedSize,
  disabled = false,
}) => {
  return (
    <div className="flex items-center gap-1.5">
      {imageSizes.map((size) => (
        <button
          key={size.value}
          onClick={() => !disabled && setSelectedSize(size.value)}
          disabled={disabled}
          className={cn(
            'px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all',
            selectedSize === size.value
              ? 'bg-purple-600 text-white shadow-sm'
              : 'bg-white/80 text-gray-600 hover:bg-purple-50 hover:text-purple-700 border border-purple-200/50',
            disabled && 'opacity-50 cursor-not-allowed',
          )}
          title={size.value}
        >
          {size.label}
        </button>
      ))}
    </div>
  );
};

export default ImageSizeButtons;
