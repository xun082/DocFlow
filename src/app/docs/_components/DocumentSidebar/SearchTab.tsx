'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { Icon } from '@/components/ui/Icon';
import { cn } from '@/utils/utils';
import DocumentApi from '@/services/document';
import { DocumentResponse } from '@/services/document/type';

interface SearchTabProps {
  isActive: boolean;
}

interface SearchResult {
  id: string;
  title: string;
  content?: string;
  type: 'DOCUMENT' | 'FOLDER';
  is_starred: boolean;
  updated_at: string;
  created_at: string;
  parent_id?: number;
  path?: string[];
  matches: {
    field: 'title' | 'content';
    text: string;
    start: number;
    end: number;
  }[];
}

interface FileStructure {
  id: string;
  name: string;
  type: 'file' | 'folder';
  children?: FileStructure[];
  is_starred: boolean;
  updated_at: string;
  created_at: string;
  parent_id?: number;
}

const SearchTab = ({ isActive }: SearchTabProps) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [documents, setDocuments] = useState<DocumentResponse['owned']>([]);
  const [fileStructure, setFileStructure] = useState<FileStructure[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [searchMode, setSearchMode] = useState<'all' | 'files' | 'content'>('all');

  // 处理API返回的文档数据，转换为文件结构
  const processDocumentsToFileStructure = (docs: DocumentResponse['owned']): FileStructure[] => {
    const docMap = new Map<number, DocumentResponse['owned'][0]>();
    docs.forEach((doc) => {
      if (!doc.is_deleted) {
        docMap.set(doc.id, doc);
      }
    });

    const result: FileStructure[] = [];
    const childrenMap = new Map<number, FileStructure[]>();

    docMap.forEach((doc) => {
      childrenMap.set(doc.id, []);
    });

    docMap.forEach((doc) => {
      const fileItem: FileStructure = {
        id: String(doc.id),
        name: doc.title,
        type: doc.type === 'FOLDER' ? 'folder' : 'file',
        is_starred: doc.is_starred,
        created_at: doc.created_at,
        updated_at: doc.updated_at,
        parent_id: doc.parent_id ?? undefined,
      };

      if (doc.type === 'FOLDER') {
        fileItem.children = childrenMap.get(doc.id) || [];
      }

      if (doc.parent_id === null) {
        result.push(fileItem);
      } else if (docMap.has(doc.parent_id)) {
        const parentChildren = childrenMap.get(doc.parent_id) || [];
        parentChildren.push(fileItem);
        childrenMap.set(doc.parent_id, parentChildren);
      }
    });

    return result;
  };

  // 递归搜索文件结构
  const searchInFileStructure = (
    structure: FileStructure[],
    query: string,
    currentPath: string[] = [],
  ): SearchResult[] => {
    const results: SearchResult[] = [];

    for (const item of structure) {
      const itemPath = [...currentPath, item.name];
      const lowerName = item.name.toLowerCase();
      const lowerQuery = query.toLowerCase();

      if (lowerName.includes(lowerQuery)) {
        const matches: SearchResult['matches'] = [];
        let nameIndex = lowerName.indexOf(lowerQuery);

        while (nameIndex !== -1) {
          matches.push({
            field: 'title',
            text: item.name.substring(nameIndex, nameIndex + query.length),
            start: nameIndex,
            end: nameIndex + query.length,
          });
          nameIndex = lowerName.indexOf(lowerQuery, nameIndex + 1);
        }

        results.push({
          id: item.id,
          title: item.name,
          type: item.type === 'folder' ? 'FOLDER' : 'DOCUMENT',
          is_starred: item.is_starred,
          updated_at: item.updated_at,
          created_at: item.created_at,
          parent_id: item.parent_id,
          path: itemPath,
          matches,
        });
      }

      // 递归搜索子项
      if (item.children && item.children.length > 0) {
        const childResults = searchInFileStructure(item.children, query, itemPath);
        results.push(...childResults);
      }
    }

    return results;
  };

  // 加载所有文档数据
  const loadDocuments = async () => {
    try {
      const res = await DocumentApi.GetDocument();

      if (res?.data?.code === 200 && res?.data?.data) {
        const documentResponse = res.data.data as DocumentResponse;
        const docs = documentResponse.owned || [];
        setDocuments(docs);

        // 转换为文件结构
        const structure = processDocumentsToFileStructure(docs);
        setFileStructure(structure);
      }
    } catch (error) {
      console.error('Failed to load documents:', error);
    }
  };

  useEffect(() => {
    if (isActive) {
      loadDocuments();
    }
  }, [isActive, loadDocuments]);

  // 实际搜索函数
  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);

      return;
    }

    setIsSearching(true);

    try {
      let results: SearchResult[] = [];

      if (searchMode === 'all' || searchMode === 'files') {
        // 搜索文件结构
        const fileResults = searchInFileStructure(fileStructure, query);
        results.push(...fileResults);
      }

      if (searchMode === 'all' || searchMode === 'content') {
        // 搜索文档内容（标题）
        const contentResults = documents
          .filter((doc) => !doc.is_deleted)
          .filter((doc) => {
            const titleMatch = doc.title.toLowerCase().includes(query.toLowerCase());

            return titleMatch;
          })
          .map((doc) => {
            const matches: SearchResult['matches'] = [];
            const titleLower = doc.title.toLowerCase();
            const queryLower = query.toLowerCase();
            let titleIndex = titleLower.indexOf(queryLower);

            while (titleIndex !== -1) {
              matches.push({
                field: 'title',
                text: doc.title.substring(titleIndex, titleIndex + query.length),
                start: titleIndex,
                end: titleIndex + query.length,
              });
              titleIndex = titleLower.indexOf(queryLower, titleIndex + 1);
            }

            return {
              id: String(doc.id),
              title: doc.title,
              type: doc.type,
              is_starred: doc.is_starred,
              updated_at: doc.updated_at,
              created_at: doc.created_at,
              parent_id: doc.parent_id ?? undefined,
              matches,
            } as SearchResult;
          });

        // 合并结果并去重
        const existingIds = new Set(results.map((r) => r.id));
        const uniqueContentResults = contentResults.filter((r) => !existingIds.has(r.id));
        results.push(...uniqueContentResults);
      }

      // 排序：收藏的在前，然后按更新时间
      results.sort((a, b) => {
        if (a.is_starred && !b.is_starred) return -1;
        if (!a.is_starred && b.is_starred) return 1;

        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      });

      setSearchResults(results.slice(0, 20)); // 限制结果数量

      // 保存搜索历史
      if (query.trim() && !searchHistory.includes(query.trim())) {
        setSearchHistory((prev) => [query.trim(), ...prev.slice(0, 4)]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    }

    setIsSearching(false);
  };

  // 防抖搜索
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        performSearch(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, performSearch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowHistory(false);
  };

  const handleInputFocus = () => {
    if (!searchQuery && searchHistory.length > 0) {
      setShowHistory(true);
    }
  };

  const handleInputBlur = () => {
    setTimeout(() => setShowHistory(false), 150);
  };

  // 高亮匹配文本
  const highlightText = (text: string, query: string) => {
    if (!query) return text;

    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark
          key={index}
          className="rounded bg-yellow-200 px-0.5 text-gray-900 dark:bg-yellow-700 dark:text-white"
        >
          {part}
        </mark>
      ) : (
        part
      ),
    );
  };

  // 格式化时间
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return '今天';
    if (diffDays === 2) return '昨天';
    if (diffDays <= 7) return `${diffDays} 天前`;

    return date.toLocaleDateString('zh-CN');
  };

  // 搜索模式选项
  const searchModeOptions = [
    { value: 'all', label: '全部', icon: 'Search' },
    { value: 'files', label: '文件', icon: 'FileText' },
    { value: 'content', label: '内容', icon: 'Type' },
  ];

  // 快捷搜索选项
  const quickSearchOptions = [
    { label: '最近修改', icon: 'Clock', action: () => setSearchQuery('') },
    {
      label: '我的文档',
      icon: 'User',
      action: () => {
        setSearchMode('content');
        setSearchQuery('');
      },
    },
    {
      label: '文件夹',
      icon: 'Folder',
      action: () => {
        setSearchMode('files');
        setSearchQuery('folder');
      },
    },
    {
      label: '收藏文档',
      icon: 'Star',
      action: () => {
        setSearchMode('all');
        setSearchQuery('starred');
      },
    },
  ];

  const handleResultClick = (result: SearchResult) => {
    if (result.type === 'DOCUMENT') {
      router.push(`/docs/${result.id}`);
    }
  };

  const handleHistoryClick = (historyQuery: string) => {
    setSearchQuery(historyQuery);
    setShowHistory(false);
  };

  return (
    <div className="flex flex-1 flex-col space-y-4 p-4">
      {/* 搜索输入框 */}
      <div className="relative">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            className={cn(
              'w-full bg-white/90 backdrop-blur-md dark:bg-slate-800/90',
              'border border-slate-200/60 dark:border-slate-600/60',
              'focus:border-blue-500/70 dark:focus:border-blue-400/70',
              'focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20',
              'rounded-xl py-3 pr-11 pl-11 text-sm transition-all duration-200',
              'placeholder:text-slate-400 dark:placeholder:text-slate-500',
              'text-slate-900 dark:text-slate-100',
              'shadow-sm hover:shadow-md focus:shadow-lg',
              'hover:bg-white dark:hover:bg-slate-800',
            )}
            placeholder="搜索文件、文档内容..."
            autoFocus={isActive}
          />

          <Icon
            name="Search"
            className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 transform text-slate-400 dark:text-slate-500"
          />

          {searchQuery && (
            <button
              onClick={clearSearch}
              className={cn(
                'absolute top-1/2 right-3 -translate-y-1/2 transform',
                'h-6 w-6 rounded-lg bg-slate-200/80 dark:bg-slate-600/80',
                'hover:bg-slate-300 dark:hover:bg-slate-500',
                'flex items-center justify-center transition-all duration-200',
                'hover:scale-105',
              )}
              title="清除搜索"
            >
              <Icon name="X" className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
            </button>
          )}
        </div>

        {/* 搜索加载指示器 */}
        {isSearching && (
          <div className="absolute top-1/2 right-12 -translate-y-1/2 transform">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          </div>
        )}

        {/* 搜索历史下拉框 */}
        {showHistory && searchHistory.length > 0 && (
          <div
            className={cn(
              'absolute top-full right-0 left-0 z-50 mt-2',
              'bg-white/95 backdrop-blur-md dark:bg-slate-800/95',
              'border border-slate-200/60 dark:border-slate-600/60',
              'rounded-xl shadow-lg',
              'py-2',
            )}
          >
            <div className="mb-1 border-b border-slate-200/50 px-3 py-1 text-xs font-medium text-slate-500 dark:border-slate-600/50 dark:text-slate-400">
              搜索历史
            </div>
            {searchHistory.map((historyQuery, index) => (
              <button
                key={index}
                onClick={() => handleHistoryClick(historyQuery)}
                className="flex w-full items-center space-x-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100/80 dark:text-slate-300 dark:hover:bg-slate-700/50"
              >
                <Icon name="Clock" className="h-3 w-3 text-slate-400" />
                <span>{historyQuery}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 搜索模式切换 */}
      <div className="flex items-center space-x-1 rounded-lg bg-slate-100/80 p-1 dark:bg-slate-700/60">
        {searchModeOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setSearchMode(option.value as 'all' | 'files' | 'content')}
            className={cn(
              'flex cursor-pointer items-center space-x-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-200',
              searchMode === option.value
                ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-600 dark:text-blue-400'
                : 'text-slate-600 hover:bg-white/50 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-600/50 dark:hover:text-slate-200',
            )}
          >
            <Icon name={option.icon as any} className="h-3 w-3" />
            <span>{option.label}</span>
          </button>
        ))}
      </div>

      {/* 搜索内容区域 */}
      <div className="flex-1 overflow-hidden">
        {!searchQuery ? (
          // 快捷搜索和提示
          <div className="space-y-6">
            {/* 快捷搜索 */}
            <div className="space-y-3">
              <div className="text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                快捷搜索
              </div>
              <div className="grid grid-cols-2 gap-2 px-2">
                {quickSearchOptions.map((item) => (
                  <button
                    key={item.label}
                    onClick={item.action}
                    className={cn(
                      'group flex flex-col items-center justify-center rounded-xl p-3 text-center',
                      'bg-gradient-to-br from-slate-50/80 to-slate-100/60',
                      'dark:from-slate-700/60 dark:to-slate-800/60',
                      'hover:from-blue-50 hover:to-indigo-50',
                      'dark:hover:from-slate-600/80 dark:hover:to-slate-700/80',
                      'border border-slate-200/50 dark:border-slate-600/50',
                      'hover:border-blue-300/50 dark:hover:border-blue-500/30',
                      'cursor-pointer transition-all duration-200 hover:scale-105',
                    )}
                  >
                    <Icon
                      name={item.icon as any}
                      className="mb-1 h-5 w-5 text-slate-500 group-hover:text-blue-600 dark:text-slate-400 dark:group-hover:text-blue-400"
                    />
                    <span className="text-xs font-medium text-slate-600 group-hover:text-blue-600 dark:text-slate-300 dark:group-hover:text-blue-400">
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* 搜索提示 */}
            <div className="space-y-3">
              <div className="text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                搜索技巧
              </div>
              <div className="space-y-2">
                {[
                  { icon: 'Info', tip: '支持搜索文件名和文档内容' },
                  { icon: 'Search', tip: '支持中英文混合搜索' },
                  { icon: 'Filter', tip: '切换搜索模式以精确查找' },
                  { icon: 'Folder', tip: '显示完整文件路径' },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 text-xs text-slate-500 dark:text-slate-400"
                  >
                    <Icon name={item.icon as any} className="h-3.5 w-3.5 flex-shrink-0" />
                    <span>{item.tip}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          // 搜索结果
          <div className="flex h-full flex-col">
            <div className="flex-1 space-y-3 overflow-auto">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                  搜索结果 {searchResults.length > 0 && `(${searchResults.length})`}
                </div>
                {searchResults.length > 0 && (
                  <button
                    onClick={clearSearch}
                    className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    清除
                  </button>
                )}
              </div>

              {isSearching ? (
                <div className="flex items-center justify-center py-12">
                  <div className="space-y-3 text-center">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                    <div className="text-sm text-slate-500 dark:text-slate-400">搜索中...</div>
                  </div>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="space-y-3 py-12 text-center">
                  <Icon
                    name="Search"
                    className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600"
                  />
                  <div className="text-sm text-slate-500 dark:text-slate-400">未找到相关文档</div>
                  <div className="text-xs text-slate-400 dark:text-slate-500">
                    尝试使用不同的关键词
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {searchResults.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => handleResultClick(result)}
                      className={cn(
                        'group w-full rounded-xl p-3 text-left transition-all duration-200',
                        'bg-white/80 backdrop-blur-sm dark:bg-slate-800/60',
                        'hover:bg-gradient-to-r hover:from-blue-50/90 hover:to-indigo-50/70',
                        'dark:hover:from-slate-700/80 dark:hover:to-slate-800/90',
                        'border border-slate-200/50 dark:border-slate-600/40',
                        'hover:border-blue-300/60 dark:hover:border-blue-500/40',
                        'hover:scale-[1.02] hover:shadow-md',
                      )}
                    >
                      <div className="flex items-start space-x-3">
                        <div
                          className={cn(
                            'mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg',
                            result.type === 'FOLDER'
                              ? 'bg-amber-100 dark:bg-amber-900/30'
                              : 'bg-blue-100 dark:bg-blue-900/30',
                          )}
                        >
                          <Icon
                            name={result.type === 'FOLDER' ? 'Folder' : 'FileText'}
                            className={cn(
                              'h-4 w-4',
                              result.type === 'FOLDER'
                                ? 'text-amber-600 dark:text-amber-400'
                                : 'text-blue-600 dark:text-blue-400',
                            )}
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex items-center space-x-2">
                            <h4 className="truncate text-sm font-medium text-slate-800 dark:text-slate-200">
                              {highlightText(result.title, searchQuery)}
                            </h4>
                            {result.is_starred && (
                              <Icon
                                name="Star"
                                className="h-3.5 w-3.5 flex-shrink-0 text-yellow-500"
                              />
                            )}
                          </div>

                          <div className="space-y-1">
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              {result.type === 'FOLDER' ? '文件夹' : '文档'} •{' '}
                              {formatTime(result.updated_at)}
                            </div>

                            {/* 文件路径显示 */}
                            {result.path && result.path.length > 1 && (
                              <div className="flex items-center space-x-1 text-xs text-slate-400 dark:text-slate-500">
                                <Icon name="Folder" className="h-3 w-3 flex-shrink-0" />
                                <span className="truncate">
                                  {result.path.slice(0, -1).join(' / ')}
                                </span>
                              </div>
                            )}

                            {result.matches.length > 0 && (
                              <div className="flex items-center space-x-1 text-xs text-slate-600 opacity-75 dark:text-slate-300">
                                <Icon name="Search" className="h-3 w-3 flex-shrink-0" />
                                <span>
                                  在 {result.matches[0].field === 'title' ? '标题' : '内容'}{' '}
                                  中找到匹配
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchTab;
