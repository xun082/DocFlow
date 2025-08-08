'use client';

import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight';
import { all, createLowlight } from 'lowlight';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { textblockTypeInputRule } from '@tiptap/core';

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
      defaultLanguage: 'plaintext',
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
  addCommands() {
    return {
      ...this.parent?.(),
      createCodeBlock:
        () =>
        ({ commands }: any) => {
          console.log('createCodeBlock', commands);

          return commands.insertContent({
            type: this.name,
            attrs: { language: 'javascript' },
          });
        },
    };
  },
  addInputRules() {
    // 语言缩写映射
    const languageMap: Record<string, string> = {
      js: 'javascript',
      ts: 'typescript',
      py: 'python',
      rb: 'ruby',
      sh: 'bash',
      yml: 'yaml',
      md: 'markdown',
      jsx: 'javascript',
      tsx: 'typescript',
    };

    return [
      // 处理 ```语法，自动创建代码块并设置语言
      textblockTypeInputRule({
        find: /^```([a-z]*)?[\s\n]$/,
        type: this.type,
        getAttributes: (match) => {
          const inputLanguage = match[1] || 'plaintext';
          // 使用映射表转换语言，如果没有映射则使用原始输入
          const language = languageMap[inputLanguage] || inputLanguage;

          return { language };
        },
      }),
    ];
  },

  addKeyboardShortcuts() {
    const parentShortcuts = this.parent?.() || {};

    return {
      ...parentShortcuts,
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
