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
    <div className="flex min-h-[50vh] flex-col items-center justify-center p-6 text-center">
      <div className="mb-6 rounded-full bg-gray-100 p-4">
        {isDocumentNotFound ? (
          <FileIcon className="h-12 w-12 text-gray-500" />
        ) : (
          <LockIcon className="h-12 w-12 text-gray-500" />
        )}
      </div>

      <h2 className="mb-3 text-2xl font-semibold">
        {isDocumentNotFound ? '文档不存在' : '无权访问此文档'}
      </h2>

      <p className="mb-6 max-w-md text-gray-600">
        {isDocumentNotFound
          ? '您尝试访问的文档不存在或已被删除。'
          : '您没有编辑此文档的权限，请联系文档所有者获取访问权限。'}
      </p>

      <Link
        href="/documents"
        className="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
      >
        返回文档列表
      </Link>
    </div>
  );
};

export default NoPermissionView;
