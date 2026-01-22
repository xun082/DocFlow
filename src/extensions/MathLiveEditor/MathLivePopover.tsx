import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Editor } from '@tiptap/core';

import { MathLiveEditor } from './MathLiveEditor';

export interface MathLivePopoverProps {
  editor: Editor;
  onInsert: (latex: string) => void;
  onCancel: () => void;
}

export const MathLivePopover: React.FC<MathLivePopoverProps> = ({ onInsert, onCancel }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || typeof window === 'undefined') return null;

  return createPortal(
    <>
      {/* 遮罩层 */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 9999,
        }}
        onClick={onCancel}
      />
      {/* 编辑器容器 */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 10000,
          maxWidth: '90vw',
          maxHeight: '90vh',
          overflow: 'auto',
        }}
      >
        <MathLiveEditor initialValue="" onInsert={onInsert} onCancel={onCancel} />
      </div>
    </>,
    document.body,
  );
};
