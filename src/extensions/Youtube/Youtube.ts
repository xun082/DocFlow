import Youtube from '@tiptap/extension-youtube';
import { Editor } from '@tiptap/react';
import { createRoot } from 'react-dom/client';
import React from 'react';

import { YoutubeDialog } from './YoutubeDialog';

// 创建弹窗容器
let dialogContainer: HTMLDivElement | null = null;
let dialogRoot: ReturnType<typeof createRoot> | null = null;

const createDialogContainer = () => {
  if (!dialogContainer) {
    dialogContainer = document.createElement('div');
    dialogContainer.id = 'youtube-dialog-container';
    document.body.appendChild(dialogContainer);
    dialogRoot = createRoot(dialogContainer);
  }

  return { dialogContainer, dialogRoot };
};

const showYoutubeDialog = (editor: Editor) => {
  const { dialogRoot } = createDialogContainer();

  const closeDialog = () => {
    const { dialogRoot: currentRoot } = createDialogContainer();

    if (currentRoot) {
      currentRoot.render(null);
    }
  };

  const DialogComponent = React.createElement(YoutubeDialog, {
    editor,
    isOpen: true,
    onClose: closeDialog,
  });

  if (dialogRoot) {
    dialogRoot.render(DialogComponent);
  }
};

export const YoutubeExtension = Youtube.extend({
  addCommands() {
    return {
      ...this.parent?.(),
      openYoutubeDialog:
        () =>
        ({ editor }: { editor: Editor }) => {
          showYoutubeDialog(editor);

          return true;
        },
    };
  },

  onCreate() {
    // 监听全局事件
    const handleOpenDialog = (event: Event) => {
      const customEvent = event as CustomEvent;

      if (customEvent.detail?.editor) {
        showYoutubeDialog(customEvent.detail.editor);
      } else if (this.editor) {
        showYoutubeDialog(this.editor);
      }
    };

    window.addEventListener('openYoutubeDialog', handleOpenDialog);

    // 清理函数
    this.storage.cleanup = () => {
      window.removeEventListener('openYoutubeDialog', handleOpenDialog);

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

export default YoutubeExtension;
