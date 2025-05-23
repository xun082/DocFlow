import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { EditorView } from '@tiptap/pm/view';

export interface DragHandlerOptions {
  /**
   * 是否启用拖拽功能
   * @default true
   */
  enabled?: boolean;

  /**
   * 允许拖拽的块类型列表
   * @default ['text', 'image', 'list', 'table', 'mindmap', 'chart', 'custom']
   */
  allowedBlockTypes?: string[];

  /**
   * 拖拽时的自定义样式类名
   */
  dragOverClassName?: string;
}

export const DragHandlerKey = new PluginKey('dragHandler');

export const DragHandler = Extension.create<DragHandlerOptions>({
  name: 'dragHandler',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: DragHandlerKey,
        props: {
          handleDOMEvents: {
            dragover: (view: EditorView, event: DragEvent) => {
              if (!event.dataTransfer) return false;

              // Check if this is a block being dragged from our sidebar
              if (event.dataTransfer.types.includes('application/x-block-type')) {
                // Show a drop indicator by adding a class to the editor
                const editorElement = view.dom.parentElement;

                if (editorElement) {
                  editorElement.classList.add('drag-over');
                }

                // Allow the drop
                event.preventDefault();

                return true;
              }

              return false;
            },

            dragleave: (view: EditorView) => {
              // Remove drop indicator class
              const editorElement = view.dom.parentElement;

              if (editorElement) {
                editorElement.classList.remove('drag-over');
              }

              return false;
            },

            drop: (view: EditorView, event: DragEvent) => {
              if (!event.dataTransfer) return false;

              // Remove drop indicator class
              const editorElement = view.dom.parentElement;

              if (editorElement) {
                editorElement.classList.remove('drag-over');
              }

              // Check if this is a block drop from our sidebar
              const blockType = event.dataTransfer.getData('application/x-block-type');

              if (blockType) {
                // Calculate the position where to insert the block
                const coordinates = { left: event.clientX, top: event.clientY };
                const { pos } = view.posAtCoords(coordinates) || { pos: 0 };

                // Insert the content at the drop position
                const content = createContentForBlockType(blockType);
                this.editor.chain().focus().insertContentAt(pos, content).run();

                event.preventDefault();

                return true;
              }

              return false;
            },
          },
        },
      }),
    ];
  },
});

// Helper function to create appropriate content for different block types
function createContentForBlockType(blockType: string) {
  switch (blockType) {
    case 'text':
      return { type: 'paragraph', content: [{ type: 'text', text: '在此输入文本' }] };
    case 'image':
      return { type: 'imageUpload' };
    case 'list':
      return {
        type: 'bulletList',
        content: [
          {
            type: 'listItem',
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: '列表项' }],
              },
            ],
          },
        ],
      };
    case 'table':
      return {
        type: 'table',
        content: [
          {
            type: 'tableRow',
            content: [
              { type: 'tableCell', content: [{ type: 'paragraph' }] },
              { type: 'tableCell', content: [{ type: 'paragraph' }] },
            ],
          },
          {
            type: 'tableRow',
            content: [
              { type: 'tableCell', content: [{ type: 'paragraph' }] },
              { type: 'tableCell', content: [{ type: 'paragraph' }] },
            ],
          },
        ],
      };
    case 'mindmap':
      return {
        type: 'mindMapBlock',
        attrs: {
          data: {
            id: 1,
            label: '新思维导图',
            children: [
              {
                id: 2,
                label: '主题一',
                children: [
                  { id: 3, label: '子主题1' },
                  { id: 4, label: '子主题2' },
                ],
              },
              {
                id: 5,
                label: '主题二',
                children: [
                  { id: 6, label: '子主题3' },
                  { id: 7, label: '子主题4' },
                ],
              },
            ],
          },
        },
      };
    case 'chart':
      return {
        type: 'chartBlock',
        attrs: {
          config: {
            type: 'bar',
            title: '新建图表',
            theme: 'macarons',
            data: [
              { name: 'A', value: 120 },
              { name: 'B', value: 200 },
              { name: 'C', value: 150 },
              { name: 'D', value: 180 },
            ],
            options: {},
          },
        },
      };
    case 'custom':
      return { type: 'customBlock' };
    default:
      return { type: 'paragraph' };
  }
}
