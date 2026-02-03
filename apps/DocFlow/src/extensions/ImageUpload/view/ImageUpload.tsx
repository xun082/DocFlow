import { Editor, NodeViewWrapper } from '@tiptap/react';

import { ImageUploader } from './ImageUploader';

export const ImageUpload = ({
  getPos,
  editor,
}: {
  getPos: () => number | undefined;
  editor: Editor;
}) => {
  return (
    <NodeViewWrapper>
      <div className="p-0 m-0" data-drag-handle>
        <ImageUploader editor={editor} getPos={getPos} />
      </div>
    </NodeViewWrapper>
  );
};

export default ImageUpload;
