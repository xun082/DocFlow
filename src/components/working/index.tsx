'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, Hammer, Clock, ArrowLeft, Github } from 'lucide-react';

/**
 * 用法（Next.js App Router）：
 * 1) 在 app/coming-soon/page.tsx 中粘贴此组件并默认导出即可；
 * 2) 或作为组件引入任意占位页面使用。
 */
const ComingSoonPage: React.FC = () => {
  return (
    <section className="relative w-full h-full min-h-[calc(100vh-200px)] flex items-center justify-center px-6 py-16 sm:py-24 overflow-hidden bg-gradient-to-b from-white via-white to-slate-50">
      {/* 背景装饰：不会阻挡点击 */}
      <div className="pointer-events-none absolute inset-0">
        {/* 柔和渐变光斑 */}
        <div className="absolute -top-24 -left-24 w-[36rem] h-[36rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.15),transparent_60%)]" />
        <div className="absolute -bottom-24 -right-24 w-[30rem] h-[30rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(236,72,153,0.12),transparent_60%)]" />
        {/* 细格纹 */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(2,6,23,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(2,6,23,0.04)_1px,transparent_1px)] bg-[size:36px_36px]" />
      </div>

      <div className="relative z-10 w-full max-w-3xl mx-auto">
        {/* 发光描边容器 */}
        <div className="relative">
          <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-violet-400/30 via-fuchsia-400/20 to-cyan-400/30 blur-lg" />

          <div className="rounded-2xl border border-slate-200 bg-white p-8 md:p-10 shadow-xl">
            {/* 顶部徽标 */}
            <div className="mb-6 flex items-center justify-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 shadow-lg">
                <Hammer className="h-5 w-5 text-white" />
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600">
                <Sparkles className="h-3.5 w-3.5 text-violet-500" /> 功能开发进行中
              </span>
            </div>

            {/* 标题 */}
            <h1 className="text-center text-4xl md:text-5xl font-extrabold leading-tight tracking-tight">
              <span className="bg-gradient-to-r from-slate-900 via-violet-700 to-fuchsia-600 bg-clip-text text-transparent">
                敬请期待
              </span>
            </h1>

            {/* 副标题 */}
            <p className="mt-4 text-center text-base md:text-lg text-slate-600">
              我们正在打磨这一功能，以带来更流畅、更强大的体验。欢迎先体验其他能力或关注更新。
            </p>

            {/* 进度条 */}
            <div className="mt-8">
              <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-slate-500" /> 开发进度
                </span>
                <span>70%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '70%' }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400"
                />
              </div>
            </div>

            {/* CTA 按钮 */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/"
                className="group inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50"
              >
                <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                返回首页
              </Link>

              <Link
                href="https://github.com/xun082/DocFlow"
                target="_blank"
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg hover:from-violet-500 hover:to-purple-500"
              >
                <Github className="mr-2 h-4 w-4" /> 关注进展
              </Link>
            </div>

            {/* 细节说明 */}
            <p className="mt-6 text-center text-xs text-slate-500">
              如果你希望第一时间体验，欢迎加入社区或在 GitHub 上提交建议。
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ComingSoonPage;
