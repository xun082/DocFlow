import { mergeAttributes } from '@tiptap/core';
import TiptapLink from '@tiptap/extension-link';
import { Plugin } from '@tiptap/pm/state';
import { EditorView } from '@tiptap/pm/view';

export const Link = TiptapLink.extend({
  inclusive: false,

  parseHTML() {
    return [
      {
        tag: 'a[href]:not([data-type="button"]):not([href *= "javascript:" i])',
        getAttrs: (element: any) => {
          // check if link starts with javascript:
          if (element.getAttribute('href')?.toLowerCase().startsWith('javascript:')) {
            return false;
          }

          return null;
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, any> }) {
    if (HTMLAttributes.href?.toLowerCase().startsWith('javascript:')) {
      return [
        'a',
        mergeAttributes(
          this.options.HTMLAttributes,
          { ...HTMLAttributes, href: '' },
          { class: 'link' },
        ),
        0,
      ];
    }

    return [
      'a',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { class: 'link' }),
      0,
    ];
  },

  addProseMirrorPlugins() {
    const parentPlugins = this.parent?.() || [];
    const { editor } = this;

    return [
      // Markdown 链接语法插件放在最前面，优先处理
      new Plugin({
        props: {
          // 输入 [text](url) 自动转换为链接
          handleTextInput: (view, from, _to, text) => {
            if (text !== ')') return false;

            const { state } = view;
            const $from = state.doc.resolve(from);

            // 获取当前段落中光标之前的文本内容
            const textBefore = $from.parent.textBetween(0, $from.parentOffset, undefined, '\ufffc');

            // 匹配 [text](url 模式（不含结尾 )，因为用户正在输入它）
            const match = textBefore.match(/\[([^\]]+)\]\((\S+)$/);

            if (!match) return false;

            const [fullMatch, linkText, linkUrl] = match;

            if (!linkText?.trim() || !linkUrl?.trim()) return false;

            // 计算匹配开始的文档位置
            const blockStart = $from.start($from.depth);
            const matchStart = blockStart + (textBefore.length - fullMatch.length);

            const { tr, schema } = state;
            const linkMark = schema.marks.link.create({
              href: linkUrl,
              target: '_blank',
            });

            // 删除 [text](url 部分（) 还没插入文档）
            tr.delete(matchStart, from);

            // 插入带链接标记的文本
            tr.insertText(linkText, matchStart);
            tr.addMark(matchStart, matchStart + linkText.length, linkMark);

            // 移除 storedMark，防止后续输入继承链接样式
            tr.removeStoredMark(schema.marks.link);

            view.dispatch(tr);

            return true;
          },

          handleKeyDown: (_view: EditorView, event: KeyboardEvent) => {
            const { selection } = editor.state;

            if (event.key === 'Escape' && selection.empty !== true) {
              editor.commands.focus(selection.to, { scrollIntoView: false });
            }

            return false;
          },
        },
      }),
      // 保留父级 Link 扩展的所有插件（autolink、点击处理等）
      ...parentPlugins,
    ];
  },
});

export default Link;
