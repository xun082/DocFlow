'use client';

import { usePathname, useRouter } from 'next/navigation';

import OrganizationList from './_components/OrganizationList';
import CreateOrganizationDialog from './_components/CreateOrganizationDialog';

export default function OrganizationsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // 检查是否在详情页（动态路由）
  const isDetailPage = pathname !== '/dashboard/organizations';

  const handleSelectOrg = (orgId: string | number) => {
    router.push(`/dashboard/organizations/${orgId}`);
  };

  return (
    <div className="flex h-full bg-gray-50">
      {/* 左侧组织列表 */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">我的组织</h2>
          <CreateOrganizationDialog />
        </div>

        {/* List */}
        <OrganizationList
          selectedOrgId={isDetailPage ? pathname.split('/').pop() : undefined}
          onSelectOrg={handleSelectOrg}
        />
      </div>

      {/* 右侧内容区域（由子路由渲染） */}
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}
