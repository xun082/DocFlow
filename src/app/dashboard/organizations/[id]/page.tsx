'use client';

import { use, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Building2, Globe, Calendar, LogOut, Trash2, UserPlus, Users } from 'lucide-react';

import EditOrganizationDialog from '../_components/EditOrganizationDialog';
import InviteMemberDialog from '../_components/InviteMemberDialog';

import organizationService from '@/services/organization';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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

interface OrganizationDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

function getRoleBadgeColor(role: string) {
  switch (role) {
    case 'OWNER':
      return 'bg-purple-100 text-purple-700 border-purple-200';
    case 'ADMIN':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'MEMBER':
      return 'bg-gray-100 text-gray-700 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
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

export default function OrganizationDetailPage({ params }: OrganizationDetailPageProps) {
  const { id } = use(params);
  const orgId = parseInt(id, 10);
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // 获取组织详情
  const { data: organization, isLoading: orgLoading } = useQuery({
    queryKey: ['organization', orgId],
    queryFn: () => organizationService.getOrganizationById(orgId),
  });

  const { data: membersData, isLoading: membersLoading } = useQuery({
    queryKey: ['organization', orgId, 'members'],
    queryFn: () => organizationService.getOrganizationMembers(orgId),
  });

  // 退出组织
  const leaveMutation = useMutation({
    mutationFn: () => organizationService.leaveOrganization(orgId),
    onSuccess: () => {
      toast({
        title: '退出成功',
        description: '你已成功退出该组织',
      });
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      router.push('/dashboard/organizations');
    },
    onError: (error: Error) => {
      toast({
        title: '退出失败',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // 删除组织
  const deleteMutation = useMutation({
    mutationFn: () => organizationService.deleteOrganization(orgId),
    onSuccess: () => {
      toast({
        title: '删除成功',
        description: '组织已被删除',
      });
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      router.push('/dashboard/organizations');
    },
    onError: (error: Error) => {
      toast({
        title: '删除失败',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  if (orgLoading) {
    return (
      <div className="h-full overflow-y-auto bg-white">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-9 w-32" />
          </div>
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="h-full overflow-y-auto bg-white flex items-center justify-center">
        <div className="text-center p-8">
          <Building2 className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-sm text-red-600">组织不存在或加载失败</p>
        </div>
      </div>
    );
  }

  const isOwner = organization.user_role === 'OWNER';
  const isAdmin = organization.user_role === 'ADMIN';
  const isMember = organization.user_role === 'MEMBER';
  const canInvite = isOwner || isAdmin;

  const members = membersData?.members || [];

  type Member = (typeof members)[0];

  return (
    <>
      <div className="h-full overflow-y-auto bg-white">
        {/* 组织信息卡片 */}
        <div className="bg-white border-b border-gray-200">
          {/* 头部：Logo + 标题 + 操作按钮 */}
          <div className="p-6">
            <div className="flex items-start justify-between gap-4">
              {/* 左侧：Logo + 标题信息 */}
              <div className="flex items-start gap-4 flex-1 min-w-0">
                {organization.logo_url ? (
                  <Avatar className="w-16 h-16 flex-shrink-0">
                    <img src={organization.logo_url} alt={organization.name} />
                  </Avatar>
                ) : (
                  <div className="w-16 h-16 flex-shrink-0 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <Building2 className="w-8 h-8 text-white" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center flex-wrap gap-2 mb-2">
                    <h1 className="text-2xl font-bold text-gray-900">{organization.name}</h1>
                    <Badge
                      variant="outline"
                      className={`text-xs ${getRoleBadgeColor(organization.user_role)}`}
                    >
                      {getRoleLabel(organization.user_role)}
                    </Badge>
                    {organization.is_verified && (
                      <Badge
                        variant="outline"
                        className="text-xs bg-green-100 text-green-700 border-green-200"
                      >
                        已验证
                      </Badge>
                    )}
                  </div>

                  {organization.description && (
                    <p className="text-sm text-gray-600 mb-3">{organization.description}</p>
                  )}

                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    {organization.website && (
                      <a
                        href={organization.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-blue-600 hover:underline"
                      >
                        <Globe className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{organization.website}</span>
                      </a>
                    )}
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 flex-shrink-0" />
                      <span>
                        创建于 {new Date(organization.created_at).toLocaleDateString('zh-CN')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 右侧：操作按钮 */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* 所有者：显示编辑和删除 */}
                {isOwner && (
                  <>
                    <EditOrganizationDialog organization={organization} />
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-200"
                      onClick={() => setShowDeleteDialog(true)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      删除
                    </Button>
                  </>
                )}

                {/* 管理员：显示编辑和退出 */}
                {isAdmin && (
                  <>
                    <EditOrganizationDialog organization={organization} />
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 hover:border-orange-200"
                      onClick={() => setShowLeaveDialog(true)}
                    >
                      <LogOut className="w-4 h-4 mr-1" />
                      退出
                    </Button>
                  </>
                )}

                {/* 普通成员：只显示退出 */}
                {isMember && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 hover:border-orange-200"
                    onClick={() => setShowLeaveDialog(true)}
                  >
                    <LogOut className="w-4 h-4 mr-1" />
                    退出组织
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 成员列表卡片 */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">成员列表</h2>
                <Badge variant="outline" className="text-xs">
                  {members.length} 人
                </Badge>
              </div>
              {canInvite && <InviteMemberDialog organizationId={orgId} />}
            </div>

            {membersLoading ? (
              <div className="grid grid-cols-6 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <Skeleton className="w-16 h-16 rounded-lg" />
                    <Skeleton className="w-16 h-4" />
                    <Skeleton className="w-12 h-3" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                {members.map((member: Member) => (
                  <button
                    key={member.id}
                    type="button"
                    className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <div className="relative">
                      <Avatar className="w-14 h-14">
                        <AvatarImage src={member.user.avatar_url} alt={member.user.name} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                          {member.user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {/* 角色标识 */}
                      {member.role === 'OWNER' && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center border-2 border-white">
                          <span className="text-[10px] text-white font-bold">👑</span>
                        </div>
                      )}
                      {member.role === 'ADMIN' && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white">
                          <span className="text-[10px] text-white font-bold">A</span>
                        </div>
                      )}
                    </div>
                    <div className="text-center w-full">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {member.user.name}
                      </p>
                      {member.title && (
                        <p className="text-xs text-gray-500 truncate">{member.title}</p>
                      )}
                    </div>
                  </button>
                ))}

                {/* 邀请按钮 - 类似微信群的加号 */}
                {canInvite && (
                  <InviteMemberDialog organizationId={orgId}>
                    <button
                      type="button"
                      className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                    >
                      <div className="w-14 h-14 rounded-lg border-2 border-dashed border-gray-300 group-hover:border-blue-500 flex items-center justify-center bg-gray-50 group-hover:bg-blue-50 transition-colors">
                        <UserPlus className="w-6 h-6 text-gray-400 group-hover:text-blue-500 transition-colors" />
                      </div>
                      <p className="text-sm text-gray-600 group-hover:text-blue-600 transition-colors">
                        邀请成员
                      </p>
                    </button>
                  </InviteMemberDialog>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 退出确认对话框 */}
      <AlertDialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认退出组织？</AlertDialogTitle>
            <AlertDialogDescription>
              退出后，你将无法访问该组织的资源。如需重新加入，需要组织管理员的批准。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => leaveMutation.mutate()}
              className="bg-orange-600 hover:bg-orange-700"
            >
              确认退出
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 删除确认对话框 */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除组织？</AlertDialogTitle>
            <AlertDialogDescription>
              此操作无法撤销！删除后，组织的所有数据（包括成员、空间、文档）都将被永久删除。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate()}
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
