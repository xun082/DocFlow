import Link from 'next/link';
import { Sparkles, ChevronRight } from 'lucide-react';

import { SITE_CONFIG } from './constants';

export function Hero() {
  return (
    <section className="relative px-6 flex items-center justify-center min-h-[calc(100vh-120px)]">
      <div className="max-w-7xl mx-auto text-center relative z-10 w-full mb-12 fade-in">
        <div className="inline-flex items-center gap-2 bg-violet-50 text-violet-700 px-4 py-2 rounded-full border border-violet-200 mb-6">
          <Sparkles className="h-4 w-4 text-violet-500" />
          <span className="text-sm font-medium">基于 Tiptap + Yjs 构建的 AI 写作平台</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight fade-in fade-in-1">
          <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent">
            {SITE_CONFIG.name}
          </span>
          <br />
          <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            {SITE_CONFIG.tagline}
          </span>
        </h1>

        <p className="text-lg text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed fade-in fade-in-2">
          基于 Tiptap + Yjs 构建的新一代智能协作编辑器,集成 AI 续写、RAG 知识库检索、AI
          播客生成等核心功能。支持多人实时协作编辑,让团队像使用 Google Docs
          一样流畅协作,同时拥有强大的 AI 能力加持。
        </p>

        <Link
          href={SITE_CONFIG.dashboardUrl}
          className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 hover:from-violet-500 hover:via-purple-500 hover:to-pink-500 text-white text-lg font-semibold rounded-2xl shadow-2xl hover:shadow-violet-500/40 transition-all overflow-hidden hover:scale-105 active:scale-95 fade-in fade-in-3 before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity"
        >
          <Sparkles className="h-5 w-5 relative z-10" />
          <span className="relative z-10">开始创作</span>
          <ChevronRight className="h-5 w-5 relative z-10 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </section>
  );
}
