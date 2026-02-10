import { Bilibili } from '@syncflow/bilibili';
import { Editor } from '@tiptap/react';
import { createRoot } from 'react-dom/client';
import React from 'react';

import { BilibiliDialog } from './BilibiliDialog';

if (!Bilibili) {
  console.error('Bilibili extension import failed. Please check @syncflow/bilibili package.');
}

// 创建弹窗容器
let dialogContainer: HTMLDivElement | null = null;
let dialogRoot: ReturnType<typeof createRoot> | null = null;

const createDialogContainer = () => {
  if (!dialogContainer) {
    dialogContainer = document.createElement('div');
    dialogContainer.id = 'bilibili-dialog-container';
    dialogContainer.style.zIndex = '9999999999';
    dialogContainer.style.position = 'relative';
    document.body.appendChild(dialogContainer);
    dialogRoot = createRoot(dialogContainer);
  }

  return { dialogContainer, dialogRoot };
};

const showBilibiliDialog = (editor: Editor) => {
  const { dialogRoot } = createDialogContainer();

  const closeDialog = () => {
    const { dialogRoot: currentRoot } = createDialogContainer();

    if (currentRoot) {
      currentRoot.render(null);
    }
  };

  const DialogComponent = React.createElement(BilibiliDialog, {
    editor,
    isOpen: true,
    onClose: closeDialog,
  });

  if (dialogRoot) {
    dialogRoot.render(DialogComponent);
  }
};

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    bilibiliDialog: {
      openBilibiliDialog: () => ReturnType;
    };
  }
}

export const BilibiliExtension = Bilibili.extend({
  addCommands() {
    return {
      ...this.parent?.(),
      openBilibiliDialog:
        () =>
        ({ editor }) => {
          showBilibiliDialog(editor as Editor);

          return true;
        },
    };
  },

  onCreate() {
    // 监听全局事件
    const handleOpenDialog = (event: Event) => {
      const customEvent = event as CustomEvent;

      if (customEvent.detail?.editor) {
        showBilibiliDialog(customEvent.detail.editor as Editor);
      } else if (this.editor) {
        showBilibiliDialog(this.editor as Editor);
      }
    };

    window.addEventListener('openBilibiliDialog', handleOpenDialog);

    // 清理函数
    this.storage.cleanup = () => {
      window.removeEventListener('openBilibiliDialog', handleOpenDialog);

      if (dialogContainer) {
        document.body.removeChild(dialogContainer);
        dialogContainer = null;
        dialogRoot = null;
      }
    };
  },

  onDestroy() {
    if (this.storage.cleanup) {
      this.storage.cleanup();
    }
  },
});

export default BilibiliExtension;
