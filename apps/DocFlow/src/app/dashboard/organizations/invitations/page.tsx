'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Mail, Clock, Building2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

import organizationService from '@/services/organization';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function PendingItemsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('invitations');

  // 获取待处理项
  const { data, isLoading, error } = useQuery({
    queryKey: ['organization-pending-items'],
    queryFn: () => organizationService.getMyPendingItems(),
  });

  // 接受邀请
  const acceptInvitationMutation = useMutation({
    mutationFn: (id: string) => organizationService.acceptInvitation({ id }),
    onSuccess: () => {
      toast({
        title: '已接受邀请',
        description: '你已成功加入组织',
      });
      queryClient.invalidateQueries({ queryKey: ['organization-pending-items'] });
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
    onError: (error: Error) => {
      toast({
        title: '操作失败',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // 拒绝邀请
  const rejectInvitationMutation = useMutation({
    mutationFn: (id: string) => organizationService.rejectInvitation({ id }),
    onSuccess: () => {
      toast({
        title: '已拒绝邀请',
        description: '邀请已被拒绝',
      });
      queryClient.invalidateQueries({ queryKey: ['organization-pending-items'] });
    },
    onError: (error: Error) => {
      toast({
        title: '操作失败',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // 批准申请
  const approveRequestMutation = useMutation({
    mutationFn: ({ organizationId, id }: { organizationId: string | number; id: string }) =>
      organizationService.approveJoinRequest(organizationId, { id }),
    onSuccess: () => {
      toast({
        title: '已批准申请',
        description: '用户已加入组织',
      });
      queryClient.invalidateQueries({ queryKey: ['organization-pending-items'] });
    },
    onError: (error: Error) => {
      toast({
        title: '操作失败',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // 拒绝申请
  const rejectRequestMutation = useMutation({
    mutationFn: ({ organizationId, id }: { organizationId: string | number; id: string }) =>
      organizationService.rejectJoinRequest(organizationId, { id }),
    onSuccess: () => {
      toast({
        title: '已拒绝申请',
        description: '申请已被拒绝',
      });
      queryClient.invalidateQueries({ queryKey: ['organization-pending-items'] });
    },
    onError: (error: Error) => {
      toast({
        title: '操作失败',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  if (isLoading) {
    return (
      <div className="h-full p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">加载失败</h3>
          <p className="text-sm text-gray-600">{(error as Error).message}</p>
        </div>
      </div>
    );
  }

  const invitations = data?.invitations || [];
  const requests = data?.requests || [];

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="max-w-4xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">我的邀请和申请</h1>
          <p className="text-sm text-gray-600">
            查看并处理你收到的组织邀请以及需要你审批的加入申请
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
            <TabsTrigger value="invitations" className="relative">
              收到的邀请
              {invitations.length > 0 && (
                <Badge variant="destructive" className="ml-2 px-1.5 py-0.5 text-xs">
                  {invitations.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="requests" className="relative">
              待审批申请
              {requests.length > 0 && (
                <Badge variant="destructive" className="ml-2 px-1.5 py-0.5 text-xs">
                  {requests.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* 收到的邀请 */}
          <TabsContent value="invitations" className="space-y-4">
            {invitations.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-sm font-medium text-gray-900 mb-1">暂无邀请</h3>
                  <p className="text-xs text-gray-500">你当前没有待处理的组织邀请</p>
                </CardContent>
              </Card>
            ) : (
              invitations.map((invitation) => (
                <Card key={invitation.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        {/* Organization Logo */}
                        <div className="flex-shrink-0">
                          {invitation.organization?.logo_url ? (
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={invitation.organization.logo_url} />
                              <AvatarFallback>
                                <Building2 className="w-6 h-6" />
                              </AvatarFallback>
                            </Avatar>
                          ) : (
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                              <Building2 className="w-6 h-6 text-white" />
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-semibold text-gray-900 mb-1">
                            {invitation.organization?.name || '未知组织'}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {invitation.inviter?.name || '某人'} 邀请你加入组织
                          </p>

                          {invitation.message && (
                            <p className="text-sm text-gray-700 bg-gray-50 rounded-md p-3 mb-3">
                              "{invitation.message}"
                            </p>
                          )}

                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Badge variant="outline" className="text-xs">
                                {invitation.role === 'OWNER'
                                  ? '所有者'
                                  : invitation.role === 'ADMIN'
                                    ? '管理员'
                                    : '成员'}
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>
                                {formatDistanceToNow(new Date(invitation.created_at), {
                                  addSuffix: true,
                                  locale: zhCN,
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => rejectInvitationMutation.mutate(invitation.id)}
                          disabled={
                            acceptInvitationMutation.isPending || rejectInvitationMutation.isPending
                          }
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          拒绝
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => acceptInvitationMutation.mutate(invitation.id)}
                          disabled={
                            acceptInvitationMutation.isPending || rejectInvitationMutation.isPending
                          }
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          接受
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* 待审批申请 */}
          <TabsContent value="requests" className="space-y-4">
            {requests.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-sm font-medium text-gray-900 mb-1">暂无申请</h3>
                  <p className="text-xs text-gray-500">你当前没有待审批的加入申请</p>
                </CardContent>
              </Card>
            ) : (
              requests.map((request) => (
                <Card key={request.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        {/* User Avatar */}
                        <div className="flex-shrink-0">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={request.avatar_url} />
                            <AvatarFallback>{request.username?.[0]?.toUpperCase()}</AvatarFallback>
                          </Avatar>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-semibold text-gray-900 mb-1">
                            {request.username}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            申请加入你的组织 • {request.email}
                          </p>

                          {request.message && (
                            <p className="text-sm text-gray-700 bg-gray-50 rounded-md p-3 mb-3">
                              "{request.message}"
                            </p>
                          )}

                          <div className="flex items-center space-x-1 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            <span>
                              {formatDistanceToNow(new Date(request.created_at), {
                                addSuffix: true,
                                locale: zhCN,
                              })}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            rejectRequestMutation.mutate({
                              organizationId: request.organization_id,
                              id: request.id,
                            })
                          }
                          disabled={
                            approveRequestMutation.isPending || rejectRequestMutation.isPending
                          }
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          拒绝
                        </Button>
                        <Button
                          size="sm"
                          onClick={() =>
                            approveRequestMutation.mutate({
                              organizationId: request.organization_id,
                              id: request.id,
                            })
                          }
                          disabled={
                            approveRequestMutation.isPending || rejectRequestMutation.isPending
                          }
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          批准
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
