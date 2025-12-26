import { Paragraph } from 'docx';

import { TaskListNode, TaskItemNode } from '../types';
import { convertTaskItem } from './task-item';

/**
 * Convert TipTap task list node to DOCX paragraphs
 *
 * @param node - TipTap task list node
 * @returns Array of Paragraph objects with checkboxes
 */
export function convertTaskList(node: TaskListNode): Paragraph[] {
  if (!node.content || node.content.length === 0) {
    return [];
  }

  // Convert each task item in the list
  return node.content
    .filter((item) => item.type === 'taskItem')
    .map((item) => convertTaskItem(item as TaskItemNode));
}
