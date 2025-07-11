'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, EyeIcon, EyeOffIcon } from 'lucide-react';
import { toast } from 'sonner';

import { FileItem } from './type';
import UserSelector from './components/UserSelector';

import { Icon } from '@/components/ui/Icon';
import { cn } from '@/utils/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import DocumentApi from '@/services/document';
import { CreateShareLinkDto } from '@/services/document/type';
import { User } from '@/services/users/type';

// 表单验证 schema
const shareFormSchema = z.object({
  permission: z.enum(['VIEW', 'COMMENT', 'EDIT', 'MANAGE', 'FULL']),
  password: z.string().optional(),
  expiresAt: z.date().optional(),
  selectedUsers: z
    .array(
      z.object({
        id: z.number(),
        name: z.string(),
        email: z.string().nullable().optional(),
        avatar_url: z.string(),
      }),
    )
    .optional(),
});

type ShareFormData = z.infer<typeof shareFormSchema>;

interface ShareDialogProps {
  file: FileItem;
  isOpen: boolean;
  onClose: () => void;
}

const ShareDialog = ({ file, isOpen, onClose }: ShareDialogProps) => {
  const [shareUrl, setShareUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  const calendarRef = useRef<HTMLDivElement>(null);

  const form = useForm<ShareFormData>({
    resolver: zodResolver(shareFormSchema),
    defaultValues: {
      permission: 'VIEW',
      password: '',
      expiresAt: undefined,
      selectedUsers: [],
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = form;
  const watchedValues = watch();

  // 点击外部关闭日历
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
      }
    };

    if (showCalendar) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCalendar]);

  // 处理用户选择变化
  const handleUserSelectionChange = useCallback(
    (users: User[]) => {
      setSelectedUsers(users);
      setValue('selectedUsers', users);
    },
    [setValue],
  );

  const onSubmit = async (data: ShareFormData) => {
    setIsLoading(true);

    try {
      const shareData: CreateShareLinkDto = {
        permission: data.permission,
        password: data.password || undefined,
        expires_at: data.expiresAt ? data.expiresAt.toISOString() : undefined,
        shareWithUserIds:
          selectedUsers.length > 0 ? selectedUsers.map((user) => user.id) : undefined,
      };

      const response = await DocumentApi.CreateShareLink(parseInt(file.id), shareData);

      if (response?.data?.code === 201 && response?.data?.data) {
        // 根据实际返回的数据结构构建分享链接
        const shareId = response.data.data.id;
        let shareUrl = `${window.location.origin}/share/${shareId}`;

        // 如果有密码，添加密码参数到URL中
        if (data.password) {
          const urlParams = new URLSearchParams();
          urlParams.set('password', data.password);
          shareUrl += `?${urlParams.toString()}`;
        }

        setShareUrl(shareUrl);

        // 复制到剪贴板
        await navigator.clipboard.writeText(shareUrl);

        const userCount = selectedUsers.length;
        const description = data.password
          ? '链接包含访问密码'
          : userCount > 0
            ? `已分享给 ${userCount} 个用户`
            : '任何人都可以通过此链接访问';

        toast.success('分享链接已创建并复制到剪贴板！', {
          description,
          duration: 4000,
        });
      } else {
        toast.error('创建分享链接失败', {
          description: '请检查网络连接或稍后重试',
        });
      }
    } catch (error) {
      console.error('创建分享链接失败:', error);
      toast.error('创建分享链接失败', {
        description: '请检查网络连接或稍后重试',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (shareUrl) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('链接已复制到剪贴板！');
      } catch (error) {
        console.error('复制失败:', error);
        toast.error('复制失败，请手动复制链接');
      }
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    setValue('expiresAt', date);
    setShowCalendar(false);
  };

  const getPermissionLabel = (value: string) => {
    switch (value) {
      case 'VIEW':
        return '仅查看';
      case 'COMMENT':
        return '可评论';
      case 'EDIT':
        return '可编辑';
      case 'MANAGE':
        return '可管理';
      case 'FULL':
        return '完全控制';
      default:
        return '选择权限';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>分享文档</DialogTitle>
          <DialogDescription>创建分享链接，让其他人可以访问您的文档</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* 文件信息 */}
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <Icon
              name={file.type === 'folder' ? 'Folder' : 'FileText'}
              className={cn(
                'h-8 w-8',
                file.type === 'folder' ? 'text-yellow-500' : 'text-blue-500',
              )}
            />
            <div>
              <p className="font-medium text-gray-900">{file.name}</p>
              <p className="text-sm text-gray-500">{file.type === 'folder' ? '文件夹' : '文档'}</p>
            </div>
          </div>

          {/* 权限选择 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">访问权限</label>
            <Select
              value={watchedValues.permission}
              onValueChange={(value) => setValue('permission', value as any)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="选择权限">
                  {getPermissionLabel(watchedValues.permission)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="VIEW">仅查看</SelectItem>
                <SelectItem value="COMMENT">可评论</SelectItem>
                <SelectItem value="EDIT">可编辑</SelectItem>
                <SelectItem value="MANAGE">可管理</SelectItem>
                <SelectItem value="FULL">完全控制</SelectItem>
              </SelectContent>
            </Select>
            {errors.permission && (
              <p className="text-sm text-red-600">{errors.permission.message}</p>
            )}
          </div>

          {/* 高级选项 */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              <Icon name={showAdvanced ? 'ChevronDown' : 'ChevronRight'} className="h-4 w-4 mr-1" />
              高级选项
            </button>

            {showAdvanced && (
              <div className="space-y-4 pl-5 border-l-2 border-gray-100">
                {/* 密码保护 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">密码保护（可选）</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      {...register('password')}
                      placeholder="设置访问密码"
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOffIcon className="h-4 w-4" />
                      ) : (
                        <EyeIcon className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-600">{errors.password.message}</p>
                  )}
                </div>

                {/* 过期时间 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">过期时间（可选）</label>
                  <div className="relative" ref={calendarRef}>
                    <button
                      type="button"
                      onClick={() => setShowCalendar(!showCalendar)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-left flex items-center justify-between"
                    >
                      <span className={watchedValues.expiresAt ? 'text-gray-900' : 'text-gray-500'}>
                        {watchedValues.expiresAt
                          ? format(watchedValues.expiresAt, 'yyyy年MM月dd日')
                          : '选择过期日期'}
                      </span>
                      <CalendarIcon className="h-4 w-4 text-gray-400" />
                    </button>

                    {showCalendar && (
                      <div className="absolute top-full left-0 mt-1 z-50 bg-white border border-gray-200 rounded-lg shadow-lg">
                        <Calendar
                          mode="single"
                          selected={watchedValues.expiresAt}
                          onSelect={handleDateSelect}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                        <div className="p-3 border-t border-gray-200">
                          <button
                            type="button"
                            onClick={() => {
                              setValue('expiresAt', undefined);
                              setShowCalendar(false);
                            }}
                            className="w-full px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                          >
                            清除日期
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  {errors.expiresAt && (
                    <p className="text-sm text-red-600">{errors.expiresAt.message}</p>
                  )}
                </div>

                {/* 用户选择器 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    分享给特定用户（可选）
                  </label>
                  <UserSelector
                    selectedUsers={selectedUsers}
                    onSelectionChange={handleUserSelectionChange}
                    placeholder="搜索用户姓名或邮箱..."
                    maxSelections={10}
                  />
                  <p className="text-xs text-gray-500">
                    搜索并选择要分享的用户，最多可选择10个用户
                  </p>
                  {errors.selectedUsers && (
                    <p className="text-sm text-red-600">{errors.selectedUsers.message}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 分享链接显示 */}
          {shareUrl && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1 mr-3">
                  <p className="text-sm font-medium text-green-800 mb-1">分享链接已生成</p>
                  <p className="text-xs text-green-600 break-all font-mono bg-green-100 p-2 rounded">
                    {shareUrl}
                  </p>
                  {selectedUsers.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-green-700 mb-1">已分享给以下用户：</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedUsers.map((user) => (
                          <span
                            key={user.id}
                            className="inline-flex items-center gap-1 bg-green-200 text-green-800 px-2 py-1 rounded text-xs"
                          >
                            {user.avatar_url && (
                              <img
                                src={user.avatar_url}
                                alt={user.name}
                                className="w-3 h-3 rounded-full"
                              />
                            )}
                            {user.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors flex items-center"
                >
                  <Icon name="Copy" className="h-3 w-3 mr-1" />
                  复制
                </button>
              </div>
            </div>
          )}

          <DialogFooter>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
            >
              {isLoading && <Icon name="Loader" className="h-4 w-4 mr-2 animate-spin" />}
              {shareUrl ? '重新生成链接' : '创建分享链接'}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ShareDialog;
