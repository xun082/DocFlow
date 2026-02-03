import { Extension } from '@tiptap/core';

export const ClearMarksOnEnter = Extension.create({
  addKeyboardShortcuts() {
    return {
      Enter: () => {
        // 检查当前是否有激活的marks
        const hasMarks =
          this.editor.isActive('bold') ||
          this.editor.isActive('italic') ||
          this.editor.isActive('strike');

        if (hasMarks) {
          setTimeout(() => {
            this.editor.commands.unsetBold();
            this.editor.commands.unsetItalic();
            this.editor.commands.unsetStrike();
          }, 10);
        }

        return false; // 不阻止默认行为
      },
    };
  },
});
export default ClearMarksOnEnter;
