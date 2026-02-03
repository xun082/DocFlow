'use client';

import { useRouter, useSelectedLayoutSegment } from 'next/navigation';

import OrganizationList from './_components/OrganizationList';
import OrganizationMenu from './_components/OrganizationMenu';

export default function OrganizationsLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const segment = useSelectedLayoutSegment();

  const handleSelectOrg = (orgId: string | number) => {
    router.push(`/dashboard/organizations/${orgId}`);
  };

  // 如果当前段是数字，则认为是组织ID
  const selectedOrgId = segment && !isNaN(Number(segment)) ? segment : undefined;

  return (
    <div className="flex h-full bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
      {/* 左侧组织列表 */}
      <div className="w-80 bg-white/80 backdrop-blur-xl border-r border-gray-200/50 flex flex-col shadow-sm">
        {/* Header */}
        <div className="p-5 border-b border-gray-200/50 bg-gradient-to-r from-white to-gray-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-gray-900">我的组织</h2>
            </div>
            <OrganizationMenu />
          </div>
        </div>

        {/* List */}
        <OrganizationList selectedOrgId={selectedOrgId} onSelectOrg={handleSelectOrg} />
      </div>

      {/* 右侧内容区域（由子路由渲染） */}
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}
