import { Extension } from '@tiptap/core';
import { Plugin, PluginKey, Transaction, EditorState } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

import { SearchAndReplaceOptions, SearchAndReplaceStorage, SearchResult } from './types';

declare module '@tiptap/core' {
  interface ExtensionStorage {
    // 定义该插件的状态
    searchAndReplace: SearchAndReplaceStorage;
  }
}

export const searchAndReplacePluginKey = new PluginKey('searchAndReplace');

/**
 * 滚动到搜索结果的可视区域
 */
const scrollToSearchResult = (editor: any, pos: number) => {
  if (editor && editor.view) {
    try {
      const domInfo = editor.view.domAtPos(pos);
      const node = domInfo.node;
      const element = node instanceof Element ? node : node.parentElement;

      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest',
        });
      }
    } catch (e) {
      console.warn('Manual scroll failed:', e);
    }
  }
};

/**
 * 自定义搜索和替换的插件
 * 参考 https://tiptap.dev/docs/editor/extensions/custom-extensions/create-new/extension
 */
export const SearchAndReplace = Extension.create<SearchAndReplaceOptions, SearchAndReplaceStorage>({
  name: 'searchAndReplace',
  // 插件使用者可配置的选项
  addOptions() {
    return {
      searchResultClass: 'search-result',
      currentSearchResultClass: 'current-search-result',
      disableRegex: true,
      caseSensitive: false,
    };
  },

  // 插件可用的状态
  addStorage() {
    return {
      searchTerm: '',
      replaceTerm: '',
      results: [],
      currentIndex: -1,
      caseSensitive: false,
    };
  },

  addCommands() {
    return {
      setSearchTerm:
        (searchTerm: string) =>
        ({ state, dispatch }: { state: EditorState; dispatch: (tr: Transaction) => void }) => {
          this.storage.searchTerm = searchTerm;
          this.storage.currentIndex = searchTerm ? 0 : -1;

          if (dispatch) {
            dispatch(state.tr);
          }

          return true;
        },

      setReplaceTerm: (replaceTerm: string) => () => {
        this.storage.replaceTerm = replaceTerm;

        return true;
      },

      setCaseSensitive:
        (caseSensitive: boolean) =>
        ({ state, dispatch }: { state: EditorState; dispatch: (tr: Transaction) => void }) => {
          this.storage.caseSensitive = caseSensitive;

          if (dispatch) {
            dispatch(state.tr);
          }

          return true;
        },

      goToNextSearchResult:
        () =>
        ({ state, dispatch }: { state: EditorState; dispatch: (tr: Transaction) => void }) => {
          const { results, currentIndex } = this.storage;

          if (results.length === 0) return false;

          const nextIndex = (currentIndex + 1) % results.length;
          this.storage.currentIndex = nextIndex;

          const result = results[nextIndex];

          if (result && dispatch) {
            const tr = state.tr.setSelection(
              (state.selection.constructor as any).create(state.doc, result.from, result.to) as any,
            );
            dispatch(tr.scrollIntoView());

            // 滚动到可视区域
            scrollToSearchResult(this.editor, result.from);
          }

          return true;
        },

      goToPreviousSearchResult:
        () =>
        ({ state, dispatch }: { state: EditorState; dispatch: (tr: Transaction) => void }) => {
          const { results, currentIndex } = this.storage;

          if (results.length === 0) return false;

          const prevIndex = currentIndex <= 0 ? results.length - 1 : currentIndex - 1;
          this.storage.currentIndex = prevIndex;

          const result = results[prevIndex];

          if (result && dispatch) {
            const tr = state.tr.setSelection(
              (state.selection.constructor as any).create(state.doc, result.from, result.to) as any,
            );
            dispatch(tr.scrollIntoView());

            // 滚动到可视区域
            scrollToSearchResult(this.editor, result.from);
          }

          return true;
        },

      replace:
        () =>
        ({ state, dispatch }: { state: EditorState; dispatch: (tr: Transaction) => void }) => {
          const { results, currentIndex, replaceTerm } = this.storage;

          if (results.length === 0 || currentIndex < 0 || !this.editor.isEditable) return false;

          const result = results[currentIndex];

          if (result && dispatch) {
            const tr = state.tr.insertText(replaceTerm, result.from, result.to);
            dispatch(tr);

            // 触发重新搜索
            if (this.editor) {
              const searchTerm = this.storage.searchTerm;
              this.storage.searchTerm = '';
              this.storage.searchTerm = searchTerm;
              this.editor.view.dispatch(this.editor.state.tr);
            }
          }

          return true;
        },

      replaceAll:
        () =>
        ({ state, dispatch }: { state: EditorState; dispatch: (tr: Transaction) => void }) => {
          const { results, replaceTerm } = this.storage;

          if (results.length === 0 || !this.editor.isEditable) return false;

          // 从后往前替换，避免位置偏移
          const sortedResults = [...results].sort((a, b) => b.from - a.from);
          let tr = state.tr;

          sortedResults.forEach((result) => {
            tr = tr.insertText(replaceTerm, result.from, result.to);
          });

          if (dispatch) {
            dispatch(tr);
          }

          // 清空搜索
          if (this.editor) {
            this.storage.results = [];
            this.storage.currentIndex = -1;
            this.storage.searchTerm = '';
          }

          return true;
        },
    } as any;
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: searchAndReplacePluginKey,
        state: {
          init: () => {
            return DecorationSet.empty;
          },
          // apply 在每次文档变更时调用
          apply: (tr) => {
            const { searchTerm, caseSensitive } = this.storage;

            if (!searchTerm) {
              this.storage.results = [];
              this.storage.currentIndex = -1;

              return DecorationSet.empty;
            }

            const decorations: Decoration[] = [];
            const results: SearchResult[] = [];

            // 搜索文档中的所有匹配项
            const searchRegex = new RegExp(
              searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
              caseSensitive ? 'g' : 'gi',
            );

            // 遍历文档查找匹配项
            tr.doc.descendants((node, pos) => {
              // 只处理文本节点
              if (node.isText && node.text) {
                let match;

                while ((match = searchRegex.exec(node.text)) !== null) {
                  // 计算匹配位置（节点位置 + 匹配索引）
                  const from = pos + match.index;
                  const to = from + match[0].length;

                  results.push({ from, to });
                  // 创建高亮装饰
                  decorations.push(
                    Decoration.inline(from, to, {
                      class: this.options.searchResultClass,
                    }),
                  );
                }
              }
            });

            this.storage.results = results;

            // 高亮当前选中的结果
            if (results.length > 0 && this.storage.currentIndex >= 0) {
              const currentResult = results[this.storage.currentIndex];

              // 高亮当前搜索结果
              if (currentResult) {
                decorations.push(
                  Decoration.inline(currentResult.from, currentResult.to, {
                    class: `${this.options.searchResultClass} ${this.options.currentSearchResultClass}`,
                  }),
                );
              }
            }

            return DecorationSet.create(tr.doc, decorations);
          },
        },
        // 定义插件的属性
        props: {
          decorations(state) {
            return this.getState(state);
          },
        },
      }),
    ];
  },
});
