import { useState, useCallback, useRef, useEffect } from 'react';

import { FileItem, SearchResultItem } from '../type';

interface UseFileSearchReturn {
  searchQuery: string;
  searchResults: SearchResultItem[];
  isSearching: boolean;
  searchFocused: boolean;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  clearSearch: () => void;
  handleSearchFocus: () => void;
  handleSearchBlur: () => void;
  highlightMatch: (
    text: string,
    query: string,
  ) =>
    | { type: 'plain'; content: string }
    | { type: 'highlighted'; parts: { before: string; match: string; after: string } };
}

export const useFileSearch = (
  files: FileItem[],
  setExpandedFolders: (updater: (prev: Record<string, boolean>) => Record<string, boolean>) => void,
): UseFileSearchReturn => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // 执行文件过滤搜索
  const performSearch = useCallback(
    (query: string) => {
      if (!query.trim()) {
        setSearchResults([]);
        setIsSearching(false);

        return;
      }

      setIsSearching(true);

      // 递归搜索文件结构进行过滤
      const search = (
        items: FileItem[],
        currentPath: string[] = [],
        ancestorIds: string[] = [],
      ): SearchResultItem[] => {
        let results: SearchResultItem[] = [];

        for (const item of items) {
          const lowerCaseName = item.name.toLowerCase();
          const lowerCaseQuery = query.toLowerCase();

          // 检查当前项是否匹配
          if (lowerCaseName.includes(lowerCaseQuery)) {
            results.push({
              item,
              path: [...currentPath, item.name],
              ancestors: [...ancestorIds, item.id],
            });
          }

          // 如果是文件夹，递归搜索子项
          if (item.type === 'folder' && item.children) {
            const childResults = search(
              item.children,
              [...currentPath, item.name],
              [...ancestorIds, item.id],
            );
            results = [...results, ...childResults];
          }
        }

        return results;
      };

      const results = search(files);
      setSearchResults(results);

      // 自动展开包含搜索结果的文件夹
      const foldersToExpand: Record<string, boolean> = {};
      results.forEach((result) => {
        result.ancestors.forEach((id) => {
          foldersToExpand[id] = true;
        });
      });

      setExpandedFolders((prev) => ({
        ...prev,
        ...foldersToExpand,
      }));

      setIsSearching(false);
    },
    [files, setExpandedFolders],
  );

  // 处理搜索输入
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const query = e.target.value;
      setSearchQuery(query);

      // 防抖：延迟300ms执行搜索，避免输入过程中频繁搜索
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      searchTimeoutRef.current = setTimeout(() => {
        performSearch(query);
      }, 300);
    },
    [performSearch],
  );

  // 清除搜索
  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);

    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  // 当搜索框获得焦点时
  const handleSearchFocus = useCallback(() => {
    setSearchFocused(true);
  }, []);

  // 当搜索框失去焦点时
  const handleSearchBlur = useCallback(() => {
    setSearchFocused(false);
  }, []);

  // 高亮显示匹配的文本
  const highlightMatch = useCallback((text: string, query: string) => {
    if (!query.trim()) {
      return { type: 'plain' as const, content: text };
    }

    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const index = lowerText.indexOf(lowerQuery);

    if (index === -1) {
      return { type: 'plain' as const, content: text };
    }

    const before = text.slice(0, index);
    const match = text.slice(index, index + query.length);
    const after = text.slice(index + query.length);

    return {
      type: 'highlighted' as const,
      parts: { before, match, after },
    };
  }, []);

  // 组件卸载时清除定时器
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return {
    searchQuery,
    searchResults,
    isSearching,
    searchFocused,
    searchInputRef,
    handleSearchChange,
    clearSearch,
    handleSearchFocus,
    handleSearchBlur,
    highlightMatch,
  };
};
