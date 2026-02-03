import { Editor } from '@tiptap/core';

import { IconName } from '@/components/ui/Icon';

export interface Group {
  name: string;
  title: string;
  commands: Command[];
}

export interface Command {
  name: string;
  label: string;
  description: string;
  aliases?: string[];
  iconName: IconName;
  action: (editor: Editor) => void;
  shouldBeHidden?: (editor: Editor) => boolean;
}

export interface MenuListProps {
  editor: Editor;
  items: Group[];
  command: (command: Command) => void;
}
