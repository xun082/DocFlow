import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { TextSelection } from '@tiptap/pm/state';

export const SelectOnlyCode = Extension.create({
  name: 'selectOnlyCode',

  addProseMirrorPlugins() {
    // 只在客户端环境添加插件
    if (typeof window === 'undefined') {
      return [];
    }

    return [
      new Plugin({
        key: new PluginKey('selectOnlyCode'),
        props: {
          handleKeyDown(view, event) {
            // 只在按下 Mod-A 时生效
            if ((event.key === 'a' || event.key === 'A') && (event.ctrlKey || event.metaKey)) {
              const { state, dispatch } = view;
              const { $from } = state.selection;

              // 检查多个可能的节点名称
              const isInCodeBlock = $from.parent.type.name === 'codeBlock';

              // 判断光标父节点是否 codeBlock
              if (isInCodeBlock) {
                event.preventDefault();

                // 计算 codeBlock 的起止位置
                let startPos, endPos;

                // 尝试找到正确的代码块范围
                if ($from.parent.type.name.includes('odeBlock')) {
                  startPos = $from.start();
                  endPos = $from.end();
                } else if ($from.node().type.name.includes('odeBlock')) {
                  startPos = $from.start(-1);
                  endPos = $from.end(-1);
                } else {
                  return false;
                }

                // 直接使用节点的内容范围，不需要调整
                const start = startPos;
                const end = endPos;

                // 创建新的文本选择
                if (start < end) {
                  const selection = TextSelection.create(state.doc, start, end);

                  // 应用选择
                  dispatch(state.tr.setSelection(selection));
                }

                return true;
              }
            }

            return false;
          },
        },
      }),
    ];
  },
});
