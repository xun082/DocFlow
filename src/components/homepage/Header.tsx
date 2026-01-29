import React from 'react';
import Link from 'next/link';
import { FileText, Github, Newspaper } from 'lucide-react';

import { MobileMenu } from './MobileMenu';

/**
 * Header 组件 - 纯服务端组件
 * 不需要判断登录状态，middleware 会自动处理拦截
 */
function Header() {
  return (
    <header className="relative z-50 px-4 sm:px-6 py-4 sm:py-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo 部分 */}
        <Link href="/" className="flex items-center space-x-2 sm:space-x-3 animate-fade-in">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/25">
            <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          </div>
          <span className="text-xl sm:text-2xl font-bold text-gray-900">DocFlow</span>
          <span className="hidden xs:inline-block text-xs bg-gradient-to-r from-violet-500 to-purple-500 text-white px-2 sm:px-3 py-1 rounded-full font-medium">
            开源
          </span>
        </Link>

        {/* 桌面端导航 */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/blog" aria-label="查看 DocFlow 博客">
            <div className="flex items-center space-x-2 text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all duration-300 px-4 py-2.5 rounded-xl border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md hover:scale-105">
              <Newspaper className="h-4 w-4" />
              <span className="text-sm font-semibold">博客</span>
            </div>
          </Link>
          <Link
            href="https://github.com/xun082/DocFlow"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="查看 DocFlow 在 GitHub 上的源代码"
          >
            <div className="flex items-center space-x-2 text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all duration-300 px-4 py-2.5 rounded-xl border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md hover:scale-105">
              <Github className="h-4 w-4" />
              <span className="text-sm font-semibold">GitHub</span>
            </div>
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-lg shadow-violet-500/25 hover:scale-105 transition-all duration-300 px-6 py-2.5 rounded-lg text-sm font-medium"
          >
            快速开始
          </Link>
        </nav>

        {/* 移动端菜单 - 客户端组件 */}
        <MobileMenu />
      </div>
    </header>
  );
}

export default Header;
