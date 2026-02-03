import { Editor } from '@tiptap/react';
import { computePosition, flip, shift, offset, autoUpdate, Placement } from '@floating-ui/dom';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';

import { ShouldShowProps } from '../types';

/**
 * CustomBubbleMenu 组件的 Props 接口
 */
export interface CustomBubbleMenuProps {
  /** 编辑器实例 */
  editor: Editor;
  /** 子元素 */
  children: React.ReactNode;
  /** 自定义类名 */
  className?: string;
  /** 自定义显示逻辑,返回 true 时显示菜单 */
  shouldShow?: (props: ShouldShowProps) => boolean;
  /** 菜单位置,默认 'top' */
  placement?: Placement;
  /** 距离选区的偏移量,默认 8px */
  offsetDistance?: number;
  /** 边界内边距,默认 8px */
  boundaryPadding?: number;
  /** 更新延迟(ms),用于防抖,默认 0 */
  updateDelay?: number;
  /** 边界容器元素,用于限制菜单显示范围 */
  boundaryElement?: HTMLElement | null;
}

/**
 * 自定义 BubbleMenu 组件
 *
 * 使用 Floating UI 实现精确的位置计算和边界检测
 * 支持自定义显示逻辑、位置配置和性能优化
 */
export const CustomBubbleMenu: React.FC<CustomBubbleMenuProps> = ({
  editor,
  children,
  className = '',
  shouldShow,
  placement = 'top',
  offsetDistance = 8,
  boundaryPadding = 8,
  updateDelay = 0,
  boundaryElement,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const updateTimerRef = useRef<number | null>(null);

  /**
   * 更新菜单位置和可见性
   */
  const updateMenu = useCallback(() => {
    if (!editor || !menuRef.current) return;

    const { state, view } = editor;
    const { selection } = state;
    const { empty, from, to } = selection;

    // 基础判断：空选区或不可编辑时隐藏
    if (empty || !editor.isEditable) {
      setIsVisible(false);

      return;
    }

    // 自定义显示逻辑判断
    if (shouldShow) {
      const shouldShowResult = shouldShow({
        editor,
        view,
        state,
        oldState: state,
        from,
        to,
      });

      if (!shouldShowResult) {
        setIsVisible(false);

        return;
      }
    }

    // 显示菜单
    setIsVisible(true);

    // 创建虚拟元素代表选区位置
    const virtualElement = {
      getBoundingClientRect: () => {
        const start = view.coordsAtPos(from);
        const end = view.coordsAtPos(to);

        return {
          top: Math.min(start.top, end.top),
          bottom: Math.max(start.bottom, end.bottom),
          left: Math.min(start.left, end.left),
          right: Math.max(start.right, end.right),
          width: Math.abs(end.right - start.left),
          height: Math.abs(end.bottom - start.top),
          x: Math.min(start.left, end.left),
          y: Math.min(start.top, end.top),
        };
      },
    };

    // 使用传入的边界容器或编辑器容器作为边界
    const boundary = boundaryElement || view.dom.parentElement || document.body;

    // 计算位置
    computePosition(virtualElement, menuRef.current, {
      placement,
      middleware: [
        offset(offsetDistance),
        flip({
          fallbackPlacements: ['bottom', 'top'],
          padding: boundaryPadding,
        }),
        shift({
          padding: boundaryPadding,
          boundary,
        }),
      ],
    }).then(({ x, y }) => {
      if (menuRef.current) {
        Object.assign(menuRef.current.style, {
          left: `${x}px`,
          top: `${y}px`,
        });
      }
    });
  }, [editor, shouldShow, placement, offsetDistance, boundaryPadding, boundaryElement]);

  /**
   * 带防抖的更新函数
   */
  const debouncedUpdate = useCallback(() => {
    if (updateTimerRef.current !== null) {
      window.clearTimeout(updateTimerRef.current);
    }

    if (updateDelay > 0) {
      updateTimerRef.current = window.setTimeout(updateMenu, updateDelay);
    } else {
      updateMenu();
    }
  }, [updateMenu, updateDelay]);

  useEffect(() => {
    if (!editor || !menuRef.current) return;

    const menuEl = menuRef.current;

    // 监听编辑器事件
    const handleSelectionUpdate = () => debouncedUpdate();
    const handleTransaction = () => debouncedUpdate();
    const handleBlur = () => setIsVisible(false);

    // 自动更新位置(处理滚动、窗口大小变化等)
    const cleanup = autoUpdate(
      {
        getBoundingClientRect: () => {
          const { selection } = editor.state;

          if (selection.empty) {
            return new DOMRect();
          }

          const { from, to } = selection;
          const start = editor.view.coordsAtPos(from);
          const end = editor.view.coordsAtPos(to);

          return new DOMRect(
            Math.min(start.left, end.left),
            Math.min(start.top, end.top),
            Math.abs(end.right - start.left),
            Math.abs(end.bottom - start.top),
          );
        },
      },
      menuEl,
      debouncedUpdate,
      {
        animationFrame: true, // 使用 requestAnimationFrame 优化性能
      },
    );

    editor.on('selectionUpdate', handleSelectionUpdate);
    editor.on('transaction', handleTransaction);
    editor.on('blur', handleBlur);

    // 初始更新
    debouncedUpdate();

    return () => {
      editor.off('selectionUpdate', handleSelectionUpdate);
      editor.off('transaction', handleTransaction);
      editor.off('blur', handleBlur);
      cleanup();

      if (updateTimerRef.current !== null) {
        window.clearTimeout(updateTimerRef.current);
      }
    };
  }, [editor, debouncedUpdate]);

  const menuStyle: React.CSSProperties = {
    position: 'fixed',
    zIndex: 9999,
    visibility: isVisible ? 'visible' : 'hidden',
    opacity: isVisible ? 1 : 0,
    transition: 'opacity 0.15s ease-in-out',
    pointerEvents: isVisible ? 'auto' : 'none',
  };

  return createPortal(
    <div ref={menuRef} style={menuStyle} className={className}>
      {children}
    </div>,
    document.body,
  );
};
