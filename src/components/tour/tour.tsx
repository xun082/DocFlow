'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

import { useTour } from './use-tour';

import { Button } from '@/components/ui/button';
import { cn } from '@/utils';

// 计算元素位置和尺寸
function getElementPosition(selector: string): {
  top: number;
  left: number;
  width: number;
  height: number;
  exists: boolean;
} | null {
  if (typeof document === 'undefined') return null;

  const element = document.querySelector(selector);
  if (!element) return null;

  const rect = element.getBoundingClientRect();

  return {
    top: rect.top + window.scrollY,
    left: rect.left + window.scrollX,
    width: rect.width,
    height: rect.height,
    exists: true,
  };
}

// Tour 组件
export function Tour() {
  const { isOpen, currentStep, steps, nextStep, previousStep, skip } = useTour();
  const tooltipRef = React.useRef<HTMLDivElement>(null);
  const [position, setPosition] = React.useState<{
    top: number;
    left: number;
    width: number;
    height: number;
    exists: boolean;
  } | null>(null);
  const [tooltipPosition, setTooltipPosition] = React.useState<{
    top: number;
    left: number;
    placement: 'top' | 'bottom' | 'left' | 'right';
  } | null>(null);
  const [tooltipSize, setTooltipSize] = React.useState<{
    width: number;
    height: number;
  } | null>(null);

  const currentStepData = steps[currentStep];

  // 获取提示框实际尺寸
  React.useLayoutEffect(() => {
    if (!isOpen || !currentStepData || !tooltipRef.current) {
      setTooltipSize(null);

      return;
    }

    const tooltipElement = tooltipRef.current;
    const width = tooltipElement.offsetWidth;
    const height = tooltipElement.offsetHeight;
    setTooltipSize({ width, height });
  }, [isOpen, currentStep, currentStepData]);

  // 计算位置
  React.useEffect(() => {
    if (!isOpen || !currentStepData) {
      setPosition(null);
      setTooltipPosition(null);

      return;
    }

    const updatePosition = () => {
      const pos = getElementPosition(currentStepData.selector);

      if (!pos || !pos.exists) {
        setPosition(null);
        setTooltipPosition(null);

        return;
      }

      setPosition(pos);

      // 计算提示框位置（使用配置的 placement，默认为 bottom）
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      // 使用配置的宽度或默认值
      const defaultMaxWidth = currentStepData.maxWidth ?? 320;
      // 使用实际尺寸，如果还未获取到则使用估算值（使用配置的 maxWidth）
      const tooltipHeight = tooltipSize?.height ?? 200;
      const tooltipWidth = tooltipSize?.width ?? defaultMaxWidth;
      const offset = 12;

      // 获取配置的 placement，默认为 bottom
      const preferredPlacement = currentStepData.placement ?? 'bottom';
      let placement: 'top' | 'bottom' | 'left' | 'right' = preferredPlacement;
      let tooltipTop = 0;
      let tooltipLeft = 0;

      // 根据配置的 placement 计算初始位置
      switch (preferredPlacement) {
        case 'top':
          tooltipTop = pos.top - tooltipHeight - offset;
          tooltipLeft = pos.left + (pos.width - tooltipWidth) / 2; // 水平居中
          break;
        case 'bottom':
          tooltipTop = pos.top + pos.height + offset;
          tooltipLeft = pos.left + (pos.width - tooltipWidth) / 2; // 水平居中
          break;
        case 'left':
          tooltipLeft = pos.left - tooltipWidth - offset;
          tooltipTop = pos.top + (pos.height - tooltipHeight) / 2; // 垂直居中
          break;
        case 'right':
          tooltipLeft = pos.left + pos.width + offset;
          tooltipTop = pos.top + (pos.height - tooltipHeight) / 2; // 垂直居中
          break;
      }

      // 如果首选位置空间不足，自动调整到其他位置
      if (
        preferredPlacement === 'bottom' &&
        tooltipTop + tooltipHeight > viewportHeight + window.scrollY
      ) {
        // 下方空间不足，尝试上方
        if (pos.top - tooltipHeight - offset >= window.scrollY) {
          placement = 'top';
          tooltipTop = pos.top - tooltipHeight - offset;
        }
      } else if (preferredPlacement === 'top' && tooltipTop < window.scrollY) {
        // 上方空间不足，尝试下方
        if (pos.top + pos.height + tooltipHeight + offset <= viewportHeight + window.scrollY) {
          placement = 'bottom';
          tooltipTop = pos.top + pos.height + offset;
        }
      } else if (preferredPlacement === 'left' && tooltipLeft < 0) {
        // 左侧空间不足，尝试右侧
        if (pos.left + pos.width + tooltipWidth + offset <= viewportWidth) {
          placement = 'right';
          tooltipLeft = pos.left + pos.width + offset;
        }
      } else if (preferredPlacement === 'right' && tooltipLeft + tooltipWidth > viewportWidth) {
        // 右侧空间不足，尝试左侧
        if (pos.left - tooltipWidth - offset >= 0) {
          placement = 'left';
          tooltipLeft = pos.left - tooltipWidth - offset;
        }
      }

      // 确保提示框不超出视口（水平方向）
      if (tooltipLeft < 0) {
        tooltipLeft = offset;
      } else if (tooltipLeft + tooltipWidth > viewportWidth) {
        tooltipLeft = viewportWidth - tooltipWidth - offset;
      }

      // 确保提示框不超出视口（垂直方向）
      if (tooltipTop < window.scrollY) {
        tooltipTop = window.scrollY + offset;
      } else if (tooltipTop + tooltipHeight > viewportHeight + window.scrollY) {
        tooltipTop = viewportHeight + window.scrollY - tooltipHeight - offset;
      }

      setTooltipPosition({
        top: tooltipTop,
        left: tooltipLeft,
        placement,
      });
    };

    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    // 使用 requestAnimationFrame 确保 DOM 更新后再计算
    const rafId = requestAnimationFrame(updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
      cancelAnimationFrame(rafId);
    };
  }, [isOpen, currentStep, currentStepData, tooltipSize]);

  // 键盘导航
  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        skip();
      } else if (e.key === 'ArrowRight' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        nextStep();
      } else if (e.key === 'ArrowLeft' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        previousStep();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, nextStep, previousStep, skip]);

  if (!isOpen || !currentStepData || !position) {
    return null;
  }

  // 如果还没有获取到尺寸，先渲染提示框到临时位置以获取尺寸
  const shouldShowTooltip = tooltipPosition !== null;

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  return (
    <>
      {/* 遮罩层 */}
      <div
        className="fixed inset-0 z-30 bg-black/50"
        style={{
          clipPath: position
            ? `polygon(0% 0%, 0% 100%, ${position.left}px 100%, ${position.left}px ${position.top}px, ${position.left + position.width}px ${position.top}px, ${position.left + position.width}px ${position.top + position.height}px, ${position.left}px ${position.top + position.height}px, ${position.left}px 100%, 100% 100%, 100% 0%)`
            : undefined,
        }}
        onClick={skip}
      />

      {/* 高亮框 */}
      {position && (
        <div
          className="fixed z-100 pointer-events-none rounded-lg border-2 border-blue-500 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
            width: `${position.width}px`,
            height: `${position.height}px`,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5), 0 0 20px rgba(59, 130, 246, 0.5)',
          }}
        />
      )}

      {/* 提示框 */}
      <div
        ref={tooltipRef}
        className={cn(
          'fixed z-110 bg-white rounded-lg shadow-xl border border-gray-200 p-4',
          'break-words', // 确保文本可以正确折行
          'max-w-[calc(100vw-2rem)]', // 移动端响应式：最大宽度不超过视口宽度减去边距
          shouldShowTooltip &&
            tooltipPosition.placement === 'top' &&
            'animate-in fade-in slide-in-from-bottom-2',
          shouldShowTooltip &&
            tooltipPosition.placement === 'bottom' &&
            'animate-in fade-in slide-in-from-top-2',
          shouldShowTooltip &&
            tooltipPosition.placement === 'left' &&
            'animate-in fade-in slide-in-from-right-2',
          shouldShowTooltip &&
            tooltipPosition.placement === 'right' &&
            'animate-in fade-in slide-in-from-left-2',
        )}
        style={{
          top: shouldShowTooltip ? `${tooltipPosition.top}px` : '-9999px',
          left: shouldShowTooltip ? `${tooltipPosition.left}px` : '-9999px',
          visibility: shouldShowTooltip ? 'visible' : 'hidden',
          minWidth: currentStepData.minWidth ?? 200,
          maxWidth: `min(${currentStepData.maxWidth ?? 320}px, calc(100vw - 2rem))`, // 取配置值和响应式值的最小值
          width: 'auto', // 自动宽度，由内容决定
        }}
      >
        {/* 关闭按钮 */}
        <button
          type="button"
          onClick={skip}
          className="absolute top-2 right-2 p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="关闭引导"
        >
          <X className="h-4 w-4" />
        </button>

        {/* 步骤内容 */}
        <div className="pr-6 mb-4">
          <div className="text-sm text-gray-600 mb-2">
            {currentStep + 1} / {steps.length}
          </div>
          <div className="text-gray-900">{currentStepData.content}</div>
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center justify-between gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={skip} className="text-gray-600">
            跳过
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={previousStep}
              disabled={isFirstStep}
            >
              <ChevronLeft className="h-4 w-4" />
              上一步
            </Button>
            <Button type="button" size="sm" onClick={nextStep}>
              {isLastStep ? '完成' : '下一步'}
              {!isLastStep && <ChevronRight className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
