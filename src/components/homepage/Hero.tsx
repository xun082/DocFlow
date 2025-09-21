'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Users, BookOpen, ArrowRight } from 'lucide-react';
import Link from 'next/link';

import GroupQRDialog from './GroupQRDialog';

interface HeroProps {
  isMounted: boolean;
}

const Hero: React.FC<HeroProps> = () => {
  return (
    <section className="relative px-6 flex items-center justify-center min-h-[calc(100vh-120px)]">
      <div className="max-w-7xl mx-auto text-center relative z-10 w-full">
        {/* 主标题部分 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="mb-12"
        >
          <div className="inline-flex items-center space-x-2 bg-white/5 backdrop-blur-xl text-white px-4 py-2 rounded-full border border-white/10 mb-6">
            <Sparkles className="h-4 w-4 text-violet-400" />
            <span className="text-sm font-medium">基于 Tiptap + Yjs 构建的 AI 写作平台</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-white via-violet-200 to-purple-200 bg-clip-text text-transparent">
              DocFlow
            </span>
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              AI 智能写作平台
            </span>
          </h1>

          <p className="text-lg text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
            基于 Tiptap + Yjs 构建的新一代智能协作编辑器，集成 AI 续写、RAG 知识库检索、AI
            播客生成等核心功能。支持多人实时协作编辑，让团队像使用 Google Docs
            一样流畅协作，同时拥有强大的 AI 能力加持。
            <br />
            <span className="text-gray-400 mt-2 block">
              无论是文档写作、知识管理还是内容创作，DocFlow
              都能让你的工作效率成倍提升，让创意与技术完美融合
            </span>
          </p>

          {/* 行动按钮 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
          >
            {/* 开始创作按钮 - 跳转到 dashboard */}
            <Link href="/dashboard">
              <motion.button
                className="group relative px-8 py-4 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 hover:from-violet-500 hover:via-purple-500 hover:to-pink-500 text-white font-semibold rounded-2xl shadow-2xl hover:shadow-violet-500/40 transition-all duration-300 cursor-pointer overflow-hidden"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative flex items-center justify-center space-x-2 text-lg">
                  <Sparkles className="h-5 w-5" />
                  <span>开始创作</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </motion.button>
            </Link>

            {/* 项目介绍按钮 */}
            <motion.button
              className="group px-8 py-4 bg-white/10 backdrop-blur-xl text-white font-semibold rounded-2xl border-2 border-white/30 hover:border-white/50 transition-all duration-300 hover:bg-white/20 hover:scale-105 cursor-pointer shadow-xl hover:shadow-white/10"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                const featuresSection = document.getElementById('features');
                featuresSection?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <span className="relative flex items-center justify-center space-x-2 text-lg">
                <BookOpen className="h-5 w-5" />
                <span>项目介绍</span>
              </span>
            </motion.button>

            {/* 加群学习按钮 */}
            <GroupQRDialog>
              <motion.button
                className="group relative px-8 py-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:via-teal-500 hover:to-cyan-500 text-white font-semibold rounded-2xl shadow-2xl hover:shadow-emerald-500/40 transition-all duration-300 cursor-pointer overflow-hidden"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative flex items-center justify-center space-x-2 text-lg">
                  <Users className="h-5 w-5" />
                  <span>加群学习</span>
                </span>
              </motion.button>
            </GroupQRDialog>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
