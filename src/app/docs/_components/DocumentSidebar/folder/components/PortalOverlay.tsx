'use client';

import { createPortal } from 'react-dom';
import { DragOverlay, Modifier } from '@dnd-kit/core';
import { defaultDropAnimation } from '@dnd-kit/core';

import { RenderFile } from './RenderFile';
import { FileItem } from '../type';
import { FileTreeProps } from './FileTree';

export default function PortalOverlay({
  activeFile,
  ...props
}: { activeFile: FileItem } & FileTreeProps): React.ReactPortal {
  const adjustTranslate: Modifier = ({ transform }) => {
    return {
      ...transform,
      y: transform.y - 15,
    };
  };

  return createPortal(
    <DragOverlay modifiers={[adjustTranslate]} dropAnimation={{ ...defaultDropAnimation }}>
      {typeof window !== 'undefined' && activeFile && (
        <RenderFile
          isOverlay={true}
          {...props}
          depth={activeFile.depth}
          file={activeFile}
          id={activeFile.id}
        />
      )}
    </DragOverlay>,
    document?.body,
  );
}
