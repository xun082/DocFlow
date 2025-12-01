'use client';

import { useQuery } from '@tanstack/react-query';
import { Building2, Users, FolderKanban } from 'lucide-react';

import organizationService, { type Organization } from '@/services/organization';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface OrganizationListProps {
  selectedOrgId?: string | number;
  onSelectOrg: (orgId: string | number) => void;
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

function OrganizationItem({
  org,
  isSelected,
  onClick,
}: {
  org: Organization;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left p-4 rounded-lg border transition-all duration-200
        ${
          isSelected
            ? 'bg-blue-50 border-blue-200 shadow-sm'
            : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
        }
      `}
    >
      <div className="flex items-start space-x-3">
        {/* Logo/Avatar */}
        <div className="flex-shrink-0">
          {org.logo_url ? (
            <Avatar className="w-12 h-12">
              <img src={org.logo_url} alt={org.name} />
            </Avatar>
          ) : (
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-semibold text-gray-900 truncate">{org.name}</h3>
            <Badge
              variant="outline"
              className={`text-xs px-2 py-0.5 ${getRoleBadgeColor(org.user_role)}`}
            >
              {getRoleLabel(org.user_role)}
            </Badge>
          </div>

          {org.description && (
            <p className="text-xs text-gray-600 line-clamp-2 mb-2">{org.description}</p>
          )}

          {/* Stats */}
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <Users className="w-3.5 h-3.5" />
              {/* 成员数量暂时隐藏 */}
            </div>
            <div className="flex items-center space-x-1">
              <FolderKanban className="w-3.5 h-3.5" />
              {/* 空间数量暂时隐藏 */}
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}

function OrganizationListSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-4 rounded-lg border border-gray-200 bg-white">
          <div className="flex items-start space-x-3">
            <Skeleton className="w-12 h-12 rounded-lg" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-5 w-16" />
              </div>
              <Skeleton className="h-3 w-full" />
              <div className="flex items-center space-x-4">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function OrganizationList({ selectedOrgId, onSelectOrg }: OrganizationListProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['organizations'],
    queryFn: () => organizationService.getMyOrganizations({ page: 1, limit: 100 }),
  });

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto p-4">
        <OrganizationListSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 overflow-y-auto p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-sm text-red-600">加载组织列表失败</p>
          <p className="text-xs text-red-500 mt-1">{(error as Error).message}</p>
        </div>
      </div>
    );
  }

  const organizations = data?.list || [];

  if (organizations.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto p-4">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-sm text-gray-600 mb-1">暂无组织</p>
          <p className="text-xs text-gray-500">创建或加入一个组织开始协作</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="space-y-3">
        {organizations.map((org: Organization) => (
          <OrganizationItem
            key={org.id}
            org={org}
            isSelected={selectedOrgId === org.id}
            onClick={() => onSelectOrg(org.id)}
          />
        ))}
      </div>
    </div>
  );
}
