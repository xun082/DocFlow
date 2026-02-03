'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserX, Users, Mail, Clock } from 'lucide-react';

import friendService, { type Friend } from '@/services/friend';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function ExternalPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [friendToDelete, setFriendToDelete] = useState<Friend | null>(null);

  // 获取好友列表
  const { data: friendsData, isLoading } = useQuery({
    queryKey: ['friends'],
    queryFn: () => friendService.getFriendList(),
  });

  // 删除好友
  const deleteMutation = useMutation({
    mutationFn: (friendId: number) => friendService.removeFriend(friendId),
    onSuccess: () => {
      toast({
        title: '删除成功',
        description: '已成功删除该好友',
      });
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      setFriendToDelete(null);
    },
    onError: (error: Error) => {
      toast({
        title: '删除失败',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const friends = friendsData?.friends || [];

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto bg-white p-6">
        <div className="mb-6">
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2 p-4 border rounded-lg">
              <Skeleton className="w-16 h-16 rounded-full" />
              <Skeleton className="w-20 h-4" />
              <Skeleton className="w-24 h-3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (friends.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto bg-white flex items-center justify-center">
        <div className="text-center p-8">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无好友</h3>
          <p className="text-sm text-gray-500">添加好友后，他们会显示在这里</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto bg-white p-6">
        {/* 页面标题 */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-2xl font-bold text-gray-900">外部联系人</h1>
            <Badge variant="outline" className="text-sm">
              {friends.length} 人
            </Badge>
          </div>
          <p className="text-sm text-gray-600">管理你的所有外部好友关系</p>
        </div>

        {/* 好友网格 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {friends.map((friend) => (
            <div
              key={friend.id}
              className="group relative flex flex-col items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-md transition-all bg-white"
            >
              {/* 在线状态 */}
              <div className="relative">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={friend.avatar} alt={friend.name} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-lg">
                    {friend.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {friend.is_online && (
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
                )}
              </div>

              {/* 好友信息 */}
              <div className="text-center w-full">
                <h3 className="text-sm font-semibold text-gray-900 truncate mb-1">{friend.name}</h3>
                <div className="flex items-center justify-center gap-1 text-xs text-gray-500 mb-2">
                  <Mail className="w-3 h-3" />
                  <span className="truncate">{friend.email}</span>
                </div>
                <div className="flex items-center justify-center gap-1 text-xs text-gray-400">
                  <Clock className="w-3 h-3" />
                  <span>
                    好友时间: {new Date(friend.friends_since).toLocaleDateString('zh-CN')}
                  </span>
                </div>
              </div>

              {/* 删除按钮 - 悬停时显示 */}
              <Button
                variant="outline"
                size="sm"
                className="w-full opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-200"
                onClick={() => setFriendToDelete(friend)}
              >
                <UserX className="w-4 h-4 mr-1" />
                删除好友
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* 删除确认对话框 */}
      <AlertDialog open={!!friendToDelete} onOpenChange={() => setFriendToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除好友？</AlertDialogTitle>
            <AlertDialogDescription>
              你确定要删除好友 <strong>{friendToDelete?.name}</strong> 吗？
              <br />
              删除后，你们将无法再互相看到对方的信息。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => friendToDelete && deleteMutation.mutate(friendToDelete.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
