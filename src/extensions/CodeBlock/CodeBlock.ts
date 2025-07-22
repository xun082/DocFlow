'use client';

import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight';
import { all, createLowlight } from 'lowlight';
import { ReactNodeViewRenderer } from '@tiptap/react';

import CodeBlockComponent from './CodeBlockComponent';

const lowlight = createLowlight(all);

// 定义扩展选项接口
interface CodeBlockOptions {
  lowlight: any;
  defaultLanguage: string;
  // 自定义选项
  theme?: 'light' | 'dark' | 'auto';
  showLineNumbers?: boolean;
  maxHeight?: number;
  customLanguages?: Array<{ value: string; label: string }>;
  onLanguageChange?: (language: string) => void;
  onCopy?: (code: string) => void;
}

export const CodeBlock = CodeBlockLowlight.extend<CodeBlockOptions>({
  addOptions() {
    return {
      ...this.parent?.(),
      lowlight,
      HTMLAttributes: {
        class: 'hljs',
      },
      // 默认自定义选项
      theme: 'auto',
      showLineNumbers: false,
      maxHeight: undefined,
      customLanguages: [],
      onLanguageChange: undefined,
      onCopy: undefined,
    };
  },

  addKeyboardShortcuts() {
    return {
      Tab: () => {
        // 检查是否在代码块中
        const { state } = this.editor;
        const { $from } = state.selection;

        if ($from.parent.type.name === 'codeBlock') {
          // 在代码块中，插入2个空格的缩进
          return this.editor.commands.insertContent('  ');
        }

        return false;
      },
      'Shift-Tab': () => {
        // 检查是否在代码块中
        const { state } = this.editor;
        const { $from } = state.selection;

        if ($from.parent.type.name === 'codeBlock') {
          // 在代码块中，删除行首的缩进
          const { from, to } = state.selection;
          const text = state.doc.textBetween(from, to);
          const line = state.doc.resolve(from).parent.textContent;

          // 找到当前行的开始位置
          const lineStart = from - text.length + (line.length - line.trimStart().length);

          // 如果行首有缩进，删除最多2个空格
          if (line.startsWith('  ')) {
            const deleteFrom = Math.max(lineStart, from - 2);

            return this.editor.commands.deleteRange({ from: deleteFrom, to: from });
          }
        }

        return false;
      },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(CodeBlockComponent, {
      // 将扩展选项传递给组件（通过 extension.options 访问）
      contentDOMElementTag: 'code',
    });
  },
}).configure({
  lowlight,
  defaultLanguage: 'javascript',
  // 自定义配置示例
  theme: 'auto',
  showLineNumbers: false,
  customLanguages: [
    { value: 'vue', label: 'Vue.js' },
    { value: 'react', label: 'React JSX' },
  ],
  onLanguageChange: (language: string) => {
    console.log('语言已切换到:', language);
  },
  onCopy: (code: string) => {
    console.log('代码已复制:', code.slice(0, 50) + '...');
  },
});
