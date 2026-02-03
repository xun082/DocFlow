'use client';

import Link from 'next/link';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 px-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-6 inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl shadow-2xl shadow-blue-500/20">
          <FileQuestion className="h-10 w-10 text-white" />
        </div>

        <h1 className="mb-2 text-6xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
          404
        </h1>

        <h2 className="mb-4 text-2xl font-bold text-gray-900">页面未找到</h2>

        <p className="mb-8 text-gray-600 leading-relaxed">抱歉，您访问的页面不存在或已被移除。</p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-medium rounded-lg shadow-lg transition-all"
          >
            <Home className="h-4 w-4" />
            返回首页
          </Link>

          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 font-medium rounded-lg border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            返回上一页
          </button>
        </div>
      </div>
    </div>
  );
}
