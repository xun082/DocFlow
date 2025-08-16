import React, { JSX, useCallback, useEffect, useRef, useState } from 'react';
import { useEditorState } from '@tiptap/react';
import { BubbleMenu as BaseBubbleMenu } from '@tiptap/react/menus';

import { Surface } from '@/components/ui/Surface';
import { Toolbar } from '@/components/ui/Toolbar';
import { Icon } from '@/components/ui/Icon';
import { MenuProps } from '@/components/menus/types';

export const ImageMenu = ({ editor }: MenuProps): JSX.Element | null => {
  const shouldShow = useCallback(() => editor.isActive('imageBlock'), [editor]);
  const { align, width } = useEditorState({
    editor,
    selector: (ctx) => {
      const attrs = ctx.editor.getAttributes('imageBlock');
      const widthStr = attrs.width || '100%';
      const numericWidth =
        typeof widthStr === 'string' ? parseInt(widthStr.replace('%', ''), 10) : 100;

      return {
        align: (attrs.align as 'left' | 'center' | 'right') || 'center',
        width: Number.isFinite(numericWidth) ? Math.max(0, Math.min(100, numericWidth)) : 100,
      } as { align: 'left' | 'center' | 'right'; width: number };
    },
  });

  // 本地滑块 UI 状态，保证拖动时数值即时更新
  const [tempWidth, setTempWidth] = useState<number>(width);
  const rafIdRef = useRef<number | null>(null);

  // 当编辑器中的宽度变化（外部更新或选中不同图片）时，同步本地状态
  useEffect(() => {
    setTempWidth(width);
  }, [width]);

  const setAlign = useCallback(
    (value: 'left' | 'center' | 'right') => {
      editor.chain().focus().setImageBlockAlign(value).run();
    },
    [editor],
  );

  const setWidth = useCallback(
    (value: number) => {
      // 先更新本地 UI，保证滑动时百分比即时变化
      setTempWidth(value);

      // 使用 rAF 节流提交到编辑器，避免高频事务卡顿
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }

      rafIdRef.current = requestAnimationFrame(() => {
        editor.chain().focus().setImageBlockWidth(value).run();
        rafIdRef.current = null;
      });
    },
    [editor],
  );

  return (
    <BaseBubbleMenu
      editor={editor}
      pluginKey="imageMenu"
      shouldShow={shouldShow}
      updateDelay={0}
      options={{
        flip: false,
        onUpdate: () => {
          // 强制刷新以便在拖拽时更新 UI
        },
      }}
    >
      <Surface className="p-1">
        <Toolbar.Wrapper>
          <Toolbar.Button
            tooltip="Align left"
            onClick={() => setAlign('left')}
            active={align === 'left'}
          >
            <Icon name="AlignLeft" />
          </Toolbar.Button>
          <Toolbar.Button
            tooltip="Align center"
            onClick={() => setAlign('center')}
            active={align === 'center'}
          >
            <Icon name="AlignCenter" />
          </Toolbar.Button>
          <Toolbar.Button
            tooltip="Align right"
            onClick={() => setAlign('right')}
            active={align === 'right'}
          >
            <Icon name="AlignRight" />
          </Toolbar.Button>

          <Toolbar.Divider />

          <div className="flex items-center px-1 gap-2 min-w-[180px]">
            <span className="text-xs text-slate-500">宽度</span>
            <input
              type="range"
              min={10}
              max={100}
              step={5}
              value={tempWidth}
              onChange={(e) => setWidth(parseInt(e.target.value, 10))}
              className="w-28 accent-slate-600"
            />
            <span className="text-xs w-10 text-right text-slate-600">{tempWidth}%</span>
          </div>

          <Toolbar.Divider />

          <Toolbar.Button tooltip="25%" onClick={() => setWidth(25)} active={tempWidth === 25}>
            25%
          </Toolbar.Button>
          <Toolbar.Button tooltip="50%" onClick={() => setWidth(50)} active={tempWidth === 50}>
            50%
          </Toolbar.Button>
          <Toolbar.Button tooltip="75%" onClick={() => setWidth(75)} active={tempWidth === 75}>
            75%
          </Toolbar.Button>
          <Toolbar.Button tooltip="100%" onClick={() => setWidth(100)} active={tempWidth === 100}>
            100%
          </Toolbar.Button>
        </Toolbar.Wrapper>
      </Surface>
    </BaseBubbleMenu>
  );
};

export default ImageMenu;
