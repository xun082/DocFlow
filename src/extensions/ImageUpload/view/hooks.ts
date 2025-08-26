import { DragEvent, useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useMutation } from '@tanstack/react-query';
import { Editor } from '@tiptap/core';

import { uploadService } from '@/services/upload';

export const useUploader = () => {
  const [loading, setLoading] = useState(false);

  const uploadFile = useCallback(async (file: File) => {
    setLoading(true);

    try {
      const url = await uploadService.uploadImage(file);

      return url;
    } catch (errPayload: any) {
      const error = errPayload?.response?.data?.error || 'Something went wrong';
      toast.error(error);
    }

    setLoading(false);
  }, []);

  return { loading, uploadFile };
};

export const useFileUpload = () => {
  const fileInput = useRef<HTMLInputElement>(null);

  const handleUploadClick = useCallback(() => {
    fileInput.current?.click();
  }, []);

  return { ref: fileInput, handleUploadClick };
};

export const useDropZone = ({ uploader }: { uploader: (file: File) => void }) => {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [draggedInside, setDraggedInside] = useState<boolean>(false);

  useEffect(() => {
    const dragStartHandler = () => {
      setIsDragging(true);
    };

    const dragEndHandler = () => {
      setIsDragging(false);
    };

    document.body.addEventListener('dragstart', dragStartHandler);
    document.body.addEventListener('dragend', dragEndHandler);

    return () => {
      document.body.removeEventListener('dragstart', dragStartHandler);
      document.body.removeEventListener('dragend', dragEndHandler);
    };
  }, []);

  const onDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault(); // 立即阻止默认行为
      e.stopPropagation();

      setDraggedInside(false);

      if (e.dataTransfer.files.length === 0) {
        return;
      }

      const fileList = e.dataTransfer.files;
      const files: File[] = [];

      for (let i = 0; i < fileList.length; i += 1) {
        const item = fileList.item(i);

        if (item) {
          files.push(item);
        }
      }

      if (files.some((file) => file.type.indexOf('image') === -1)) {
        return;
      }

      const filteredFiles = files.filter((f) => f.type.indexOf('image') !== -1);
      const file = filteredFiles.length > 0 ? filteredFiles[0] : undefined;

      if (file) {
        uploader(file);
      }
    },
    [uploader],
  );

  const onDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const onDragEnter = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggedInside(true);
  }, []);

  const onDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggedInside(false);
  }, []);

  return { isDragging, draggedInside, onDragEnter, onDragLeave, onDragOver, onDrop };
};

export const useImgUpload = ({
  editor,
  getPos,
}: {
  editor: Editor;
  getPos: () => number | undefined;
}) => {
  const uploadMutation = useMutation({
    // 定义上传函数
    mutationFn: async (file: File) => {
      // 文件类型验证
      if (!file.type.startsWith('image/')) {
        throw new Error('请上传图片文件');
      }

      // 文件大小验证 (10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('图片大小不能超过 10MB');
      }

      // 调用上传服务
      const imageUrl = await uploadService.uploadImage(file);

      return imageUrl; // 返回上传后的 URL
    },

    // 上传成功回调
    onSuccess: (imageUrl) => {
      const pos = getPos();
      editor
        .chain()
        .deleteRange({ from: pos ?? 0, to: pos ?? 0 })
        .setImageBlock({ src: imageUrl })
        .focus()
        .run();
    },

    // 上传失败回调
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : '图片上传失败';
      toast.error(errorMessage);
      console.error('上传失败:', error);
    },

    // 上传开始回调
    onMutate: (file) => {
      const reader = new FileReader();
      const pos = getPos();

      reader.onload = async (e) => {
        const base64Url = e.target?.result as string;
        editor
          .chain()
          .deleteRange({ from: pos ?? 0, to: pos ?? 0 })
          .setImageBlock({ src: base64Url })
          .focus()
          .run();
      };

      reader.onerror = () => {
        toast.error('文件读取失败');
      };

      // 开始读取文件为 base64
      reader.readAsDataURL(file);
    },
  });

  // 封装上传函数
  const uploadImage = useCallback(
    async (file: File) => {
      try {
        const imageUrl = await uploadMutation.mutateAsync(file);

        return imageUrl;
      } catch (error) {
        throw error;
      }
    },
    [uploadMutation],
  );

  // 重置状态
  const reset = useCallback(() => {
    uploadMutation.reset();
  }, [uploadMutation]);

  return {
    // 上传函数
    uploadImage,

    // 状态
    isUploading: uploadMutation.isPending,
    isSuccess: uploadMutation.isSuccess,
    isError: uploadMutation.isError,

    // 数据和错误
    data: uploadMutation.data,
    error: uploadMutation.error,

    // 重置函数
    reset,
  };
};
