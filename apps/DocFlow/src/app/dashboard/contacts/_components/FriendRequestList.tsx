'use client';

import { useEffect, useState } from 'react';
import { Check, X, Clock, Send, Inbox, Loader2 } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ContactApi } from '@/services/contacts';
import { FriendRequest } from '@/services/contacts/types';

export default function FriendRequestList() {
  const [requests, setRequests] = useState<{ sent: FriendRequest[]; received: FriendRequest[] }>({
    sent: [],
    received: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const { toast } = useToast();

  // 获取好友请求列表
  const fetchFriendRequests = async () => {
    setIsLoading(true);

    try {
      const response = await ContactApi.getFriendRequests();

      if (response.data?.data) {
        const data = response.data.data as {
          sent: FriendRequest[];
          received: FriendRequest[];
        };
        setRequests(data);
      }
    } catch (error) {
      console.error('获取好友请求失败:', error);
      toast({
        title: '加载失败',
        description: '无法加载好友请求列表',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFriendRequests();
  }, []);

  // 接受好友请求
  const handleAccept = async (requestId: number) => {
    setProcessingId(requestId);

    try {
      const response = await ContactApi.acceptFriendRequest(requestId);

      if (response.error) {
        throw new Error(response.error);
      }

      toast({
        title: '已接受',
        description: '好友申请已接受',
      });
      // 刷新列表
      fetchFriendRequests();
    } catch (error) {
      console.error('接受好友请求失败:', error);
      toast({
        title: '操作失败',
        description: error instanceof Error ? error.message : '无法接受好友请求',
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
    }
  };

  // 拒绝好友请求
  const handleReject = async (requestId: number) => {
    setProcessingId(requestId);

    try {
      const response = await ContactApi.rejectFriendRequest(requestId);

      if (response.error) {
        throw new Error(response.error);
      }

      toast({
        title: '已拒绝',
        description: '好友申请已拒绝',
      });
      // 刷新列表
      fetchFriendRequests();
    } catch (error) {
      console.error('拒绝好友请求失败:', error);
      toast({
        title: '操作失败',
        description: error instanceof Error ? error.message : '无法拒绝好友请求',
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string, type: 'sent' | 'received') => {
    const upperStatus = status.toUpperCase();

    // 如果是发送的请求且状态为待处理，显示"等待对方同意"
    if (type === 'sent' && upperStatus === 'PENDING') {
      return (
        <Badge variant="secondary" className="bg-orange-100 text-orange-700">
          <Clock className="w-3 h-3 mr-1" />
          等待对方同意
        </Badge>
      );
    }

    switch (upperStatus) {
      case 'PENDING':
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
            <Clock className="w-3 h-3 mr-1" />
            待处理
          </Badge>
        );
      case 'ACCEPTED':
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-700">
            <Check className="w-3 h-3 mr-1" />
            已接受
          </Badge>
        );
      case 'REJECTED':
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-700">
            <X className="w-3 h-3 mr-1" />
            已拒绝
          </Badge>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Loader2 className="w-12 h-12 text-gray-400 animate-spin mb-3" />
        <p className="text-sm text-gray-500">加载中...</p>
      </div>
    );
  }

  const hasRequests = requests.received.length > 0 || requests.sent.length > 0;

  if (!hasRequests) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400">
        <Inbox className="w-16 h-16 mb-3" />
        <p className="text-sm">暂无好友请求</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* 收到的请求 */}
      {requests.received.length > 0 && (
        <div className="mb-6">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center">
            <Inbox className="w-4 h-4 mr-2 text-gray-600" />
            <h3 className="text-sm font-semibold text-gray-900">
              收到的请求 ({requests.received.length})
            </h3>
          </div>
          <ul className="divide-y divide-gray-100">
            {requests.received.map((request) => {
              const sender = request.sender;
              if (!sender) return null;

              return (
                <li key={request.id} className="px-4 py-4 hover:bg-gray-50">
                  <div className="flex items-start space-x-3">
                    {/* 头像 */}
                    <Avatar className="h-12 w-12 flex-shrink-0">
                      <AvatarImage src={sender.avatar_url} alt={sender.name} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white">
                        {sender.name?.slice(0, 2) || '?'}
                      </AvatarFallback>
                    </Avatar>

                    {/* 信息 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-gray-900">{sender.name}</p>
                        {getStatusBadge(request.status, 'received')}
                      </div>
                      <p className="text-xs text-gray-500 mb-2">{sender.email}</p>
                      {request.message && (
                        <p className="text-sm text-gray-700 bg-gray-50 rounded p-2 mb-3">
                          {request.message}
                        </p>
                      )}
                      <p className="text-xs text-gray-400">
                        {new Date(request.created_at).toLocaleString('zh-CN')}
                      </p>

                      {/* 操作按钮 */}
                      {request.status === 'PENDING' && (
                        <div className="flex space-x-2 mt-3">
                          <Button
                            size="sm"
                            onClick={() => handleAccept(request.id)}
                            disabled={processingId === request.id}
                          >
                            {processingId === request.id ? (
                              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                            ) : (
                              <Check className="w-3 h-3 mr-1" />
                            )}
                            接受
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReject(request.id)}
                            disabled={processingId === request.id}
                          >
                            <X className="w-3 h-3 mr-1" />
                            拒绝
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* 发送的请求 */}
      {requests.sent.length > 0 && (
        <div>
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center">
            <Send className="w-4 h-4 mr-2 text-gray-600" />
            <h3 className="text-sm font-semibold text-gray-900">
              发送的请求 ({requests.sent.length})
            </h3>
          </div>
          <ul className="divide-y divide-gray-100">
            {requests.sent.map((request) => {
              const receiver = request.receiver;
              if (!receiver) return null;

              return (
                <li key={request.id} className="px-4 py-4 hover:bg-gray-50">
                  <div className="flex items-start space-x-3">
                    {/* 头像 */}
                    <Avatar className="h-12 w-12 flex-shrink-0">
                      <AvatarImage src={receiver.avatar_url} alt={receiver.name} />
                      <AvatarFallback className="bg-gradient-to-br from-purple-400 to-purple-600 text-white">
                        {receiver.name?.slice(0, 2) || '?'}
                      </AvatarFallback>
                    </Avatar>

                    {/* 信息 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-gray-900">{receiver.name}</p>
                        {getStatusBadge(request.status, 'sent')}
                      </div>
                      <p className="text-xs text-gray-500 mb-2">{receiver.email}</p>
                      {request.message && (
                        <p className="text-sm text-gray-700 bg-gray-50 rounded p-2 mb-3">
                          {request.message}
                        </p>
                      )}
                      <p className="text-xs text-gray-400">
                        {new Date(request.created_at).toLocaleString('zh-CN')}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
