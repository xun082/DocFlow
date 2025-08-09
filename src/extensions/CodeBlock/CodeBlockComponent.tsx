'use client';

import './CodeBlockComponent.scss';
import { NodeViewContent, NodeViewWrapper } from '@tiptap/react';
import React, { useState, useRef } from 'react';
import type { ReactNodeViewProps } from '@tiptap/react';
import { CheckIcon, ChevronsUpDownIcon, Code2Icon } from 'lucide-react';
import { js as jsBeautify, html as htmlBeautify, css as cssBeautify } from 'js-beautify';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/utils/utils';

interface CodeBlockComponentProps extends Omit<ReactNodeViewProps, 'getPos'> {
  editor: any;
  getPos: () => number | undefined;
}

function CodeBlockComponent(props: CodeBlockComponentProps) {
  const { node, updateAttributes, extension, editor, getPos } = props;
  const defaultLanguage = node.attrs.language || 'null';

  const {
    theme = 'auto',
    showLineNumbers = false,
    maxHeight,
    customLanguages = [],
    onLanguageChange,
    onCopy,
  } = extension.options;

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isWordWrap, setIsWordWrap] = useState(false);
  const [copied, setCopied] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [isFormatting, setIsFormatting] = useState(false);
  const codeBlockRef = useRef<HTMLDivElement>(null);

  // 获取所有可用语言，合并自定义语言
  const languages = [
    { value: 'null', label: '自动检测' },
    ...customLanguages,
    ...extension.options.lowlight
      .listLanguages()
      .filter(
        (lang: string) =>
          !customLanguages.some(
            (custom: { value: string; label: string }) => custom.value === lang,
          ),
      )
      .map((lang: string) => ({
        value: lang,
        label: lang.charAt(0).toUpperCase() + lang.slice(1),
      })),
  ];

  const selectedLanguage = languages.find((lang) => lang.value === defaultLanguage);

  const handleCopy = async () => {
    try {
      const codeElement = codeBlockRef.current?.querySelector('pre code');
      const codeText = codeElement?.textContent || '';
      await navigator.clipboard.writeText(codeText);
      setCopied(true);
      // 使用 setTimeout 延迟状态更新，避免在渲染期间更新
      setTimeout(() => setCopied(false), 2000);
      onCopy?.(codeText);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  const handleLanguageChange = (language: string) => {
    // 使用 setTimeout 延迟更新，避免在渲染期间更新
    setTimeout(() => {
      updateAttributes({ language });
      onLanguageChange?.(language);
    }, 0);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleWordWrap = () => {
    setIsWordWrap(!isWordWrap);
  };

  // 自动格式化功能
  const handleFormat = async () => {
    try {
      setIsFormatting(true);

      // 获取当前代码块的内容
      const pos = getPos();

      if (pos === undefined) {
        setIsFormatting(false);

        return;
      }

      const currentCode = node.textContent || '';

      if (!currentCode.trim()) {
        setIsFormatting(false);

        return;
      }

      let formattedCode = currentCode;

      // js-beautify 配置选项
      const beautifyOptions = {
        indent_size: 2,
        indent_char: ' ',
        max_preserve_newlines: 2,
        preserve_newlines: true,
        keep_array_indentation: false,
        break_chained_methods: false,
        indent_scripts: 'normal' as const,
        brace_style: 'collapse' as const,
        space_before_conditional: true,
        unescape_strings: false,
        jslint_happy: false,
        end_with_newline: false,
        wrap_line_length: 0,
        indent_inner_html: false,
        comma_first: false,
        e4x: false,
        indent_empty_lines: false,
      };

      // 根据语言类型进行格式化
      switch (defaultLanguage) {
        case 'javascript':
        case 'js':
        case 'typescript':
        case 'ts':
        case 'jsx':
        case 'tsx':
          formattedCode = jsBeautify(currentCode, beautifyOptions);
          break;
        case 'json':
          try {
            const parsed = JSON.parse(currentCode);
            formattedCode = JSON.stringify(parsed, null, 2);
          } catch {
            formattedCode = jsBeautify(currentCode, beautifyOptions);
          }

          break;
        case 'css':
        case 'scss':
        case 'sass':
        case 'less':
          formattedCode = cssBeautify(currentCode, {
            indent_size: 2,
            indent_char: ' ',
            max_preserve_newlines: 2,
            preserve_newlines: true,
            newline_between_rules: true,
            end_with_newline: false,
            indent_empty_lines: false,
            space_around_combinator: true,
          });
          break;
        case 'html':
        case 'xml':
        case 'vue':
        case 'svelte':
          formattedCode = htmlBeautify(currentCode, {
            indent_size: 2,
            indent_char: ' ',
            max_preserve_newlines: 2,
            preserve_newlines: true,
            indent_inner_html: true,
            indent_scripts: 'keep' as const,
            end_with_newline: false,
            extra_liners: ['head', 'body', '/html'],
            wrap_attributes: 'auto' as const,
            wrap_attributes_indent_size: 2,
            unformatted: ['code', 'pre', 'em', 'strong', 'span'],
            content_unformatted: ['pre', 'textarea'],
            indent_empty_lines: false,
          });
          break;

        default:
          try {
            formattedCode = jsBeautify(currentCode, beautifyOptions);
          } catch {
            formattedCode = currentCode;
          }
      }

      // 如果格式化后的代码和原代码不同，通过 TipTap 命令更新内容
      if (formattedCode !== currentCode) {
        const codeBlockPos = pos;
        const codeBlockSize = node.nodeSize;

        // 代码内容位置：跳过开始标签，直接定位到内容
        const contentStart = codeBlockPos + 1;
        const contentEnd = codeBlockPos + codeBlockSize - 1;

        // 使用 requestAnimationFrame 延迟更新，避免同步更新
        requestAnimationFrame(() => {
          editor
            .chain()
            .command(({ tr, state }: { tr: any; state: any }) => {
              // 替换代码块内的文本内容
              tr.replaceWith(contentStart, contentEnd, state.schema.text(formattedCode));

              return true;
            })
            .run();
        });
      }
    } catch (error) {
      console.error('格式化失败:', error);
    } finally {
      // 使用 setTimeout 延迟状态更新
      setTimeout(() => setIsFormatting(false), 100);
    }
  };

  return (
    <NodeViewWrapper
      ref={codeBlockRef}
      className={`code-block ${isCollapsed ? 'collapsed' : ''} ${isWordWrap ? 'word-wrap' : ''} theme-${theme}`}
      style={{ maxHeight: maxHeight ? `${maxHeight}px` : undefined }}
    >
      <div className="code-block-header">
        <div className="language-selector">
          <Popover open={languageOpen} onOpenChange={setLanguageOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={languageOpen}
                className="h-8 w-[160px] justify-between text-xs"
              >
                {selectedLanguage?.label || '选择语言'}
                <ChevronsUpDownIcon className="ml-2 h-3 w-3 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <Command>
                <CommandInput placeholder="搜索语言..." className="h-8" />
                <CommandList>
                  <CommandEmpty>未找到语言</CommandEmpty>
                  <CommandGroup>
                    {languages.map((language) => (
                      <CommandItem
                        key={language.value}
                        value={language.value}
                        onSelect={(currentValue) => {
                          handleLanguageChange(currentValue);
                          setLanguageOpen(false);
                        }}
                      >
                        <CheckIcon
                          className={cn(
                            'mr-2 h-3 w-3',
                            defaultLanguage === language.value ? 'opacity-100' : 'opacity-0',
                          )}
                        />
                        {language.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <div className="code-block-controls">
          <button
            className={`control-btn ${isFormatting ? 'active' : ''}`}
            onClick={handleFormat}
            disabled={isFormatting}
            title={isFormatting ? '格式化中...' : '格式化代码'}
          >
            <Code2Icon width="16" height="16" />
          </button>

          <button
            className={`control-btn ${isWordWrap ? 'active' : ''}`}
            onClick={toggleWordWrap}
            title={isWordWrap ? '关闭自动换行' : '开启自动换行'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M4 6h16v2H4V6zm0 5h10v2H4v-2zm0 5h16v2H4v-2z" fill="currentColor" />
            </svg>
          </button>

          <button
            className={`control-btn ${isCollapsed ? 'active' : ''}`}
            onClick={toggleCollapse}
            title={isCollapsed ? '展开代码' : '折叠代码'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d={isCollapsed ? 'M7 14l5-5 5 5z' : 'M7 10l5 5 5-5z'} fill="currentColor" />
            </svg>
          </button>

          <button
            className={`control-btn ${copied ? 'copied' : ''}`}
            onClick={handleCopy}
            title={copied ? '已复制!' : '复制代码'}
          >
            {copied ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
                  fill="currentColor"
                />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"
                  fill="currentColor"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      <div className="code-block-content">
        <pre
          className={cn(
            'hljs',
            isWordWrap ? 'word-wrap' : '',
            showLineNumbers ? 'line-numbers' : '',
          )}
        >
          <NodeViewContent as="div" />
        </pre>
      </div>
    </NodeViewWrapper>
  );
}

export default CodeBlockComponent;
