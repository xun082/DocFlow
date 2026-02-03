'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserPlus, Search, X, Loader2 } from 'lucide-react';

import { inviteMemberSchema, type InviteMemberFormData } from './schemas';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Textarea from '@/components/ui/Textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import organizationService, { OrganizationRole } from '@/services/organization';
import UserApi from '@/services/users';
import type { User } from '@/services/users/type';

interface InviteMemberDialogProps {
  organizationId: number;
  children?: React.ReactNode;
}

export default function InviteMemberDialog({ organizationId, children }: InviteMemberDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const form = useForm<InviteMemberFormData>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: {
      user_id: undefined as unknown as number,
      role: OrganizationRole.MEMBER,
      message: '',
    },
  });

  // 获取角色列表
  const { data: rolesData } = useQuery({
    queryKey: ['organization-roles'],
    queryFn: () => organizationService.getRoles(),
  });

  // 搜索用户
  const searchUsers = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setSearchResults([]);
        setIsSearching(false);

        return;
      }

      setIsSearching(true);

      try {
        const response = await UserApi.searchUsers(query, 20, 0);

        if (response.data?.data) {
          const searchData = response.data.data as { users: User[]; total: number };
          setSearchResults(searchData.users || []);
        }
      } catch (error) {
        console.error('搜索用户失败:', error);
        toast({
          title: '搜索失败',
          description: '无法搜索用户，请稍后重试',
          variant: 'destructive',
        });
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    [toast],
  );

  // 处理搜索输入
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setShowDropdown(true);

    // 防抖搜索
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchUsers(query);
    }, 300);
  };

  // 选择用户
  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setSearchQuery(user.name || user.email || '');
    setShowDropdown(false);
    form.setValue('user_id', user.id);
    form.clearErrors('user_id');
  };

  // 清除选择
  const handleClearUser = () => {
    setSelectedUser(null);
    setSearchQuery('');
    setSearchResults([]);
    form.setValue('user_id', undefined as unknown as number);
  };

  // 点击外部关闭下拉框
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 清理搜索定时器
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const inviteMutation = useMutation({
    mutationFn: (data: InviteMemberFormData) =>
      organizationService.inviteMember(organizationId, data),
    onSuccess: () => {
      toast({
        title: '邀请成功',
        description: '邀请已发送',
      });
      queryClient.invalidateQueries({ queryKey: ['organization', organizationId, 'members'] });
      queryClient.invalidateQueries({ queryKey: ['organization-pending-items'] });
      form.reset();
      handleClearUser();
      setOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: '邀请失败',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: InviteMemberFormData) => {
    inviteMutation.mutate(data);
  };

  const roles = rolesData?.roles || [];

  // 对话框关闭时重置状态
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);

    if (!isOpen) {
      form.reset();
      handleClearUser();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {children ? (
        <DialogTrigger asChild>{children}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button size="sm" variant="ghost" className="h-6 gap-1 text-xs">
            <UserPlus className="w-3 h-3" />
            邀请
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>邀请成员</DialogTitle>
          <DialogDescription>搜索并选择用户，邀请其加入组织</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* 用户搜索 */}
            <FormField
              control={form.control}
              name="user_id"
              render={() => (
                <FormItem>
                  <FormLabel>
                    选择用户 <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative" ref={dropdownRef}>
                      {/* 已选择的用户 */}
                      {selectedUser ? (
                        <div className="flex items-center gap-3 p-3 border rounded-md bg-blue-50 border-blue-200">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={selectedUser.avatar_url} />
                            <AvatarFallback>
                              {selectedUser.name?.[0]?.toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {selectedUser.name}
                            </div>
                            {selectedUser.email && (
                              <div className="text-xs text-gray-500 truncate">
                                {selectedUser.email}
                              </div>
                            )}
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={handleClearUser}
                            className="h-6 w-6 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          {/* 搜索输入框 */}
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              placeholder="搜索用户名或邮箱..."
                              value={searchQuery}
                              onChange={handleSearchChange}
                              onFocus={() => setShowDropdown(true)}
                              className="pl-9"
                            />
                          </div>

                          {/* 搜索结果下拉框 */}
                          {showDropdown &&
                            (searchResults.length > 0 || isSearching || searchQuery) && (
                              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                {isSearching ? (
                                  <div className="flex items-center justify-center p-4">
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    <span className="text-sm text-gray-500">搜索中...</span>
                                  </div>
                                ) : searchResults.length > 0 ? (
                                  <div>
                                    <div className="p-2 text-xs text-gray-500 border-b border-gray-200">
                                      找到 {searchResults.length} 个用户
                                    </div>
                                    {searchResults.map((user) => (
                                      <div
                                        key={user.id}
                                        className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                                        onClick={() => handleSelectUser(user)}
                                      >
                                        <Avatar className="w-8 h-8">
                                          <AvatarImage src={user.avatar_url} />
                                          <AvatarFallback>
                                            {user.name?.[0]?.toUpperCase() || 'U'}
                                          </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                          <div className="text-sm font-medium text-gray-900 truncate">
                                            {user.name}
                                          </div>
                                          {user.email && (
                                            <div className="text-xs text-gray-500 truncate">
                                              {user.email}
                                            </div>
                                          )}
                                        </div>
                                        {user.location && (
                                          <div className="text-xs text-gray-400">
                                            {user.location}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                ) : searchQuery ? (
                                  <div className="p-4 text-center text-sm text-gray-500">
                                    未找到匹配的用户
                                  </div>
                                ) : null}
                              </div>
                            )}
                        </>
                      )}
                    </div>
                  </FormControl>
                  <FormDescription>搜索并选择要邀请的用户</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 角色选择 */}
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>角色</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="选择角色" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          <div className="flex flex-col items-start">
                            <span className="font-medium">{role.label}</span>
                            <span className="text-xs text-gray-500">{role.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 邀请消息 */}
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>邀请消息</FormLabel>
                  <FormControl>
                    <Textarea placeholder="欢迎加入我们的组织..." rows={3} {...field} />
                  </FormControl>
                  <FormDescription>最多500个字符</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={inviteMutation.isPending}
              >
                取消
              </Button>
              <Button type="submit" disabled={inviteMutation.isPending || !selectedUser}>
                {inviteMutation.isPending ? '发送中...' : '发送邀请'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
