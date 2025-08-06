import { Editor, Extension } from '@tiptap/core';
import { ReactRenderer } from '@tiptap/react';
import Suggestion, { SuggestionProps, SuggestionKeyDownProps } from '@tiptap/suggestion';
import { PluginKey } from '@tiptap/pm/state';

import { GROUPS } from './groups';
import SlashCommandPopover, { SlashCommandPopoverRef } from './SlashCommandPopover';

const extensionName = 'slashCommand';

export const SlashCommand = Extension.create({
  name: extensionName,

  priority: 200,

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        char: '/',
        allowSpaces: true,
        startOfLine: true,
        pluginKey: new PluginKey(extensionName),
        allow: ({ state, range }) => {
          const $from = state.doc.resolve(range.from);
          const isRootDepth = $from.depth === 1;
          const isParagraph = $from.parent.type.name === 'paragraph';
          const isStartOfNode = $from.parent.textContent?.charAt(0) === '/';
          // TODO
          const isInColumn = this.editor.isActive('column');

          const afterContent = $from.parent.textContent?.substring(
            $from.parent.textContent?.indexOf('/'),
          );
          const isValidAfterContent = !afterContent?.endsWith('  ');

          return (
            ((isRootDepth && isParagraph && isStartOfNode) ||
              (isInColumn && isParagraph && isStartOfNode)) &&
            isValidAfterContent
          );
        },
        command: ({ editor, props }: { editor: Editor; props: any }) => {
          const { view, state } = editor;
          const { $head, $from } = view.state.selection;

          const end = $from.pos;
          const from = $head?.nodeBefore
            ? end -
              ($head.nodeBefore.text?.substring($head.nodeBefore.text?.indexOf('/')).length ?? 0)
            : $from.start();

          const tr = state.tr.deleteRange(from, end);
          view.dispatch(tr);

          props.action(editor);
          view.focus();
        },
        items: ({ query }: { query: string }) => {
          const withFilteredCommands = GROUPS.map((group) => ({
            ...group,
            commands: group.commands
              .filter((item) => {
                const labelNormalized = item.label.toLowerCase().trim();
                const queryNormalized = query.toLowerCase().trim();

                if (item.aliases) {
                  const aliases = item.aliases.map((alias) => alias.toLowerCase().trim());

                  return (
                    labelNormalized.includes(queryNormalized) || aliases.includes(queryNormalized)
                  );
                }

                return labelNormalized.includes(queryNormalized);
              })
              .filter((command) =>
                command.shouldBeHidden ? !command.shouldBeHidden(this.editor) : true,
              ),
          }));

          const withoutEmptyGroups = withFilteredCommands.filter((group) => {
            if (group.commands.length > 0) {
              return true;
            }

            return false;
          });

          const withEnabledSettings = withoutEmptyGroups.map((group) => ({
            ...group,
            commands: group.commands.map((command) => ({
              ...command,
              isEnabled: true,
            })),
          }));

          return withEnabledSettings;
        },
        render: () => {
          let component: ReactRenderer<SlashCommandPopoverRef, any>;
          let scrollHandler: (() => void) | null = null;
          let editorRef: Editor | null = null;

          return {
            onStart: (props: SuggestionProps) => {
              const { view } = props.editor;
              editorRef = props.editor;

              const getReferenceClientRect = () => {
                if (!props.clientRect) {
                  return (props.editor.storage as any)[extensionName]?.rect;
                }

                const rect = props.clientRect();

                if (!rect) {
                  return (props.editor.storage as any)[extensionName]?.rect;
                }

                let yPos = rect.y;

                if (rect.top + 300 > window.innerHeight) {
                  // 300 is an estimate for popover height
                  const diff = rect.top + 300 - window.innerHeight + 40;
                  yPos = rect.y - diff;
                }

                return new DOMRect(rect.x, yPos, rect.width, rect.height);
              };

              const anchorRect = getReferenceClientRect();

              component = new ReactRenderer(SlashCommandPopover, {
                props: {
                  ...props,
                  anchorRect,
                },
                editor: props.editor,
              });

              scrollHandler = () => {
                if (!getReferenceClientRect()) return;
                component.updateProps({
                  anchorRect: getReferenceClientRect(),
                });
              };

              view.dom.parentElement?.parentElement?.addEventListener('scroll', scrollHandler);
              view.focus();
            },

            onUpdate(props: SuggestionProps) {
              const getReferenceClientRect = () => {
                if (!props.clientRect) {
                  return (props.editor.storage as any)[extensionName]?.rect;
                }

                const rect = props.clientRect();

                if (!rect) {
                  return (props.editor.storage as any)[extensionName]?.rect;
                }

                let yPos = rect.y;

                if (rect.top + 300 > window.innerHeight) {
                  const diff = rect.top + 300 - window.innerHeight + 40;
                  yPos = rect.y - diff;
                }

                return new DOMRect(rect.x, yPos, rect.width, rect.height);
              };

              (props.editor.storage as any)[extensionName] = {
                rect: props.clientRect
                  ? getReferenceClientRect()
                  : {
                      width: 0,
                      height: 0,
                      left: 0,
                      top: 0,
                      right: 0,
                      bottom: 0,
                    },
              };

              const anchorRect = getReferenceClientRect();

              component?.updateProps({
                ...props,
                anchorRect,
              });
            },

            onKeyDown(props: SuggestionKeyDownProps) {
              if (props.event.key === 'Escape') {
                component?.destroy();

                return true;
              }

              // 阻止默认行为，防止浏览器滚动或插入换行
              if (['ArrowUp', 'ArrowDown', 'Enter'].includes(props.event.key)) {
                props.event.preventDefault();
                props.event.stopPropagation();
              }

              const handled = component?.ref?.onKeyDown(props) ?? false;

              // 如果是Enter键且处理成功，则阻止冒泡和默认行为
              if (props.event.key === 'Enter' && handled) {
                props.event.preventDefault();
                props.event.stopPropagation();

                // 取消监听函数并销毁组件
                if (scrollHandler && editorRef) {
                  editorRef.view.dom.parentElement?.parentElement?.removeEventListener(
                    'scroll',
                    scrollHandler,
                  );
                  scrollHandler = null;
                }

                component?.destroy();

                return true;
              }

              return handled;
            },

            onExit() {
              component?.destroy();
            },
          };
        },
      }),
    ];
  },

  addStorage() {
    return {
      rect: {
        width: 0,
        height: 0,
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
      },
    };
  },
});

export default SlashCommand;
