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

  const currentStepData = steps[currentStep];

  // 计算位置
  React.useEffect(() => {
    if (!isOpen || !currentStepData) {
      setPosition(null);
      setTooltipPosition(null);
      console.log(123);

      return;
    }

    const updatePosition = () => {
      const pos = getElementPosition(currentStepData.selector);
      console.log(pos, currentStepData.selector);

      if (!pos || !pos.exists) {
        setPosition(null);
        setTooltipPosition(null);

        return;
      }

      setPosition(pos);

      // 计算提示框位置（优先放在元素下方，如果空间不足则放在上方）
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      const tooltipHeight = 200; // 估算提示框高度
      const tooltipWidth = 320; // 估算提示框宽度
      const offset = 12;

      let placement: 'top' | 'bottom' | 'left' | 'right' = 'bottom';
      let tooltipTop = pos.top + pos.height + offset;
      let tooltipLeft = pos.left + pos.width / 2 - tooltipWidth / 2;

      // 如果下方空间不足，放在上方
      if (tooltipTop + tooltipHeight > viewportHeight + window.scrollY) {
        placement = 'top';
        tooltipTop = pos.top - tooltipHeight - offset;
      }

      // 确保提示框不超出视口
      if (tooltipLeft < 0) {
        tooltipLeft = offset;
      } else if (tooltipLeft + tooltipWidth > viewportWidth) {
        tooltipLeft = viewportWidth - tooltipWidth - offset;
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
  }, [isOpen, currentStep, currentStepData]);

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

  if (!isOpen || !currentStepData || !position || !tooltipPosition) {
    return null;
  }

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
          className="fixed z-30 pointer-events-none rounded-lg border-2 border-blue-500 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]"
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
        className={cn(
          'fixed z-40 w-80 bg-white rounded-lg shadow-xl border border-gray-200 p-4',
          tooltipPosition.placement === 'top' && 'animate-in fade-in slide-in-from-bottom-2',
          tooltipPosition.placement === 'bottom' && 'animate-in fade-in slide-in-from-top-2',
        )}
        style={{
          top: `${tooltipPosition.top}px`,
          left: `${tooltipPosition.left}px`,
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
