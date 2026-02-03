import Link from 'next/link';
import { FileText, Github, Newspaper, ChevronRight, Menu, X, Sparkles } from 'lucide-react';

import { SITE_CONFIG } from './constants';

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group" aria-label="DocFlow 首页">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-violet-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/30 group-hover:shadow-violet-500/50 transition-shadow">
              <FileText className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-900 via-violet-900 to-purple-900 bg-clip-text text-transparent">
                {SITE_CONFIG.name}
              </span>
              <span className="hidden xs:inline-flex text-[10px] sm:text-xs bg-gradient-to-r from-violet-500 to-purple-600 text-white px-2.5 py-0.5 rounded-full font-bold shadow-sm">
                开源
              </span>
            </div>
          </Link>

          {/* 桌面端导航 */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href={SITE_CONFIG.blogUrl}
              className="group flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-violet-600 bg-gray-50 hover:bg-violet-50 rounded-xl border border-gray-200 hover:border-violet-200 transition-all"
            >
              <Newspaper className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-semibold">博客</span>
            </Link>
            <Link
              href={SITE_CONFIG.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 hover:border-gray-300 transition-all"
            >
              <Github className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-semibold">GitHub</span>
            </Link>
            <Link
              href={SITE_CONFIG.dashboardUrl}
              className="group flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 hover:scale-105 active:scale-100 transition-all"
            >
              <span>快速开始</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* 移动端菜单 */}
          <div className="md:hidden">
            <input type="checkbox" id="mobile-menu" className="peer sr-only" />
            <label
              htmlFor="mobile-menu"
              className="group flex items-center justify-center w-11 h-11 text-gray-700 hover:text-violet-600 hover:bg-violet-50 rounded-xl cursor-pointer transition-all peer-checked:hidden shadow-sm hover:shadow-md border border-transparent hover:border-violet-200"
              aria-label="打开菜单"
            >
              <Menu className="w-6 h-6 group-hover:scale-110 transition-transform" />
            </label>
            <label
              htmlFor="mobile-menu"
              className="hidden peer-checked:block fixed inset-0 bg-black/50 backdrop-blur-md z-40 fade-in cursor-pointer"
              aria-hidden="true"
            />
            <div className="hidden peer-checked:flex fixed top-0 right-0 bottom-0 w-[min(340px,85vw)] bg-white shadow-2xl border-l-2 border-violet-100 z-50 flex-col slide-in">
              {/* 移动菜单头部 */}
              <div className="relative p-6 border-b border-gray-100 bg-gradient-to-br from-violet-50/50 to-purple-50/50">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-purple-500/5 pointer-events-none opacity-50" />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-violet-600 to-purple-600 rounded-2xl blur-xl opacity-40 animate-pulse" />
                      <div className="relative w-11 h-11 bg-gradient-to-br from-violet-600 via-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-violet-500/50 transform hover:scale-110 transition-transform">
                        <FileText className="w-5.5 h-5.5 text-white" />
                      </div>
                    </div>
                    <div>
                      <span className="text-xl font-black bg-gradient-to-r from-violet-900 via-purple-900 to-violet-900 bg-clip-text text-transparent">
                        {SITE_CONFIG.name}
                      </span>
                      <p className="text-[10px] text-gray-500 font-medium mt-0.5">智能写作平台</p>
                    </div>
                  </div>
                  <label
                    htmlFor="mobile-menu"
                    className="group flex items-center justify-center w-10 h-10 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl cursor-pointer transition-all border border-transparent hover:border-red-200 shadow-sm hover:shadow-md"
                    aria-label="关闭菜单"
                  >
                    <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                  </label>
                </div>
              </div>

              {/* 导航链接 */}
              <nav className="flex-1 overflow-y-auto p-5 space-y-3">
                <Link
                  href={SITE_CONFIG.blogUrl}
                  className="group relative block p-4 bg-white hover:bg-gradient-to-br hover:from-violet-50 hover:to-purple-50 rounded-2xl border-2 border-violet-100 hover:border-violet-300 shadow-md hover:shadow-xl hover:shadow-violet-500/20 transition-all hover:scale-105 active:scale-100"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl blur-lg opacity-0 group-hover:opacity-30 transition-opacity" />
                      <div className="relative w-12 h-12 bg-gradient-to-br from-violet-100 via-violet-200 to-purple-200 group-hover:from-violet-500 group-hover:to-purple-500 rounded-xl flex items-center justify-center shadow-lg transition-all">
                        <Newspaper className="w-6 h-6 text-violet-600 group-hover:text-white group-hover:scale-110 transition-all" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-base text-gray-900 group-hover:text-violet-900 transition-colors mb-0.5">
                        博客
                      </p>
                      <p className="text-xs text-gray-500 group-hover:text-violet-600 transition-colors">
                        阅读最新技术文章
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-violet-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>

                <Link
                  href={SITE_CONFIG.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative block p-4 bg-white hover:bg-gradient-to-br hover:from-gray-50 hover:to-gray-100 rounded-2xl border-2 border-gray-200 hover:border-gray-400 shadow-md hover:shadow-xl hover:shadow-gray-500/20 transition-all hover:scale-105 active:scale-100"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gray-900 rounded-xl blur-lg opacity-0 group-hover:opacity-30 transition-opacity" />
                      <div className="relative w-12 h-12 bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 group-hover:from-gray-800 group-hover:to-gray-900 rounded-xl flex items-center justify-center shadow-lg transition-all">
                        <Github className="w-6 h-6 text-gray-700 group-hover:text-white group-hover:scale-110 transition-all" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-base text-gray-900 transition-colors mb-0.5">
                        GitHub
                      </p>
                      <p className="text-xs text-gray-500 group-hover:text-gray-700 transition-colors">
                        开源代码仓库 ⭐
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-700 group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>

                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-violet-300 to-transparent" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-4 text-xs font-semibold text-violet-600 bg-white rounded-full shadow-sm">
                      开始使用
                    </span>
                  </div>
                </div>

                <Link
                  href={SITE_CONFIG.dashboardUrl}
                  className="group relative block p-5 bg-gradient-to-r from-violet-600 via-purple-600 to-violet-600 hover:from-violet-700 hover:via-purple-700 hover:to-violet-700 rounded-2xl shadow-2xl shadow-violet-500/40 hover:shadow-violet-500/60 hover:scale-105 active:scale-100 transition-all overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  <div className="relative flex items-center justify-center gap-3">
                    <Sparkles className="w-5 h-5 text-white group-hover:rotate-12 group-hover:scale-110 transition-all" />
                    <span className="text-base font-black text-white">快速开始</span>
                    <ChevronRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </nav>

              <div className="relative p-6 text-center border-t border-gray-100 bg-gradient-to-t from-violet-50/50 to-transparent">
                <div className="absolute inset-0 bg-gradient-to-t from-violet-500/5 to-transparent pointer-events-none opacity-50" />
                <div className="relative">
                  <p className="text-xs font-bold text-gray-700 mb-1">
                    {SITE_CONFIG.name} © {SITE_CONFIG.year}
                  </p>
                  <p className="text-[10px] text-gray-500 font-medium">
                    ✨ 共同构建下一代智能写作平台
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
