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
   * @default ['text', 'image', 'list', 'table']
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

// 策略接口
interface BlockContentStrategy {
  create(): any;
}

// 文本块策略
class TextBlockStrategy implements BlockContentStrategy {
  create() {
    return { type: 'paragraph', content: [{ type: 'text', text: '在此输入文本' }] };
  }
}

// 图片块策略
class ImageBlockStrategy implements BlockContentStrategy {
  create() {
    return {
      type: 'imageUpload',
      attrs: {
        placeholder: '点击上传图片',
        maxSize: 5 * 1024 * 1024, // 5MB
      },
    };
  }
}

// 列表块策略
class ListBlockStrategy implements BlockContentStrategy {
  create() {
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
  }
}

// 表格块策略
class TableBlockStrategy implements BlockContentStrategy {
  create() {
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
  }
}

// 代码块策略
class CodeBlockStrategy implements BlockContentStrategy {
  create() {
    return {
      type: 'codeBlock',
      attrs: {
        language: 'javascript', // 默认语言
      },
      content: [],
    };
  }
}

// 待办列表策略
class TodoListBlockStrategy implements BlockContentStrategy {
  create() {
    return {
      type: 'taskList',
      content: [
        {
          type: 'taskItem',
          attrs: {
            checked: false,
          },
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: '待办事项' }],
            },
          ],
        },
      ],
    };
  }
}

// 表情符号块策略
class EmojiBlockStrategy implements BlockContentStrategy {
  create() {
    return {
      type: 'paragraph',
      content: [{ type: 'text', text: ':' }],
      attrs: { triggerSuggestion: true },
    };
  }
}

// 默认块策略
class DefaultBlockStrategy implements BlockContentStrategy {
  create() {
    return { type: 'paragraph' };
  }
}

// 策略工厂
class BlockContentStrategyFactory {
  private static strategies = new Map<string, BlockContentStrategy>([
    ['text', new TextBlockStrategy()],
    ['image', new ImageBlockStrategy()],
    ['list', new ListBlockStrategy()],
    ['table', new TableBlockStrategy()],
    ['codeblock', new CodeBlockStrategy()],
    ['todolist', new TodoListBlockStrategy()],
    ['emoji', new EmojiBlockStrategy()],
  ]);

  static getStrategy(blockType: string): BlockContentStrategy {
    return this.strategies.get(blockType) || new DefaultBlockStrategy();
  }

  // 允许动态注册新的策略
  static registerStrategy(blockType: string, strategy: BlockContentStrategy): void {
    this.strategies.set(blockType, strategy);
  }
}

// 重构后的函数
function createContentForBlockType(blockType: string) {
  const strategy = BlockContentStrategyFactory.getStrategy(blockType);

  return strategy.create();
}
