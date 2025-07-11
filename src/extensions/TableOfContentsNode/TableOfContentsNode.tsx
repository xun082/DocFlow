import { Node, NodeViewRendererProps } from '@tiptap/core';
import { NodeViewWrapper, ReactNodeViewRenderer, useEditorState } from '@tiptap/react';
import { memo } from 'react';
import { TableOfContentsStorage } from '@tiptap-pro/extension-table-of-contents';
import { Editor as CoreEditor } from '@tiptap/core';

import { cn } from '@/utils/utils';

export type TableOfContentsProps = {
  editor: CoreEditor;
  onItemClick?: () => void;
};

export const TableOfContents = memo(({ editor, onItemClick }: TableOfContentsProps) => {
  const content = useEditorState({
    editor,
    selector: (ctx) => {
      return (ctx.editor.storage.tableOfContents as TableOfContentsStorage).content;
    },
    equalityFn: (a, b) => a === b,
  });

  if (content.length === 0) {
    return <div className="text-center text-neutral-400 py-4 text-sm">添加标题创建目录</div>;
  }

  // 根据标题级别获取样式
  const getHeadingStyles = (level: number, isActive: boolean) => {
    // 基础样式
    const baseStyles = cn(
      'block py-1 rounded hover:bg-neutral-50 transition-colors w-full overflow-hidden text-ellipsis',
      isActive ? 'text-blue-600 bg-blue-50/50' : 'text-neutral-700',
    );

    // 根据级别返回不同字体大小和粗细
    switch (level) {
      case 1:
        return cn(baseStyles, 'text-sm font-semibold');
      case 2:
        return cn(baseStyles, 'text-sm');
      default:
        return cn(baseStyles, 'text-xs text-neutral-600');
    }
  };

  return (
    <nav>
      {content.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          onClick={onItemClick}
          className={getHeadingStyles(item.level, item.isActive)}
          style={{
            paddingLeft: `${item.level * 8}px`,
          }}
        >
          <span className="pr-1.5 text-neutral-400">{item.itemIndex}</span>
          {item.textContent}
        </a>
      ))}
    </nav>
  );
});

TableOfContents.displayName = 'TableOfContents';

const TableOfNodeContent = (props: NodeViewRendererProps) => {
  const { editor } = props;

  return (
    <NodeViewWrapper>
      <div className="p-2 -m-2 rounded-lg" contentEditable={false}>
        <TableOfContents editor={editor} />
      </div>
    </NodeViewWrapper>
  );
};

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    tableOfContentsNode: {
      insertTableOfContents: () => ReturnType;
    };
  }
}

export const TableOfContentsNode = Node.create({
  name: 'tableOfContentsNode',
  group: 'block',
  atom: true,
  selectable: true,
  draggable: true,
  inline: false,

  parseHTML() {
    return [
      {
        tag: 'div[data-type="table-of-content"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', { ...HTMLAttributes, 'data-type': 'table-of-content' }];
  },

  addNodeView() {
    return ReactNodeViewRenderer(TableOfNodeContent);
  },

  addCommands() {
    return {
      insertTableOfContents:
        () =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
          });
        },
    };
  },
});
