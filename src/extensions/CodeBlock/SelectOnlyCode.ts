import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { TextSelection } from '@tiptap/pm/state';

export const SelectOnlyCode = Extension.create({
  name: 'selectOnlyCode',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('selectOnlyCode'),
        props: {
          handleKeyDown(view, event) {
            // 只在按下 Mod-A 时生效
            if ((event.key === 'a' || event.key === 'A') && (event.ctrlKey || event.metaKey)) {
              const { state, dispatch } = view;
              const { $from } = state.selection;

              // 调试信息
              console.log('SelectOnlyCode: 检测到 Cmd/Ctrl+A', {
                parentNodeName: $from.parent.type.name,
                allNodeTypes: Array.from(
                  new Set(
                    [
                      $from.node().type.name,
                      $from.parent.type.name,
                      $from.node(-1)?.type.name,
                      $from.node(-2)?.type.name,
                    ].filter(Boolean),
                  ),
                ),
              });

              // 检查多个可能的节点名称
              const isInCodeBlock =
                $from.parent.type.name === 'codeBlock' ||
                $from.parent.type.name === 'code_block' ||
                $from.node().type.name === 'codeBlock' ||
                $from.node().type.name === 'code_block';

              // 判断光标父节点是否 codeBlock
              if (isInCodeBlock) {
                console.log('SelectOnlyCode: 在代码块内，执行选择');
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

                console.log('SelectOnlyCode: 选择范围', { start, end, startPos, endPos });

                // 创建新的文本选择
                if (start < end) {
                  const selection = TextSelection.create(state.doc, start, end);

                  // 应用选择
                  dispatch(state.tr.setSelection(selection));
                  console.log('SelectOnlyCode: 选择已应用');
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
