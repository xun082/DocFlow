'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MoreVertical, Plus, Bell } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

import CreateOrganizationDialog from './CreateOrganizationDialog';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import organizationService from '@/services/organization';

export default function OrganizationMenu() {
  const router = useRouter();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // 查询待处理项数量
  const { data: pendingItems } = useQuery({
    queryKey: ['organization-pending-items'],
    queryFn: () => organizationService.getMyPendingItems(),
    refetchInterval: 30000, // 每30秒刷新一次
  });

  const totalPending = (pendingItems?.invitations_total || 0) + (pendingItems?.requests_total || 0);

  const handleViewPendingItems = () => {
    router.push('/dashboard/organizations/invitations');
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="ghost" className="relative">
            <MoreVertical className="w-4 h-4" />
            {totalPending > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                {totalPending > 99 ? '99+' : totalPending}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            <span>创建组织</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={handleViewPendingItems}>
            <Bell className="mr-2 h-4 w-4" />
            <span>我的邀请和申请</span>
            {totalPending > 0 && (
              <Badge variant="destructive" className="ml-auto">
                {totalPending}
              </Badge>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* 创建组织对话框 */}
      {isCreateDialogOpen && (
        <CreateOrganizationDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} />
      )}
    </>
  );
}
