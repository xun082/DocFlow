export interface SearchAndReplaceOptions {
  searchResultClass: string;
  currentSearchResultClass: string;
  disableRegex: boolean;
  caseSensitive: boolean;
}

export interface SearchAndReplaceStorage {
  searchTerm: string;
  replaceTerm: string;
  results: SearchResult[];
  currentIndex: number;
  caseSensitive: boolean;
}

export interface SearchResult {
  from: number;
  to: number;
}

// 定义搜索插件命令
export interface SearchAndReplaceCommands<ReturnType = boolean> {
  setSearchTerm: (searchTerm: string) => ReturnType;
  setReplaceTerm: (replaceTerm: string) => ReturnType;
  setCaseSensitive: (caseSensitive: boolean) => ReturnType;
  goToNextSearchResult: () => ReturnType;
  goToPreviousSearchResult: () => ReturnType;
  replace: () => ReturnType;
  replaceAll: () => ReturnType;
}
