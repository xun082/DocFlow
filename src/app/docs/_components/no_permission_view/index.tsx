import React from 'react';
import Link from 'next/link';
import { LockIcon, FileIcon } from 'lucide-react';

interface NoPermissionViewProps {
  reason: string;
}

const NoPermissionView: React.FC<NoPermissionViewProps> = ({ reason }) => {
  const isDocumentNotFound =
    reason.toLowerCase().includes('not found') || reason.toLowerCase().includes('不存在');

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 text-center">
      <div className="mb-6 p-4 bg-gray-100 rounded-full">
        {isDocumentNotFound ? (
          <FileIcon className="h-12 w-12 text-gray-500" />
        ) : (
          <LockIcon className="h-12 w-12 text-gray-500" />
        )}
      </div>

      <h2 className="text-2xl font-semibold mb-3">
        {isDocumentNotFound ? '文档不存在' : '无权访问此文档'}
      </h2>

      <p className="text-gray-600 mb-6 max-w-md">
        {isDocumentNotFound
          ? '您尝试访问的文档不存在或已被删除。'
          : '您没有编辑此文档的权限，请联系文档所有者获取访问权限。'}
      </p>

      <Link
        href="/documents"
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        返回文档列表
      </Link>
    </div>
  );
};

export default NoPermissionView;
