'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Github, Copy, Check, Sparkles, Users, Zap } from 'lucide-react';

const Contact: React.FC = () => {
  const [wechatCopied, setWechatCopied] = useState(false);

  const handleWechatCopy = async () => {
    try {
      // 兼容性更好的复制方案（含 fallback）
      const text = 'yunmz777';

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.top = '-1000px';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }

      setWechatCopied(true);
      setTimeout(() => setWechatCopied(false), 2000);
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  const handleJuejinClick = () => {
    window.open('https://juejin.cn/user/3782764966460398', '_blank', 'noopener,noreferrer');
  };

  const handleGithubClick = () => {
    window.open('https://github.com/xun082', '_blank', 'noopener,noreferrer');
  };

  return (
    <section className="relative px-6 py-24 overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-black">
      {/* 背景装饰（禁用指针事件，避免遮挡点击） */}
      <div className="absolute inset-0 pointer-events-none">
        {/* 渐变光斑 */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-r from-violet-500/10 to-pink-500/10 rounded-full blur-3xl" />

        {/* 网格纹理 */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.03)_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* 标题区域 - 更简洁现代 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          {/* 图标装饰 */}
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5, type: 'spring' }}
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl mb-6 shadow-lg"
          >
            <Users className="w-8 h-8 text-white" />
          </motion.div>

          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            加入{' '}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              DocFlow
            </span>{' '}
            社区
          </h2>

          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            与全球开发者一起探索 AI 写作的无限可能
          </p>
        </motion.div>

        {/* 联系方式卡片 - 直接写死三个卡片 */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* 微信卡片 */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', duration: 0.8, bounce: 0.4 }}
            className="group relative"
          >
            <div className="relative p-6 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl hover:border-slate-600/50 transition-all duration-300 hover:bg-slate-800/70 hover:shadow-xl hover:shadow-slate-900/20">
              {/* 悬浮光效（禁用指针事件 + 置底） */}
              <div className="absolute inset-0 pointer-events-none z-0 bg-gradient-to-br from-emerald-500/20 via-green-500/10 to-emerald-500/20 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300" />

              {/* 内容层（置顶） */}
              <div className="relative z-10">
                {/* 图标 */}
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <MessageCircle className="w-6 h-6 text-slate-300 group-hover:text-white transition-colors duration-300" />
                </div>

                {/* 文案 */}
                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-slate-100 transition-colors duration-300">
                  微信交流
                </h3>
                <p className="text-sm text-slate-400 mb-4 leading-relaxed group-hover:text-slate-300 transition-colors duration-300">
                  添加微信，获取更多支持和交流
                </p>

                {/* 微信按钮 */}
                <button
                  onClick={handleWechatCopy}
                  className="w-full px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 text-white text-sm font-medium rounded-lg hover:from-green-500 hover:to-green-400 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-green-500/25 transform hover:-translate-y-0.5 hover:scale-105 active:scale-95"
                  type="button"
                  aria-label="复制微信号"
                >
                  <span aria-live="polite">{wechatCopied ? '已复制' : 'yunmz777'}</span>
                  <motion.div
                    animate={wechatCopied ? { rotate: 360, scale: 1.1 } : { scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {wechatCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </motion.div>
                </button>

                {/* 装饰元素（禁用指针事件） */}
                <div className="absolute top-4 right-4 w-2 h-2 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                <div className="absolute bottom-4 left-4 w-1.5 h-1.5 bg-white/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              </div>
            </div>
          </motion.div>

          {/* 掘金卡片 */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', duration: 0.8, bounce: 0.4, delay: 0.2 }}
            className="group relative"
          >
            <div className="relative p-6 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl hover:border-slate-600/50 transition-all duration-300 hover:bg-slate-800/70 hover:shadow-xl hover:shadow-slate-900/20">
              {/* 悬浮光效（禁用指针事件） */}
              <div className="absolute inset-0 pointer-events-none z-0 bg-gradient-to-br from-blue-500/20 via-indigo-500/10 to-purple-500/20 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300" />

              <div className="relative z-10">
                {/* 图标 */}
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Zap className="w-6 h-6 text-slate-300 group-hover:text-white transition-colors duration-300" />
                </div>

                {/* 文案 */}
                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-slate-100 transition-colors duration-300">
                  掘金技术
                </h3>
                <p className="text-sm text-slate-400 mb-4 leading-relaxed group-hover:text-slate-300 transition-colors duration-300">
                  关注我们的技术文章和分享
                </p>

                {/* 掘金按钮 */}
                <button
                  onClick={handleJuejinClick}
                  className="w-full px-4 py-2 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600 text-white text-sm font-medium rounded-lg hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-blue-500/25 transform hover:-translate-y-0.5 hover:scale-105 active:scale-95"
                  type="button"
                  aria-label="前往掘金主页"
                >
                  前往掘金主页
                </button>

                {/* 装饰元素（禁用指针事件） */}
                <div className="absolute top-4 right-4 w-2 h-2 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                <div className="absolute bottom-4 left-4 w-1.5 h-1.5 bg-white/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              </div>
            </div>
          </motion.div>

          {/* GitHub 卡片 */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', duration: 0.8, bounce: 0.4, delay: 0.4 }}
            className="group relative"
          >
            <div className="relative p-6 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl hover:border-slate-600/50 transition-all duration-300 hover:bg-slate-800/70 hover:shadow-xl hover:shadow-slate-900/20">
              {/* 悬浮光效（禁用指针事件） */}
              <div className="absolute inset-0 pointer-events-none z-0 bg-gradient-to-br from-slate-500/20 via-gray-500/10 to-slate-500/20 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300" />

              <div className="relative z-10">
                {/* 图标 */}
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Github className="w-6 h-6 text-slate-300 group-hover:text-white transition-colors duration-300" />
                </div>

                {/* 文案 */}
                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-slate-100 transition-colors duration-300">
                  GitHub 开源
                </h3>
                <p className="text-sm text-slate-400 mb-4 leading-relaxed group-hover:text-slate-300 transition-colors duration-300">
                  查看我们的开源项目和代码
                </p>

                {/* GitHub 按钮 */}
                <button
                  onClick={handleGithubClick}
                  className="w-full px-4 py-2 bg-gradient-to-r from-slate-400 via-gray-500 to-slate-600 text-white text-sm font-medium rounded-lg hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-slate-500/25 transform hover:-translate-y-0.5 hover:scale-105 active:scale-95"
                  type="button"
                  aria-label="前往 GitHub"
                >
                  前往 GitHub
                </button>

                {/* 装饰元素（禁用指针事件） */}
                <div className="absolute top-4 right-4 w-2 h-2 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                <div className="absolute bottom-4 left-4 w-1.5 h-1.5 bg-white/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* 底部装饰 - 简化设计 */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-center mt-12 pt-8 border-t border-slate-800/50"
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-slate-500 font-medium">DocFlow Community</span>
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-xs text-slate-600">共同构建下一代智能写作平台</p>
        </motion.div>
      </div>
    </section>
  );
};

export default Contact;
