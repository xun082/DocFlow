'use client';

import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Editor } from '@tiptap/react';
import { X, Search, ChevronUp, ChevronDown, Replace, ReplaceAll } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { SearchAndReplaceCommands } from '@/extensions/SearchAndReplace/types';
import { SearchResult } from '@/extensions/SearchAndReplace/types';

interface SearchPanelProps {
  editor: Editor;
  isOpen: boolean;
  onClose: () => void;
}

export function SearchPanel({ editor, isOpen, onClose }: SearchPanelProps) {
  const commands = editor.commands as unknown as SearchAndReplaceCommands & typeof editor.commands;

  const [isClient, setIsClient] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [replaceTerm, setReplaceTerm] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [showReplace, setShowReplace] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchState, setSearchState] = useState<{ results: SearchResult[]; currentIndex: number }>(
    {
      results: [],
      currentIndex: -1,
    },
  );

  useEffect(() => {
    setIsClient(true);
  }, []);

  // 监听编辑器更新，同步搜索结果
  useEffect(() => {
    if (!editor) return;

    const updateSearchState = () => {
      const storage = (editor.storage as any).searchAndReplace;

      if (storage) {
        setSearchState({
          results: storage.results || [],
          currentIndex: storage.currentIndex ?? -1,
        });
      }
    };

    // 初始化状态
    updateSearchState();

    editor.on('transaction', updateSearchState);

    return () => {
      editor.off('transaction', updateSearchState);
    };
  }, [editor]);

  const { results, currentIndex } = searchState;

  // 当面板打开时聚焦搜索框
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
      searchInputRef.current.select();
    }
  }, [isOpen]);

  // 更新搜索词
  useEffect(() => {
    if (editor) {
      commands.setSearchTerm(searchTerm);
    }
  }, [editor, searchTerm]);

  // 更新替换词
  useEffect(() => {
    if (editor) {
      commands.setReplaceTerm(replaceTerm);
    }
  }, [editor, replaceTerm]);

  // 更新大小写敏感
  useEffect(() => {
    if (editor) {
      commands.setCaseSensitive(caseSensitive);
    }
  }, [editor, caseSensitive]);

  const handleNext = () => {
    commands.goToNextSearchResult();
  };

  const handlePrevious = () => {
    commands.goToPreviousSearchResult();
  };

  const handleReplace = () => {
    commands.replace();
  };

  const handleReplaceAll = () => {
    commands.replaceAll();
    setSearchTerm('');
    setReplaceTerm('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        handlePrevious();
      } else {
        handleNext();
      }

      e.preventDefault();
    } else if (e.key === 'Escape') {
      onClose();
      e.preventDefault();
    }
  };

  if (!isOpen || !isClient) {
    return null;
  }

  const panelContent = (
    <div className="fixed top-20 right-6 z-50 w-96 bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">搜索</span>
        </div>
        <div className="flex items-center gap-2">
          {editor.isEditable && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowReplace(!showReplace)}
              className="h-7 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 px-2 py-0 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              {showReplace ? '隐藏替换' : '显示替换'}
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-7 w-7 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Search Input */}
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Input
            ref={searchInputRef}
            type="text"
            placeholder="搜索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 h-9"
          />
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrevious}
              disabled={results.length === 0}
              className="h-9 w-9 p-0"
            >
              <ChevronUp className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNext}
              disabled={results.length === 0}
              className="h-9 w-9 p-0"
            >
              <ChevronDown className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Result Count */}
        {searchTerm && (
          <div className="text-xs text-gray-600 dark:text-gray-400">
            {results.length === 0 ? '无结果' : `${currentIndex + 1} / ${results.length} 个结果`}
          </div>
        )}

        {/* Replace Input */}
        {editor.isEditable && showReplace && (
          <>
            <div className="flex items-center gap-2">
              <Input
                type="text"
                placeholder="替换为..."
                value={replaceTerm}
                onChange={(e) => setReplaceTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 h-9"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReplace}
                disabled={results.length === 0 || currentIndex < 0}
                className="flex-1 h-9"
              >
                <Replace className="w-3 h-3 mr-1" />
                替换
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReplaceAll}
                disabled={results.length === 0}
                className="flex-1 h-9"
              >
                <ReplaceAll className="w-3 h-3 mr-1" />
                全部替换
              </Button>
            </div>
          </>
        )}

        {/* Options */}
        <div className="flex items-center gap-2 pt-2">
          <Checkbox
            id="case-sensitive"
            checked={caseSensitive}
            onCheckedChange={(checked) => setCaseSensitive(!!checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <Label htmlFor="case-sensitive" className="cursor-pointer text-sm text-gray-500">
            区分大小写
          </Label>
        </div>

        {/* Keyboard Shortcuts */}
        <div className="text-xs text-gray-500 dark:text-gray-500 pt-2 border-t border-gray-200 dark:border-gray-700">
          <div>回车: 下一个 | Shift+回车: 上一个 | ESC: 关闭</div>
        </div>
      </div>
    </div>
  );

  return createPortal(panelContent, document.body);
}
