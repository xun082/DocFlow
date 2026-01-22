import { Group } from './types';

export const GROUPS: Group[] = [
  {
    name: 'ai',
    title: 'AI',
    commands: [
      {
        name: 'askAI',
        label: 'Ask AI',
        iconName: 'Bot',
        description: 'Insert an AI assistant block',
        aliases: ['ai', 'assistant', 'gpt'],
        action: (editor) => {
          editor.chain().focus().setAI({ prompt: '', op: 'ask', aiState: 'input' }).run();
        },
      },
      {
        name: 'continueWriting',
        label: 'Continue Writing',
        iconName: 'Bot',
        description: 'AI continues writing based on context',
        aliases: ['continue', 'write'],
        action: (editor) => {
          const previousNode = editor.state.doc.resolve(editor.state.selection.anchor - 1).node();
          const previousNodeContent = previousNode.textContent;
          editor
            .chain()
            .focus()
            .setAI({ prompt: previousNodeContent, op: 'continue', aiState: 'input' })
            .run();
        },
      },
      {
        name: 'textToImage',
        label: 'Text to Image',
        iconName: 'Image',
        description: 'Generate image from text description',
        aliases: ['image', 'img', 'generate', 'draw'],
        action: (editor) => {
          editor.chain().focus().setTextToImage().run();
        },
      },
    ],
  },
  {
    name: 'format',
    title: 'Style',
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
        name: 'alertInfo',
        label: 'Info Alert',
        iconName: 'Info',
        description: 'Information alert box',
        aliases: ['info', 'alert info'],
        action: (editor) => {
          editor.chain().focus().setAlert('info').run();
        },
      },
      {
        name: 'alertWarning',
        label: 'Warning Alert',
        iconName: 'AlertTriangle',
        description: 'Warning alert box',
        aliases: ['warning', 'alert warning', 'warn'],
        action: (editor) => {
          editor.chain().focus().setAlert('warning').run();
        },
      },
      {
        name: 'alertDanger',
        label: 'Danger Alert',
        iconName: 'AlertCircle',
        description: 'Danger alert box',
        aliases: ['danger', 'alert danger', 'error'],
        action: (editor) => {
          editor.chain().focus().setAlert('danger').run();
        },
      },
      {
        name: 'alertSuccess',
        label: 'Success Alert',
        iconName: 'CheckCircle',
        description: 'Success alert box',
        aliases: ['success', 'alert success', 'check'],
        action: (editor) => {
          editor.chain().focus().setAlert('success').run();
        },
      },
      {
        name: 'alertNote',
        label: 'Note Alert',
        iconName: 'FileText',
        description: 'Note alert box',
        aliases: ['note', 'alert note'],
        action: (editor) => {
          editor.chain().focus().setAlert('note').run();
        },
      },
      {
        name: 'alertTip',
        label: 'Tip Alert',
        iconName: 'Lightbulb',
        description: 'Tip alert box',
        aliases: ['tip', 'alert tip', 'hint'],
        action: (editor) => {
          editor.chain().focus().setAlert('tip').run();
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
        name: 'mathFormula',
        label: '数学公式',
        iconName: 'Sigma',
        description: '插入数学公式（行内或块级）',
        aliases: ['math', 'formula', 'equation', 'latex', '公式', '数学'],
        action: (editor) => {
          editor.chain().focus().openMathLiveEditor().run();
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
            .setColumns(2)
            .updateAttributes('columns', { rows: 2 })
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
        name: 'youtube',
        label: 'YouTube Video',
        iconName: 'Youtube',
        description: 'Insert a YouTube video',
        aliases: ['video', 'yt'],
        action: (editor) => {
          // 触发 YouTube 弹窗事件
          const event = new CustomEvent('openYoutubeDialog', { detail: { editor } });
          window.dispatchEvent(event);
        },
      },
      {
        name: 'bilibili',
        label: 'Bilibili Video',
        iconName: 'Tv',
        description: 'Insert a Bilibili video',
        aliases: ['bili'],
        action: (editor) => {
          console.log('Bilibili');
          editor.chain().focus().setBilibili({ src: '' }).run();
        },
      },
      {
        name: 'chart',
        label: 'Chart',
        iconName: 'ChartColumnBig',
        description: 'Insert a chart',
        aliases: ['chart', 'graph'],
        action: (editor) => {
          editor
            .chain()
            .focus()
            .setChart({
              type: 'bar',
              colorKey: 'red',
              data: [
                {
                  month: 'January',
                  desktop: 186,
                  mobile: 80,
                  tablet: 45,
                },
                {
                  month: 'February',
                  desktop: 305,
                  mobile: 200,
                  tablet: 95,
                },
                {
                  month: 'March',
                  desktop: 237,
                  mobile: 120,
                  tablet: 78,
                },
                {
                  month: 'April',
                  desktop: 73,
                  mobile: 190,
                  tablet: 62,
                },
              ],
              xAxisKey: 'month',
              yAxisKeys: ['desktop'],
              title: 'Sample Chart',
            })
            .run();
        },
      },
      {
        name: 'countdown',
        label: 'Countdown',
        iconName: 'Timer',
        description: 'Insert a countdown timer',
        aliases: ['countdown'],
        action: (editor) => {
          editor.chain().focus().setCountdown({ targetDate: '' }).run();
        },
      },
      {
        name: 'gantt',
        label: 'Gantt Chart',
        iconName: 'CalendarRange',
        description: 'Insert a Gantt chart for project planning',
        aliases: ['gantt', 'timeline', 'project'],
        action: (editor) => {
          editor.chain().focus().setGantt().run();
        },
      },
    ],
  },
];

export default GROUPS;
