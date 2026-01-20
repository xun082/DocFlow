'use client';

import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { CommandProps, textblockTypeInputRule } from '@tiptap/core';

import CodeBlockComponent from './CodeBlockComponent';

// 使用 common 预设 - 包含最常用的 ~40 种语言，比 all (200+) 减少 80% 的加载时间
// common 包含: javascript, typescript, python, java, c, cpp, csharp, go, rust, php, ruby, swift, kotlin, sql, bash, json, yaml, xml, markdown, css, scss, html 等
const lowlight = createLowlight(common);

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
  onThemeChange?: (theme: string) => void;
  onCopy?: (code: string) => void;
}

export const CodeBlock = CodeBlockLowlight.extend<CodeBlockOptions>({
  priority: 300,

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
        ({ commands }: CommandProps) => {
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
  addAttributes() {
    return {
      ...(this.parent?.() || {}),
      theme: {
        default: 'default',
      },
    };
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
      'Mod-/': () => {
        // 检查是否在代码块中
        const { state } = this.editor;
        const { $from } = state.selection;

        if ($from.parent.type.name === 'codeBlock') {
          // 获取代码块的语言
          const language = $from.parent.attrs.language || 'plaintext';

          // 定义不同语言的注释符号
          const commentSymbols: Record<string, string> = {
            javascript: '//',
            typescript: '//',
            java: '//',
            c: '//',
            cpp: '//',
            csharp: '//',
            go: '//',
            rust: '//',
            swift: '//',
            kotlin: '//',
            php: '//',
            ruby: '#',
            python: '#',
            shell: '#',
            bash: '#',
            sql: '--',
            css: '/*',
            scss: '//',
            less: '//',
            json: '//',
            yaml: '#',
            xml: '<!--',
            html: '<!--',
            markdown: '<!--',
          };

          const commentSymbol = commentSymbols[language] || '//';

          // 获取选区范围
          const { from, to } = state.selection;

          // 获取代码块内容
          const codeBlockContent = $from.parent.textContent;
          const codeBlockStart = $from.start();
          const codeBlockEnd = $from.end();

          // 计算选区在代码块中的相对位置
          const relativeFrom = from - codeBlockStart;
          const relativeTo = to - codeBlockStart;

          // 找到选区涉及的所有行
          const lines = codeBlockContent.split('\n');
          const startLineIndex = codeBlockContent.substring(0, relativeFrom).split('\n').length - 1;
          const endLineIndex = codeBlockContent.substring(0, relativeTo).split('\n').length - 1;

          // 检查选中的行是否都已经注释
          let allCommented = true;

          for (let i = startLineIndex; i <= endLineIndex; i++) {
            const trimmedLine = lines[i].trimStart();

            if (!trimmedLine.startsWith(commentSymbol)) {
              allCommented = false;
              break;
            }
          }

          // 构建新的代码块内容
          const newLines = lines.map((line, index) => {
            if (index < startLineIndex || index > endLineIndex) {
              return line;
            }

            const trimmedLine = line.trimStart();
            const leadingWhitespace = line.substring(0, line.length - trimmedLine.length);

            if (allCommented) {
              // 取消注释
              if (trimmedLine.startsWith(commentSymbol)) {
                return leadingWhitespace + trimmedLine.substring(commentSymbol.length).trimStart();
              }

              return line;
            } else {
              // 添加注释
              return leadingWhitespace + commentSymbol + ' ' + trimmedLine;
            }
          });

          // 更新代码块内容 - 先删除原有内容，再插入新内容
          const newContent = newLines.join('\n');

          return this.editor
            .chain()
            .focus()
            .deleteRange({ from: codeBlockStart, to: codeBlockEnd })
            .insertContent(newContent)
            .run();
        }

        return false;
      },
    };
  },

  renderHTML({ HTMLAttributes, node }) {
    const { language } = HTMLAttributes;

    const codeContent = node.textContent || '';

    return [
      'pre',
      {
        class: 'hljs',
      },
      [
        'code',
        {
          class: language ? `language-${language}` : '',
        },
        codeContent,
      ],
    ];
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
  onThemeChange: (theme: string) => {
    console.log('主题已切换到:', theme);
  },
  onCopy: (code: string) => {
    console.log('代码已复制:', code.slice(0, 50) + '...');
  },
});
