import { ChangeEvent, useCallback } from 'react';
import { Editor } from '@tiptap/core';

import { useDropZone, useFileUpload, useImgUpload } from './hooks';

import Spinner from '@/components/ui/Spinner';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/utils/utils';

export const ImageUploader = ({
  getPos,
  editor,
}: {
  getPos: () => number | undefined;
  editor: Editor;
}) => {
  const { handleUploadClick, ref } = useFileUpload();
  const { isUploading, uploadImage } = useImgUpload({ editor, getPos });

  // 处理图片文件的方法
  const handleImageFile = useCallback(
    (file: File) => {
      uploadImage(file);
    },
    [getPos, editor],
  );

  const { draggedInside, onDragOver, onDrop, onDragEnter, onDragLeave } = useDropZone({
    uploader: handleImageFile,
  });
  const onFileChange = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files?.[0]) {
        const file = e.target.files[0];
        handleImageFile(file);
      }
    },
    [handleImageFile],
  );

  if (isUploading) {
    return (
      <div className="flex items-center justify-center p-8 rounded-lg min-h-[10rem] bg-opacity-80">
        <Spinner className="text-neutral-500" size="lg" />
      </div>
    );
  }

  const wrapperClass = cn(
    'flex flex-col items-center justify-center px-8 py-10 rounded-lg bg-opacity-80',
    draggedInside && 'bg-neutral-100',
  );

  return (
    <div
      className={wrapperClass}
      onDrop={onDrop}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver} // 添加这一行
      contentEditable={false}
    >
      <Icon name="Image" className="w-12 h-12 mb-4 text-black dark:text-white opacity-20" />
      <div className="flex flex-col items-center justify-center gap-2">
        <div className="text-sm font-medium text-center text-neutral-400 dark:text-neutral-500">
          {draggedInside ? 'Drop image here' : 'Drag and drop or'}
        </div>
        <div>
          <Button disabled={draggedInside} onClick={handleUploadClick} variant="default" size="sm">
            <Icon name="Upload" />
            Upload an image
          </Button>
        </div>
      </div>
      <input
        className="w-0 h-0 overflow-hidden opacity-0"
        ref={ref}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,.gif"
        onChange={onFileChange}
      />
    </div>
  );
};

export default ImageUploader;
