'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">404</h1>
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">页面未找到</h2>
      <p className="text-gray-600 dark:text-gray-400">抱歉，您访问的页面不存在</p>
      <Link
        href="/"
        prefetch={false}
        className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        返回首页
      </Link>
    </div>
  );
}
