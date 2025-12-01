import { Building2 } from 'lucide-react';

export default function OrganizationsPage() {
  return (
    <div className="h-full flex items-center justify-center bg-gray-50">
      <div className="text-center text-gray-500 p-8">
        <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">组织管理</h3>
        <p className="text-sm text-gray-600 max-w-md">
          在左侧选择一个组织查看详情，或创建一个新组织开始协作
        </p>
      </div>
    </div>
  );
}
