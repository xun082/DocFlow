import React from 'react';
import type { Components } from 'react-markdown';
import hljs from 'highlight.js';

/**
 * 语法高亮组件
 */
const SyntaxHighlight: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  const language = className?.replace('language-', '') || 'plaintext';
  const codeString = String(children).replace(/\n$/, '');

  let highlightedCode = codeString;

  try {
    if (language && language !== 'plaintext') {
      highlightedCode = hljs.highlight(codeString, { language }).value;
    } else {
      highlightedCode = hljs.highlightAuto(codeString).value;
    }
  } catch (error) {
    console.warn('Syntax highlighting failed:', error);
    highlightedCode = codeString;
  }

  return (
    <code
      className={`hljs language-${language}`}
      dangerouslySetInnerHTML={{ __html: highlightedCode }}
    />
  );
};

/**
 * URL 安全验证：防止 XSS 攻击
 * 只允许 http、https、mailto 协议的链接
 */
const isValidUrl = (url: string | undefined): boolean => {
  if (!url) return false;

  try {
    const parsed = new URL(url, window.location.href);

    return ['http:', 'https:', 'mailto:'].includes(parsed.protocol);
  } catch {
    return false;
  }
};

/**
 * 统一的 ReactMarkdown 组件配置
 * 修复代码块渲染问题：正确区分行内代码和代码块
 */
export const markdownComponents: Components = {
  // 代码渲染：区分行内代码和代码块
  code: ({ className, children, ...props }) => {
    // 行内代码：单反引号，没有 className
    if (!className) {
      return (
        <code
          className="px-1.5 py-0.5 bg-gray-200 text-gray-800 rounded text-sm font-mono"
          {...props}
        >
          {children}
        </code>
      );
    }

    // 代码块：三反引号，使用语法高亮
    return (
      <SyntaxHighlight className={className} {...props}>
        {children}
      </SyntaxHighlight>
    );
  },

  // pre 标签配置
  pre: ({ children, className, ...props }) => (
    <pre className={`rounded ${className || ''}`} {...props}>
      {children}
    </pre>
  ),

  // 段落
  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,

  // 标题
  h1: ({ children }) => <h1 className="text-2xl font-bold mb-2 text-gray-900">{children}</h1>,
  h2: ({ children }) => <h2 className="text-xl font-semibold mb-2 text-gray-800">{children}</h2>,
  h3: ({ children }) => <h3 className="text-lg font-medium mb-1.5 text-gray-700">{children}</h3>,
  h4: ({ children }) => <h4 className="text-base font-medium mb-1 text-gray-700">{children}</h4>,
  h5: ({ children }) => <h5 className="text-sm font-medium mb-1 text-gray-600">{children}</h5>,
  h6: ({ children }) => <h6 className="text-sm font-normal mb-1 text-gray-600">{children}</h6>,

  // 列表
  ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
  li: ({ children }) => <li className="text-sm">{children}</li>,

  // 强调
  strong: ({ children }) => <strong className="font-semibold text-gray-800">{children}</strong>,
  em: ({ children }) => <em className="italic text-gray-700">{children}</em>,

  // 引用
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600 my-2">
      {children}
    </blockquote>
  ),

  // 链接 - 带 XSS 防护
  a: ({ children, href }) => {
    const isSafe = href && isValidUrl(href);

    return (
      <a
        href={isSafe ? href : '#'}
        className="text-blue-600 hover:text-blue-700 underline text-[12px] font-medium"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    );
  },

  // 表格
  table: ({ children }) => (
    <table className="border-collapse border border-gray-300 my-2 w-full">{children}</table>
  ),
  thead: ({ children }) => <thead className="bg-gray-100">{children}</thead>,
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => <tr className="border-b border-gray-300">{children}</tr>,
  th: ({ children }) => (
    <th className="border border-gray-300 px-3 py-2 text-left font-semibold">{children}</th>
  ),
  td: ({ children }) => <td className="border border-gray-300 px-3 py-2">{children}</td>,
};

/**
 * 紧凑版的 ReactMarkdown 组件配置（用于头脑风暴等空间受限的场景）
 */
export const compactMarkdownComponents: Components = {
  code: markdownComponents.code,
  pre: markdownComponents.pre,

  p: ({ children }) => <p className="mb-1 last:mb-0 text-[12px] leading-relaxed">{children}</p>,

  h1: ({ children }) => (
    <h1 className="text-[12px] font-bold mb-0.5 text-gray-900 leading-tight">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-[12px] font-semibold mb-0.5 text-gray-800 leading-tight">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-[12px] font-medium mb-0.5 text-gray-700 leading-tight">{children}</h3>
  ),
  h4: ({ children }) => (
    <h4 className="text-[12px] font-normal mb-0.5 text-gray-700 leading-tight">{children}</h4>
  ),
  h5: ({ children }) => (
    <h5 className="text-[11px] font-normal mb-0.5 text-gray-600 leading-tight">{children}</h5>
  ),
  h6: ({ children }) => (
    <h6 className="text-[11px] font-normal mb-0.5 text-gray-600 leading-tight">{children}</h6>
  ),

  ul: ({ children }) => <ul className="list-disc pl-3 mb-1 space-y-0.5 text-[12px]">{children}</ul>,
  ol: ({ children }) => (
    <ol className="list-decimal pl-3 mb-1 space-y-0.5 text-[12px]">{children}</ol>
  ),
  li: ({ children }) => <li className="text-[12px] leading-relaxed">{children}</li>,

  strong: ({ children }) => <strong className="font-semibold text-gray-800">{children}</strong>,
  em: ({ children }) => <em className="italic text-gray-700">{children}</em>,

  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-gray-300 pl-2 italic text-gray-600 text-[12px] my-1 bg-gray-50/50 py-0.5 rounded-r">
      {children}
    </blockquote>
  ),

  // 链接 - 带 XSS 防护
  a: ({ children, href }) => {
    const isSafe = href && isValidUrl(href);

    return (
      <a
        href={isSafe ? href : '#'}
        className="text-blue-600 hover:text-blue-700 underline text-[12px] font-medium"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    );
  },

  table: ({ children }) => (
    <table className="border-collapse border border-gray-300 text-[12px] my-1.5 rounded overflow-hidden shadow-sm">
      {children}
    </table>
  ),
  thead: ({ children }) => <thead className="bg-gray-100">{children}</thead>,
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => <tr className="border-b border-gray-300">{children}</tr>,
  th: ({ children }) => (
    <th className="border border-gray-300 px-2 py-1 text-left font-semibold">{children}</th>
  ),
  td: ({ children }) => <td className="border border-gray-300 px-2 py-1">{children}</td>,
};
