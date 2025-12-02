'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Mail,
  Clock,
  XCircle,
  CheckCircle,
  AlertCircle,
  Users,
  Filter,
  RefreshCw,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

import organizationService, { type Invitation } from '@/services/organization';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
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

interface InvitationListDialogProps {
  organizationId: number;
  children?: React.ReactNode;
}

function getStatusBadge(status: string) {
  switch (status.toUpperCase()) {
    case 'PENDING':
      return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">待处理</Badge>;
    case 'ACCEPTED':
      return <Badge className="bg-green-100 text-green-700 border-green-200">已接受</Badge>;
    case 'REJECTED':
      return <Badge className="bg-red-100 text-red-700 border-red-200">已拒绝</Badge>;
    case 'EXPIRED':
      return <Badge className="bg-gray-100 text-gray-700 border-gray-200">已过期</Badge>;
    case 'CANCELED':
      return <Badge className="bg-gray-100 text-gray-700 border-gray-200">已取消</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function getRoleLabel(role: string) {
  switch (role) {
    case 'OWNER':
      return '所有者';
    case 'ADMIN':
      return '管理员';
    case 'MEMBER':
      return '成员';
    default:
      return role;
  }
}

export default function InvitationListDialog({
  organizationId,
  children,
}: InvitationListDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // 获取邀请列表
  const { data, isLoading, error } = useQuery({
    queryKey: ['organization', organizationId, 'invitations'],
    queryFn: () => organizationService.getOrganizationInvitations(organizationId),
    enabled: open, // 只在对话框打开时查询
  });

  // 取消邀请
  const cancelMutation = useMutation({
    mutationFn: (invitationId: string) =>
      organizationService.cancelInvitation(organizationId, invitationId),
    onSuccess: () => {
      toast({
        title: '已取消邀请',
        description: '邀请已被取消',
      });
      queryClient.invalidateQueries({
        queryKey: ['organization', organizationId, 'invitations'],
      });
      queryClient.invalidateQueries({ queryKey: ['organization-pending-items'] });
      setShowCancelDialog(false);
      setCancelingId(null);
    },
    onError: (error: Error) => {
      toast({
        title: '取消失败',
        description: error.message,
        variant: 'destructive',
      });
      setShowCancelDialog(false);
      setCancelingId(null);
    },
  });

  const handleCancelInvitation = (invitationId: string) => {
    setCancelingId(invitationId);
    setShowCancelDialog(true);
  };

  const confirmCancel = () => {
    if (cancelingId) {
      cancelMutation.mutate(cancelingId);
    }
  };

  const invitations = data?.invitations || [];
  const pendingInvitations = invitations.filter((inv) => inv.status.toUpperCase() === 'PENDING');

  // 根据状态过滤
  const filteredInvitations =
    statusFilter === 'all'
      ? invitations
      : invitations.filter((inv) => inv.status.toUpperCase() === statusFilter.toUpperCase());

  // 统计各状态数量
  const statusCounts = {
    all: invitations.length,
    pending: invitations.filter((inv) => inv.status.toUpperCase() === 'PENDING').length,
    accepted: invitations.filter((inv) => inv.status.toUpperCase() === 'ACCEPTED').length,
    rejected: invitations.filter((inv) => inv.status.toUpperCase() === 'REJECTED').length,
    expired: invitations.filter((inv) => inv.status.toUpperCase() === 'EXPIRED').length,
    canceled: invitations.filter((inv) => inv.status.toUpperCase() === 'CANCELED').length,
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({
      queryKey: ['organization', organizationId, 'invitations'],
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        {children ? (
          <DialogTrigger asChild>{children}</DialogTrigger>
        ) : (
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="gap-2">
              <Mail className="w-4 h-4" />
              查看邀请
              {pendingInvitations.length > 0 && (
                <Badge variant="destructive" className="ml-1 px-1.5 py-0.5 text-xs">
                  {pendingInvitations.length}
                </Badge>
              )}
            </Button>
          </DialogTrigger>
        )}

        <DialogContent className="sm:max-w-[800px] max-h-[85vh]">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  邀请列表
                </DialogTitle>
                <DialogDescription>
                  查看和管理你发出的所有邀请（共 {invitations.length} 条）
                </DialogDescription>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleRefresh}
                disabled={isLoading}
                className="gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                刷新
              </Button>
            </div>
          </DialogHeader>

          {/* 状态筛选器 */}
          <div className="flex items-center gap-2 pb-4 border-b">
            <Filter className="w-4 h-4 text-gray-500" />
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                size="sm"
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('all')}
                className="h-8"
              >
                全部
                {statusCounts.all > 0 && (
                  <Badge variant="secondary" className="ml-2 px-1.5 py-0 text-xs">
                    {statusCounts.all}
                  </Badge>
                )}
              </Button>
              <Button
                size="sm"
                variant={statusFilter === 'pending' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('pending')}
                className="h-8"
              >
                待处理
                {statusCounts.pending > 0 && (
                  <Badge variant="secondary" className="ml-2 px-1.5 py-0 text-xs">
                    {statusCounts.pending}
                  </Badge>
                )}
              </Button>
              <Button
                size="sm"
                variant={statusFilter === 'accepted' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('accepted')}
                className="h-8"
              >
                已接受
                {statusCounts.accepted > 0 && (
                  <Badge variant="secondary" className="ml-2 px-1.5 py-0 text-xs">
                    {statusCounts.accepted}
                  </Badge>
                )}
              </Button>
              <Button
                size="sm"
                variant={statusFilter === 'rejected' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('rejected')}
                className="h-8"
              >
                已拒绝
                {statusCounts.rejected > 0 && (
                  <Badge variant="secondary" className="ml-2 px-1.5 py-0 text-xs">
                    {statusCounts.rejected}
                  </Badge>
                )}
              </Button>
            </div>
          </div>

          <div className="overflow-y-auto max-h-[50vh]">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start space-x-4 p-4 border rounded-lg">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                <h3 className="text-sm font-medium text-gray-900 mb-1">加载失败</h3>
                <p className="text-xs text-gray-600">{(error as Error).message}</p>
              </div>
            ) : filteredInvitations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Mail className="w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-sm font-medium text-gray-900 mb-1">
                  {invitations.length === 0 ? '暂无邀请' : '暂无符合条件的邀请'}
                </h3>
                <p className="text-xs text-gray-600">
                  {invitations.length === 0 ? '你还没有发出任何邀请' : '尝试切换其他筛选条件'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredInvitations.map((invitation: Invitation) => (
                  <div
                    key={invitation.id}
                    className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {/* 用户头像 */}
                    <Avatar className="w-12 h-12 flex-shrink-0">
                      <AvatarImage src={invitation.invitee?.avatar_url} />
                      <AvatarFallback>
                        {invitation.invitee?.name?.[0]?.toUpperCase() ||
                          invitation.email?.[0]?.toUpperCase() ||
                          'U'}
                      </AvatarFallback>
                    </Avatar>

                    {/* 内容 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-semibold text-gray-900 truncate">
                              {invitation.invitee?.name || invitation.email || '未知用户'}
                            </h4>
                            {invitation.invitee?.name && invitation.email && (
                              <span className="text-xs text-gray-500 truncate">
                                ({invitation.email})
                              </span>
                            )}
                          </div>
                          {/* 用户ID */}
                          {invitation.invitee?.id && (
                            <p className="text-xs text-gray-500">ID: {invitation.invitee.id}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {getStatusBadge(invitation.status)}
                          <Badge variant="outline" className="text-xs">
                            {getRoleLabel(invitation.role)}
                          </Badge>
                        </div>
                      </div>

                      {/* 邀请人信息 */}
                      {invitation.inviter && (
                        <div className="flex items-center gap-2 mb-2 text-xs text-gray-600">
                          <span>邀请人:</span>
                          <div className="flex items-center gap-1.5">
                            <Avatar className="w-5 h-5">
                              <AvatarImage src={invitation.inviter.avatar_url} />
                              <AvatarFallback className="text-[10px]">
                                {invitation.inviter.name?.[0]?.toUpperCase() || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{invitation.inviter.name}</span>
                          </div>
                        </div>
                      )}

                      {invitation.message && (
                        <p className="text-sm text-gray-700 bg-gray-50 rounded-md p-2 mb-2">
                          "{invitation.message}"
                        </p>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>
                              {formatDistanceToNow(new Date(invitation.created_at), {
                                addSuffix: true,
                                locale: zhCN,
                              })}
                            </span>
                          </div>
                          {invitation.status.toUpperCase() === 'ACCEPTED' &&
                            invitation.accepted_at && (
                              <div className="flex items-center gap-1 text-green-600">
                                <CheckCircle className="w-3 h-3" />
                                <span>
                                  {formatDistanceToNow(new Date(invitation.accepted_at), {
                                    addSuffix: true,
                                    locale: zhCN,
                                  })}
                                  接受
                                </span>
                              </div>
                            )}
                        </div>

                        {/* 取消按钮 - 只显示在待处理的邀请上 */}
                        {invitation.status.toUpperCase() === 'PENDING' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleCancelInvitation(invitation.id)}
                            disabled={cancelMutation.isPending}
                          >
                            <XCircle className="w-3 h-3 mr-1" />
                            取消邀请
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* 取消确认对话框 */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认取消邀请？</AlertDialogTitle>
            <AlertDialogDescription>
              取消后，被邀请人将无法通过此邀请加入组织。此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCancel}
              className="bg-red-600 hover:bg-red-700"
              disabled={cancelMutation.isPending}
            >
              {cancelMutation.isPending ? '取消中...' : '确认取消'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
