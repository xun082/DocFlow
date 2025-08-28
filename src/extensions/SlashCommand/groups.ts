import { Group } from './types';

export const GROUPS: Group[] = [
  {
    name: 'format',
    title: 'Format',
    commands: [
      {
        name: 'heading1',
        label: 'Heading 1',
        iconName: 'Heading1',
        description: 'High priority section title',
        aliases: ['h1'],
        action: (editor) => {
          editor.chain().focus().setHeading({ level: 1 }).run();
        },
      },
      {
        name: 'heading2',
        label: 'Heading 2',
        iconName: 'Heading2',
        description: 'Medium priority section title',
        aliases: ['h2'],
        action: (editor) => {
          editor.chain().focus().setHeading({ level: 2 }).run();
        },
      },
      {
        name: 'heading3',
        label: 'Heading 3',
        iconName: 'Heading3',
        description: 'Low priority section title',
        aliases: ['h3'],
        action: (editor) => {
          editor.chain().focus().setHeading({ level: 3 }).run();
        },
      },
      {
        name: 'heading4',
        label: 'Heading 4',
        iconName: 'Heading4',
        description: 'Subsection title',
        aliases: ['h4'],
        action: (editor) => {
          editor.chain().focus().setHeading({ level: 4 }).run();
        },
      },
      {
        name: 'heading5',
        label: 'Heading 5',
        iconName: 'Heading5',
        description: 'Minor section title',
        aliases: ['h5'],
        action: (editor) => {
          editor.chain().focus().setHeading({ level: 5 }).run();
        },
      },
      {
        name: 'heading6',
        label: 'Heading 6',
        iconName: 'Heading6',
        description: 'Smallest section title',
        aliases: ['h6'],
        action: (editor) => {
          editor.chain().focus().setHeading({ level: 6 }).run();
        },
      },
      {
        name: 'bulletList',
        label: 'Bullet List',
        iconName: 'List',
        description: 'Unordered list of items',
        aliases: ['ul'],
        action: (editor) => {
          editor.chain().focus().toggleBulletList().run();
        },
      },
      {
        name: 'numberedList',
        label: 'Numbered List',
        iconName: 'ListOrdered',
        description: 'Ordered list of items',
        aliases: ['ol'],
        action: (editor) => {
          editor.chain().focus().toggleOrderedList().run();
        },
      },
      {
        name: 'taskList',
        label: 'Task List',
        iconName: 'ListTodo',
        description: 'Task list with todo items',
        aliases: ['todo'],
        action: (editor) => {
          editor.chain().focus().toggleTaskList().run();
        },
      },
      {
        name: 'toggleList',
        label: 'Toggle List',
        iconName: 'ListCollapse',
        description: 'Toggles can show and hide content',
        aliases: ['toggle'],
        action: (editor) => {
          editor.chain().focus().setDetails().run();
        },
      },
      {
        name: 'blockquote',
        label: 'Blockquote',
        iconName: 'Quote',
        description: 'Element for quoting',
        action: (editor) => {
          editor.chain().focus().setBlockquote().run();
        },
      },
      {
        name: 'codeBlock',
        label: 'Code Block',
        iconName: 'SquareCode',
        description: 'Code block with syntax highlighting',
        shouldBeHidden: (editor) => editor.isActive('columns'),
        action: (editor) => {
          editor.chain().focus().toggleCodeBlock().run();
        },
      },
    ],
  },
  {
    name: 'insert',
    title: 'Insert',
    commands: [
      {
        name: 'table',
        label: 'Table',
        iconName: 'Table',
        description: 'Insert a table',
        shouldBeHidden: (editor) => editor.isActive('columns'),
        action: (editor) => {
          editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: false }).run();
        },
      },
      {
        name: 'image',
        label: 'Image',
        iconName: 'Image',
        description: 'Insert an image',
        aliases: ['img'],
        action: (editor) => {
          editor.chain().focus().setImageUpload().run();
        },
      },
      {
        name: 'columns',
        label: 'Columns',
        iconName: 'Columns2',
        description: 'Add two column content',
        aliases: ['cols'],
        shouldBeHidden: (editor) => editor.isActive('columns'),
        action: (editor) => {
          editor
            .chain()
            .focus()
            .setColumns()
            .focus(editor.state.selection.head - 1)
            .run();
        },
      },
      {
        name: 'horizontalRule',
        label: 'Horizontal Rule',
        iconName: 'Minus',
        description: 'Insert a horizontal divider',
        aliases: ['hr'],
        action: (editor) => {
          editor.chain().focus().setHorizontalRule().run();
        },
      },
      {
        name: 'toc',
        label: 'Table of Contents',
        iconName: 'Book',
        aliases: ['outline'],
        description: 'Insert a table of contents',
        shouldBeHidden: (editor) => editor.isActive('columns'),
        action: (editor) => {
          editor.chain().focus().insertTableOfContents().run();
        },
      },
      {
        name: 'audio',
        label: 'Audio',
        iconName: 'Volume2',
        description: 'Insert an audio player',
        aliases: ['sound', 'music'],
        action: (editor) => {
          editor.chain().focus().setAudio({ src: '' }).run();
        },
      },
      {
        name: 'excalidraw',
        label: 'Excalidraw',
        iconName: 'Image',
        description: 'Insert an Excalidraw diagram',
        aliases: ['excalidraw'],
        action: (editor) => {
          editor.chain().focus().setExcalidrawImage({ type: '' }).run();
          // window.open(`${window.location.origin}/excalidraw`);
        },
      },
      {
        name: 'ai',
        label: 'AI Assistant',
        iconName: 'Bot',
        description: 'Insert an AI assistant block',
        aliases: ['ai', 'assistant', 'gpt'],
        action: (editor) => {
          editor.chain().focus().setAI({ prompt: '', context: '' }).run();
        },
      },
    ],
  },
];

export default GROUPS;
