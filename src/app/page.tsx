'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const Page = () => {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-6">Tiptap 协作编辑器</h1>

      <div className="flex space-x-4">
        <Link
          href="/docs/1"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          进入文档1
        </Link>

        <button
          onClick={() => router.push('/docs/1')}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
        >
          打开文档1
        </button>
      </div>
    </div>
  );
};

export default Page;
