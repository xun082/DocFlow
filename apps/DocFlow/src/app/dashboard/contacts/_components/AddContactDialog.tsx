'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, UserPlus, Loader2, Send } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import Textarea from '@/components/ui/Textarea';
import { useToast } from '@/hooks/use-toast';
import { ContactApi } from '@/services/contacts';
import { UserApi } from '@/services/users';

interface AddContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'internal' | 'external' | 'group';
  onSuccess?: () => void;
}

interface User {
  id: number;
  name: string;
  email: string;
  avatar_url?: string;
  company?: string | null;
  role?: string;
}

export default function AddContactDialog({
  open,
  onOpenChange,
  type,
  onSuccess,
}: AddContactDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  // 搜索用户的函数，带防抖
  const searchUsers = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setSearchResults([]);

        return;
      }

      setIsSearching(true);

      try {
        const response = await UserApi.searchUsers(query, 20, 0);

        // API 返回的数据格式：RequestResult -> ApiResponse -> SearchUsersResponse
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
        // 使用模拟数据作为后备
        setSearchResults(getMockSearchResults(query));
      } finally {
        setIsSearching(false);
      }
    },
    [toast],
  );

  // 防抖搜索
  useEffect(() => {
    const timer = setTimeout(() => {
      searchUsers(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, searchUsers]);

  // 选择用户（单选，可以取消）
  const handleSelectUser = (user: User) => {
    // 如果点击的是当前选中的用户，取消选择
    if (selectedUser && selectedUser.id === user.id) {
      setSelectedUser(null);
      setMessage(''); // 取消选择时清空消息
    } else {
      // 否则选中该用户
      setSelectedUser(user);
    }
  };

  // 发送好友申请
  const handleSendFriendRequest = async () => {
    if (!selectedUser) {
      toast({
        title: '请选择联系人',
        description: '请先选择一个用户发送好友申请',
        variant: 'destructive',
      });

      return;
    }

    setIsSending(true);

    try {
      const response = await ContactApi.sendFriendRequest({
        friendId: selectedUser.id,
        message: message.trim() || undefined,
      });

      if (response.error) {
        throw new Error(response.error);
      }

      toast({
        title: '发送成功',
        description: `已向 ${selectedUser.name} 发送好友申请`,
      });

      // 重置状态并关闭对话框
      setSearchQuery('');
      setSearchResults([]);
      setSelectedUser(null);
      setMessage('');
      onOpenChange(false);

      // 调用成功回调
      onSuccess?.();
    } catch (error) {
      console.error('发送好友申请失败:', error);
      toast({
        title: '发送失败',
        description: error instanceof Error ? error.message : '无法发送好友申请，请稍后重试',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  // 关闭对话框时重置状态
  const handleClose = (open: boolean) => {
    if (!open) {
      setSearchQuery('');
      setSearchResults([]);
      setSelectedUser(null);
      setMessage('');
    }

    onOpenChange(open);
  };

  const getDialogTitle = () => {
    switch (type) {
      case 'external':
        return '添加联系人';
      case 'group':
        return '创建群组';
      default:
        return '添加企业成员';
    }
  };

  const getDialogDescription = () => {
    switch (type) {
      case 'external':
        return '输入姓名或邮箱搜索外部联系人';
      case 'group':
        return '输入姓名或邮箱搜索成员并创建群组';
      default:
        return '输入姓名或邮箱搜索企业成员';
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="!max-w-[60vw] !w-[60vw] sm:!max-w-[60vw] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
          <DialogDescription>{getDialogDescription()}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col space-y-4 flex-1 overflow-hidden">
          {/* 搜索框 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="输入姓名或邮箱进行搜索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
            )}
          </div>

          {/* 搜索结果列表和消息输入 */}
          <div className="flex-1 overflow-y-auto flex gap-4">
            {/* 左侧：搜索结果列表 */}
            <div className="flex-1 border rounded-lg overflow-hidden">
              {searchResults.length > 0 ? (
                <ul className="divide-y divide-gray-100">
                  {searchResults.map((user) => {
                    const isSelected = selectedUser?.id === user.id;

                    return (
                      <li key={user.id}>
                        <button
                          onClick={() => handleSelectUser(user)}
                          className={`
                            w-full px-4 py-3 flex items-center space-x-3 hover:bg-gray-50
                            transition-colors duration-150
                            ${isSelected ? 'bg-blue-50 border-l-4 border-blue-600' : ''}
                          `}
                        >
                          {/* 头像 */}
                          <Avatar className="h-12 w-12 flex-shrink-0">
                            <AvatarImage src={user.avatar_url} alt={user.name} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white">
                              {user.name.slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>

                          {/* 用户信息 */}
                          <div className="flex-1 min-w-0 text-left">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {user.name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                            {user.company && user.role && (
                              <p className="text-xs text-gray-400 truncate">
                                {user.company} · {user.role}
                              </p>
                            )}
                          </div>

                          {/* 选中指示器 */}
                          {isSelected && (
                            <div className="flex-shrink-0">
                              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                                <svg
                                  className="w-4 h-4 text-white"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              </div>
                            </div>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  {searchQuery ? (
                    isSearching ? (
                      <>
                        <Loader2 className="w-12 h-12 mb-3 animate-spin" />
                        <p className="text-sm">搜索中...</p>
                      </>
                    ) : (
                      <>
                        <Search className="w-12 h-12 mb-3" />
                        <p className="text-sm">未找到匹配的用户</p>
                      </>
                    )
                  ) : (
                    <>
                      <UserPlus className="w-12 h-12 mb-3" />
                      <p className="text-sm">输入姓名或邮箱开始搜索</p>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* 右侧：选中用户信息和申请消息 */}
            {selectedUser && (
              <div className="w-80 border rounded-lg p-4 flex flex-col space-y-4">
                {/* 选中用户信息 */}
                <div className="text-center pb-4 border-b">
                  <Avatar className="h-16 w-16 mx-auto mb-3">
                    <AvatarImage src={selectedUser.avatar_url} alt={selectedUser.name} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white text-xl">
                      {selectedUser.name.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <h4 className="text-base font-semibold text-gray-900">{selectedUser.name}</h4>
                  <p className="text-sm text-gray-500">{selectedUser.email}</p>
                  {selectedUser.company && selectedUser.role && (
                    <p className="text-xs text-gray-400 mt-1">
                      {selectedUser.company} · {selectedUser.role}
                    </p>
                  )}
                </div>

                {/* 申请消息输入 */}
                <div className="flex-1 flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-2">
                    好友请求附加消息（可选）
                  </label>
                  <Textarea
                    placeholder="你好，我想加你为好友，我们可以一起协作文档..."
                    value={message}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setMessage(e.target.value)
                    }
                    className="flex-1 resize-none"
                    maxLength={200}
                  />
                  <p className="text-xs text-gray-400 mt-1 text-right">{message.length}/200</p>
                </div>
              </div>
            )}
          </div>

          {/* 底部操作栏 */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-gray-500">
              {searchResults.length > 0 && (
                <span className="mr-4">
                  共找到 <span className="font-semibold text-gray-900">{searchResults.length}</span>{' '}
                  个用户
                </span>
              )}
              {selectedUser && (
                <span>
                  已选择：<span className="font-semibold text-gray-900">{selectedUser.name}</span>
                </span>
              )}
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => handleClose(false)} disabled={isSending}>
                取消
              </Button>
              <Button onClick={handleSendFriendRequest} disabled={!selectedUser || isSending}>
                {isSending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                    发送中...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-1.5" />
                    发送申请
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// 模拟搜索结果（作为后备）
function getMockSearchResults(query: string): User[] {
  const mockUsers: User[] = [
    {
      id: 1,
      name: '张三',
      email: 'zhangsan@example.com',
      avatar_url: '',
      company: '技术部',
      role: '高级工程师',
    },
    {
      id: 2,
      name: '李四',
      email: 'lisi@example.com',
      avatar_url: '',
      company: '产品部',
      role: '产品经理',
    },
    {
      id: 3,
      name: '王五',
      email: 'wangwu@example.com',
      avatar_url: '',
      company: '设计部',
      role: 'UI设计师',
    },
  ];

  const lowerQuery = query.toLowerCase();

  return mockUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(lowerQuery) || user.email.toLowerCase().includes(lowerQuery),
  );
}
