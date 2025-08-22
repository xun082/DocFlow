import { ChangeEvent, useCallback, useState } from 'react';
import { Editor } from '@tiptap/core';

import { useDropZone, useFileUpload } from './hooks';

import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/utils/utils';
import uploadService from '@/services/upload';

export const ImageUploader = ({
  getPos,
  editor,
}: {
  getPos: () => number | undefined;
  editor: Editor;
}) => {
  // const { loading, uploadFile } = useUploader();
  const { handleUploadClick, ref } = useFileUpload();

  const [loading, setLoading] = useState(false);

  const uploadAndReplaceImage = async (file: File, base64Url: string) => {
    const serverUrl = await uploadService.uploadImage(file);
    const { state } = editor;
    let targetPos = null;

    state.doc.descendants((node, pos) => {
      if (node.type.name === 'imageBlock' && node.attrs.src === base64Url) {
        targetPos = pos;

        return false; // 停止遍历
      }
    });

    if (targetPos !== null) {
      editor
        .chain()
        .setNodeSelection(targetPos)
        .updateAttributes('imageBlock', { src: serverUrl })
        .focus()
        .run();
    }
  };
  // 处理图片文件的方法
  const handleImageFile = useCallback(
    (file: File) => {
      const pos = getPos();
      const reader = new FileReader();

      reader.onload = async (e) => {
        setLoading(true);

        const base64Url = e.target?.result as string;
        editor
          .chain()
          .deleteRange({ from: pos ?? 0, to: pos ?? 0 })
          .setImageBlock({ src: base64Url })
          .focus()
          .run();

        uploadAndReplaceImage(file, base64Url);
      };

      reader.onloadend = () => {
        setLoading(false);
      };

      reader.onerror = () => {
        console.error('文件读取失败');
      };

      reader.readAsDataURL(file);
    },
    [getPos, editor, uploadAndReplaceImage],
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

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 rounded-lg min-h-[10rem] bg-opacity-80">
        <Spinner className="text-neutral-500" size={1.5} />
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
