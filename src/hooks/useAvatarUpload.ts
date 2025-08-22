import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { useUpdateUserMutation, userQueryKeys } from './useUserQuery';

import { uploadService } from '@/services/upload';

export function useAvatarUpload() {
  const queryClient = useQueryClient();
  const updateUserMutation = useUpdateUserMutation();

  return useMutation({
    mutationFn: async (file: File) => {
      // 验证文件类型
      if (!file.type.startsWith('image/')) {
        throw new Error('请上传图片文件');
      }

      // 验证文件大小 (最大 2MB)
      if (file.size > 2 * 1024 * 1024) {
        throw new Error('图片大小不能超过 2MB');
      }

      // 上传图片获取URL
      const imageUrl = await uploadService.uploadImage(file);

      return imageUrl;
    },
    onMutate: async (file) => {
      // 创建预览URL进行乐观更新
      const previewUrl = URL.createObjectURL(file);

      // 取消正在进行的查询
      await queryClient.cancelQueries({ queryKey: userQueryKeys.profile() });

      // 获取当前用户数据
      const previousUser = queryClient.getQueryData(userQueryKeys.profile());

      // 乐观更新 - 立即显示预览
      if (previousUser) {
        queryClient.setQueryData(userQueryKeys.profile(), {
          ...previousUser,
          avatar_url: previewUrl,
        });
      }

      return { previousUser, previewUrl };
    },
    onSuccess: async (imageUrl, file, context) => {
      // 清理预览URL
      if (context?.previewUrl) {
        URL.revokeObjectURL(context.previewUrl);
      }

      // 更新真实的头像URL
      await updateUserMutation.mutateAsync({ avatar_url: imageUrl });
    },
    onError: (error, file, context) => {
      // 清理预览URL
      if (context?.previewUrl) {
        URL.revokeObjectURL(context.previewUrl);
      }

      // 回滚到之前的数据
      if (context?.previousUser) {
        queryClient.setQueryData(userQueryKeys.profile(), context.previousUser);
      }

      console.error('头像上传失败:', error);
      toast.error(error instanceof Error ? error.message : '头像上传失败');
    },
  });
}
