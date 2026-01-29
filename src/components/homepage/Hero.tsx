import React, { Suspense } from 'react';
import { Sparkles, Users, ChevronRight } from 'lucide-react';
import Link from 'next/link';

import GroupQRDialog from './GroupQRDialog';
import { ScrollButton } from './ScrollButton';

/**
 * Hero 组件 - 服务端组件
 * 主要内容 SSR，交互部分使用客户端组件
 */
const Hero: React.FC = () => {
  return (
    <section className="relative px-6 flex items-center justify-center min-h-[calc(100vh-120px)]">
      <div className="max-w-7xl mx-auto text-center relative z-10 w-full">
        {/* 主标题部分 */}
        <div className="mb-12 animate-fade-in">
          <div className="inline-flex items-center space-x-2 bg-violet-50 text-violet-700 px-4 py-2 rounded-full border border-violet-200 mb-6">
            <Sparkles className="h-4 w-4 text-violet-500" />
            <span className="text-sm font-medium">基于 Tiptap + Yjs 构建的 AI 写作平台</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight animate-fade-in-delay-100">
            <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent">
              DocFlow
            </span>
            <br />
            <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              AI 智能写作平台
            </span>
          </h1>

          <p className="text-lg text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed animate-fade-in-delay-200">
            基于 Tiptap + Yjs 构建的新一代智能协作编辑器，集成 AI 续写、RAG 知识库检索、AI
            播客生成等核心功能。支持多人实时协作编辑，让团队像使用 Google Docs
            一样流畅协作，同时拥有强大的 AI 能力加持。
            <br />
            <span className="text-gray-500 mt-2 block">
              无论是文档写作、知识管理还是内容创作，DocFlow
              都能让你的工作效率成倍提升，让创意与技术完美融合
            </span>
          </p>

          {/* 行动按钮 */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 animate-fade-in-delay-300">
            {/* 开始创作按钮 - 纯 Link，无需客户端 */}
            <Link
              href="/dashboard"
              className="group relative px-8 py-4 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 hover:from-violet-500 hover:via-purple-500 hover:to-pink-500 text-white font-semibold rounded-2xl shadow-2xl hover:shadow-violet-500/40 transition-all duration-300 overflow-hidden hover:scale-105 active:scale-95 inline-flex items-center justify-center"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative flex items-center justify-center space-x-2 text-lg">
                <Sparkles className="h-5 w-5" />
                <span>开始创作</span>
                <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>

            {/* 项目介绍按钮 - 客户端组件（需要 onClick） */}
            <Suspense
              fallback={
                <div className="px-8 py-4 bg-gray-100 text-gray-900 font-semibold rounded-2xl border-2 border-gray-200 shadow-lg h-[60px] flex items-center justify-center">
                  <span className="text-lg">项目介绍</span>
                </div>
              }
            >
              <ScrollButton />
            </Suspense>

            {/* 加群学习按钮 - 客户端组件（需要 Dialog） */}
            <Suspense
              fallback={
                <div className="px-8 py-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white font-semibold rounded-2xl shadow-2xl h-[60px] flex items-center justify-center">
                  <span className="text-lg">加群学习</span>
                </div>
              }
            >
              <GroupQRDialog>
                <button className="group relative px-8 py-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:via-teal-500 hover:to-cyan-500 text-white font-semibold rounded-2xl shadow-2xl hover:shadow-emerald-500/40 transition-all duration-300 cursor-pointer overflow-hidden hover:scale-105 active:scale-95">
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative flex items-center justify-center space-x-2 text-lg">
                    <Users className="h-5 w-5" />
                    <span>加群学习</span>
                  </span>
                </button>
              </GroupQRDialog>
            </Suspense>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
