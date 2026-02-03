'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MathfieldElement } from 'mathlive';

import { searchMathCommands, MathCommand } from './math-commands';

import { Button } from '@/components/ui/button';

export interface MathLiveEditorProps {
  initialValue?: string;
  onInsert: (latex: string) => void;
  onCancel: () => void;
}

export const MathLiveEditor: React.FC<MathLiveEditorProps> = ({
  initialValue = '',
  onInsert,
  onCancel,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mathfieldRef = useRef<MathfieldElement | null>(null);
  const [latex, setLatex] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(true);

  // 建议系统状态
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<MathCommand[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadMathLive = async () => {
      if (typeof window === 'undefined') {
        setIsLoading(false);

        return;
      }

      try {
        // 动态加载 MathLive
        if (!customElements.get('math-field')) {
          await import('mathlive');
          // 等待自定义元素注册完成
          await customElements.whenDefined('math-field');
        }

        if (!mounted) return;

        // 等待 DOM 准备好
        await new Promise((resolve) => requestAnimationFrame(resolve));

        if (!mounted || !containerRef.current) {
          setIsLoading(false);

          return;
        }

        // 创建 math-field 元素
        const mf = document.createElement('math-field') as MathfieldElement;
        mathfieldRef.current = mf;

        containerRef.current.innerHTML = '';
        containerRef.current.appendChild(mf);

        // 配置 MathLive
        mf.mathVirtualKeyboardPolicy = 'manual';
        mf.value = initialValue;

        // 监听输入变化
        const handleInput = () => {
          const currentValue = mf.value;
          setLatex(currentValue);

          // 获取最后输入的内容作为搜索查询
          const lastWord = currentValue.split(/[\s+\-*/=()[\]{}]/).pop() || '';

          if (lastWord.length > 0) {
            const results = searchMathCommands(lastWord);

            if (results.length > 0) {
              setSuggestions(results);
              setSearchQuery(lastWord);
              setShowSuggestions(true);
              setSelectedIndex(0);
            } else {
              setShowSuggestions(false);
            }
          } else {
            setShowSuggestions(false);
          }
        };

        mf.addEventListener('input', handleInput);

        // 处理快捷键
        const handleKeyDown = (e: KeyboardEvent) => {
          // 如果建议面板打开，处理导航键
          if (showSuggestions && suggestions.length > 0) {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setSelectedIndex((prev) => Math.min(prev + 1, suggestions.length - 1));

              return;
            }

            if (e.key === 'ArrowUp') {
              e.preventDefault();
              setSelectedIndex((prev) => Math.max(prev - 1, 0));

              return;
            }

            if (e.key === 'Enter' && !e.metaKey && !e.ctrlKey) {
              e.preventDefault();
              insertSuggestion(suggestions[selectedIndex]);

              return;
            }

            if (e.key === 'Escape') {
              e.preventDefault();
              setShowSuggestions(false);

              return;
            }
          }

          // 全局快捷键
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();

            const currentLatex = mf.value;

            if (currentLatex.trim()) {
              onInsert(currentLatex);
            }
          } else if (e.key === 'Escape' && !showSuggestions) {
            e.preventDefault();
            onCancel();
          }
        };

        mf.addEventListener('keydown', handleKeyDown);

        setIsLoading(false);

        // 自动聚焦
        setTimeout(() => {
          if (mounted && mf) {
            mf.focus();

            // 显示初始建议
            const initialSuggestions = searchMathCommands('');
            setSuggestions(initialSuggestions);
          }
        }, 150);

        return () => {
          mf.removeEventListener('input', handleInput);
          mf.removeEventListener('keydown', handleKeyDown);
        };
      } catch (error) {
        console.error('Failed to load MathLive:', error);

        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadMathLive();

    return () => {
      mounted = false;

      if (mathfieldRef.current) {
        mathfieldRef.current.remove();
        mathfieldRef.current = null;
      }
    };
  }, []); // 只在挂载时执行一次

  // 插入建议的命令
  const insertSuggestion = (command: MathCommand) => {
    if (mathfieldRef.current) {
      const mf = mathfieldRef.current;

      // 删除搜索查询
      if (searchQuery) {
        mf.executeCommand(['deleteBackward']);
      }

      // 插入命令
      mf.executeCommand(['insert', command.latex]);
      mf.focus();

      setShowSuggestions(false);
      setSearchQuery('');
    }
  };

  const handleInsert = () => {
    if (latex.trim()) {
      onInsert(latex);
    }
  };

  const insertSymbol = (command: string) => {
    if (mathfieldRef.current) {
      mathfieldRef.current.executeCommand(['insert', command]);
      mathfieldRef.current.focus();
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
      {/* 标题栏 */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">数学公式编辑器</h3>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* 编辑器容器 - 相对定位以便建议面板定位 */}
      <div className="relative flex-1 overflow-auto">
        {/* MathLive 编辑器 */}
        {isLoading ? (
          <div className="min-h-[120px] flex items-center justify-center border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900">
            <div className="text-gray-500 dark:text-gray-400">加载中...</div>
          </div>
        ) : (
          <div
            ref={containerRef}
            className="min-h-[120px] border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-900 text-lg"
          />
        )}

        {/* 智能建议面板 - Corca 风格 */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute mt-2 w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
            <div className="max-h-80 overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => insertSuggestion(suggestion)}
                  className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors ${
                    index === selectedIndex ? 'bg-blue-50 dark:bg-gray-700' : ''
                  } ${index === 0 ? '' : 'border-t border-gray-100 dark:border-gray-700'}`}
                >
                  {/* 图标 */}
                  <div className="w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-gray-900 rounded text-lg font-semibold">
                    {suggestion.icon || suggestion.latex.charAt(0)}
                  </div>

                  {/* 内容 */}
                  <div className="flex-1 text-left">
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {suggestion.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {suggestion.category}
                    </div>
                  </div>

                  {/* 快捷键提示 */}
                  {index === 0 && (
                    <div className="text-xs text-gray-400 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                      Enter
                    </div>
                  )}
                  {index > 0 && index < 6 && (
                    <div className="text-xs text-gray-400">⌘{index + 1}</div>
                  )}
                </button>
              ))}
            </div>

            {/* 提示文字 */}
            <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
              Press{' '}
              <kbd className="px-1 py-0.5 bg-white dark:bg-gray-800 rounded border">Enter</kbd> to
              insert ·{' '}
              <kbd className="px-1 py-0.5 bg-white dark:bg-gray-800 rounded border">↑↓</kbd> to
              navigate
            </div>
          </div>
        )}
      </div>

      {/* 快速插入 */}
      <div className="mt-4">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">常用符号：</div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => insertSymbol('\\frac{#@}{#?}')}>
            分数 x/y
          </Button>
          <Button size="sm" variant="outline" onClick={() => insertSymbol('\\sqrt{#@}')}>
            根号 √
          </Button>
          <Button size="sm" variant="outline" onClick={() => insertSymbol('\\sum_{#@}^{#?}')}>
            求和 ∑
          </Button>
          <Button size="sm" variant="outline" onClick={() => insertSymbol('\\int_{#@}^{#?}')}>
            积分 ∫
          </Button>
          <Button size="sm" variant="outline" onClick={() => insertSymbol('^{#@}')}>
            上标 xⁿ
          </Button>
          <Button size="sm" variant="outline" onClick={() => insertSymbol('_{#@}')}>
            下标 xₙ
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => insertSymbol('\\begin{bmatrix}#@\\end{bmatrix}')}
          >
            矩阵
          </Button>
          <Button size="sm" variant="outline" onClick={() => insertSymbol('\\pi')}>
            π
          </Button>
        </div>
      </div>

      {/* LaTeX 预览 */}
      {latex && (
        <div className="mt-4">
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            LaTeX 代码：
          </div>
          <code className="block p-3 bg-gray-100 dark:bg-gray-900 rounded text-xs font-mono break-all text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600">
            {latex}
          </code>
        </div>
      )}

      {/* 操作按钮 */}
      <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs border border-gray-300 dark:border-gray-600">
            ⌘+Enter
          </kbd>{' '}
          插入 |{' '}
          <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs border border-gray-300 dark:border-gray-600">
            Esc
          </kbd>{' '}
          取消
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            取消
          </Button>
          <Button onClick={handleInsert} disabled={!latex.trim()}>
            插入公式
          </Button>
        </div>
      </div>
    </div>
  );
};
