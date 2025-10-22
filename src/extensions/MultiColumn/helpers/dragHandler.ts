import type { Editor } from '@tiptap/core';
import { NodeSelection } from '@tiptap/pm/state';
// import { v4 as uuid } from 'uuid';

import { cloneElement } from './cloneElement';
import { removeNode } from './removeNode';

export function dragHandlerDirect(
  event: DragEvent,
  editor: Editor,
  element: HTMLElement,
  pos: number,
  // uuid?: string,
) {
  const { view } = editor;

  if (!event.dataTransfer) {
    return;
  }

  try {
    const $pos = view.state.doc.resolve(pos);
    let targetNode = null;
    let targetFrom = pos;

    // 确定目标节点和起始位置
    // 首先检查当前位置是否在column节点内部
    if ($pos.parent?.type.name === 'column' && $pos.depth > 0) {
      // 在column节点内部，向上查找column节点
      for (let depth = $pos.depth; depth > 0; depth--) {
        const node = $pos.node(depth);

        if (node?.type?.name === 'column') {
          targetNode = node;
          targetFrom = $pos.before(depth);
          break;
        }
      }
    } else if ($pos.nodeAfter?.type.name === 'column') {
      // pos 指向 column 节点的开始位置
      targetNode = $pos.nodeAfter;
      targetFrom = pos;
    } else if ($pos.nodeBefore?.type.name === 'column') {
      // pos 指向 column 节点的结束位置
      targetNode = $pos.nodeBefore;
      targetFrom = pos - targetNode.nodeSize;
    } else {
      return;
    }

    if (!targetNode || targetNode.type.name !== 'column') {
      return;
    }

    // 计算节点范围并获取内容
    const from = targetFrom;
    const to = from + targetNode.nodeSize;
    const slice = view.state.doc.slice(from, to);

    if (slice.content.childCount === 0) {
      return;
    }

    // 创建拖拽元素
    const { tr } = view.state;

    const wrapper = document.createElement('div');
    const clonedElement = cloneElement(element);
    wrapper.append(clonedElement);

    wrapper.style.position = 'absolute';
    wrapper.style.top = '-10000px';
    document.body.append(wrapper);

    event.dataTransfer.clearData();
    event.dataTransfer.setDragImage(wrapper, 0, 0);

    // tell ProseMirror the dragged content
    view.dragging = { slice, move: true };

    const selection = NodeSelection.create(view.state.doc, from);
    tr.setSelection(selection);
    view.dispatch(tr);

    // 获取多有的columns

    // 获取所有的columns节点
    const getAllColumns = () => {
      // const columnsNodes: Array<{ node: any; pos: number; uuid?: string }> = [];
      const { tr } = view.state;
      view.state.doc.descendants((node, pos) => {
        if (node.type.name === 'columns') {
          // const columnInfo = { node, pos, uuid: node.attrs.uuid };
          // columnsNodes.push(columnInfo);

          // if (node.attrs.uuid === uuid) {
          //   tr.setNodeAttribute(pos, 'rows', node.attrs.rows - 1);
          // }

          // if (node.childCount === 1) {
          //   tr.setNodeAttribute(pos, 'rows', 1);
          // }

          tr.setNodeAttribute(pos, 'rows', node.childCount);
        }
      });
      view.dispatch(tr);
    };

    // clean up and handle drag end callback
    const handleDrop = () => {
      removeNode(wrapper);
      setTimeout(() => {
        getAllColumns();
      }, 50);
    };

    document.addEventListener('drop', handleDrop, { once: true });
  } catch (error) {
    console.error('Error in dragHandlerDirect:', error);
  }
}
