'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FileText, Github, Menu, Newspaper, X } from 'lucide-react';

/**
 * 移动端菜单组件 - 客户端组件
 * 处理移动端菜单的开关状态
 * 不需要判断登录状态，middleware 会自动处理拦截
 */
export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* 移动端菜单按钮 */}
      <button
        className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-300"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="切换菜单"
        aria-expanded={isOpen}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* 移动端全屏菜单 */}
      {isOpen && (
        <>
          {/* 背景遮罩 */}
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden animate-fade-in"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* 菜单内容 */}
          <div className="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white border-l border-gray-200 shadow-2xl z-50 md:hidden animate-slide-in-right">
            {/* 菜单头部 */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <FileText className="h-4 w-4 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">DocFlow</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-300"
                aria-label="关闭菜单"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* 菜单内容 */}
            <div className="p-6 space-y-6">
              <nav className="space-y-4">
                <Link
                  href="/blog"
                  aria-label="查看 DocFlow 博客"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-3 text-gray-700 hover:text-gray-900 transition-colors duration-300 px-4 py-4 rounded-xl hover:bg-gray-100 border border-transparent hover:border-gray-200"
                >
                  <Newspaper className="h-5 w-5" />
                  <span className="font-medium">博客</span>
                </Link>
                <Link
                  href="https://github.com/xun082/DocFlow"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="查看 DocFlow 在 GitHub 上的源代码"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-3 text-gray-700 hover:text-gray-900 transition-colors duration-300 px-4 py-4 rounded-xl hover:bg-gray-100 border border-transparent hover:border-gray-200"
                >
                  <Github className="h-5 w-5" />
                  <span className="font-medium">GitHub 源码</span>
                </Link>
              </nav>

              <div className="pt-4 border-t border-gray-200">
                <Link
                  href="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="w-full inline-flex items-center justify-center bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-lg shadow-violet-500/25 transition-all duration-300 py-4 text-base font-medium rounded-lg"
                >
                  快速开始
                </Link>
              </div>

              {/* 额外信息 */}
              <div className="pt-6 border-t border-gray-200">
                <div className="text-center space-y-2">
                  <p className="text-sm text-gray-600">基于 Tiptap + Yjs 构建</p>
                  <p className="text-xs text-gray-500">AI 智能写作平台</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
