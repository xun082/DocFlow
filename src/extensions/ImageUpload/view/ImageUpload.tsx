import { Editor, NodeViewWrapper } from '@tiptap/react';
import { useCallback } from 'react';

import { ImageUploader } from './ImageUploader';

export const ImageUpload = ({
  getPos,
  editor,
}: {
  getPos: () => number | undefined;
  editor: Editor;
}) => {
  const onUpload = useCallback(
    (url: string) => {
      if (url) {
        const pos = getPos();

        if (pos !== undefined) {
          editor
            .chain()
            .setImageBlock({ src: url })
            .deleteRange({ from: pos, to: pos })
            .focus()
            .run();
        }
      }
    },
    [getPos, editor],
  );

  return (
    <NodeViewWrapper>
      <div className="m-0 p-0" data-drag-handle>
        <ImageUploader onUpload={onUpload} />
      </div>
    </NodeViewWrapper>
  );
};

export default ImageUpload;
