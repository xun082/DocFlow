'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Star, GitFork, Github, ExternalLink } from 'lucide-react';

import { projects, techColors, container, item } from '@/utils';

interface ProjectsProps {
  isMounted: boolean;
}

const Projects: React.FC<ProjectsProps> = ({ isMounted }) => {
  // 生成固定的背景元素（仅在客户端）
  const getBackgroundElements = () => {
    if (!isMounted) {
      return projects.map(() => ({
        codeElements: [],
        techElements: [],
      }));
    }

    // 使用固定的 seed 来确保一致性
    const seededRandom = (seed: number) => {
      const x = Math.sin(seed) * 10000;

      return x - Math.floor(x);
    };

    return projects.map((project, projectIndex) => ({
      codeElements: [...Array(15)].map((_, i) => {
        const seed = projectIndex * 1000 + i;

        return {
          id: `code-${projectIndex}-${i}`,
          content:
            seededRandom(seed) > 0.7 ? '{...}' : seededRandom(seed + 1) > 0.5 ? '() =>' : '</>',
          style: {
            top: `${seededRandom(seed + 2) * 100}%`,
            left: `${seededRandom(seed + 3) * 100}%`,
            fontSize: `${Math.floor(seededRandom(seed + 4) * 8 + 10)}px`,
            transform: `rotate(${seededRandom(seed + 5) * 40 - 20}deg)`,
          },
        };
      }),
      techElements: project.tech.map((tech, i) => {
        const seed = projectIndex * 2000 + i;

        return {
          id: `tech-${projectIndex}-${i}`,
          content: tech,
          style: {
            top: `${seededRandom(seed) * 100}%`,
            left: `${seededRandom(seed + 1) * 100}%`,
            transform: `rotate(${seededRandom(seed + 2) * 40 - 20}deg) scale(${0.7 + seededRandom(seed + 3) * 0.3})`,
          },
        };
      }),
    }));
  };

  return (
    <section className="py-32 relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-black">
      {/* 现代化背景装饰 */}
      <div className="absolute inset-0">
        {/* 主背景渐变 */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-purple-500/3 to-blue-500/5" />

        {/* 网格背景 */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />

        {/* 动态光斑 */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-violet-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-blue-500/8 to-indigo-500/8 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: '1s' }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* 重新设计的标题区域 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-center mb-20"
        >
          {/* 图标装饰 */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            whileInView={{ scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6, type: 'spring', bounce: 0.4 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-violet-500 to-purple-500 rounded-3xl mb-8 shadow-2xl shadow-violet-500/25"
          >
            <Github className="w-10 h-10 text-white" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="space-y-6"
          >
            <h3 className="text-5xl md:text-6xl font-bold">
              <span className="bg-gradient-to-r from-white via-violet-200 to-purple-200 bg-clip-text text-transparent">
                更多
              </span>
              <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                开源项目
              </span>
            </h3>

            <div className="flex items-center justify-center gap-4">
              <div className="w-16 h-px bg-gradient-to-r from-transparent to-violet-500"></div>
              <span className="text-violet-400 font-medium text-sm tracking-wider uppercase">
                Open Source
              </span>
              <div className="w-16 h-px bg-gradient-to-l from-transparent to-violet-500"></div>
            </div>

            <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              探索我们精心打造的开源项目，每一个都承载着创新的理念和对技术的热爱
            </p>
          </motion.div>
        </motion.div>

        {/* 项目卡片网格 */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {projects.map((project, projectIndex) => {
            const bgElements = getBackgroundElements()[projectIndex];

            return (
              <motion.div
                key={project.title}
                variants={item}
                className="group relative bg-slate-800/30 backdrop-blur-xl border border-slate-700/50 rounded-2xl
                  overflow-hidden hover:border-slate-600/50 transition-all duration-500
                  hover:shadow-2xl hover:shadow-violet-500/10 flex flex-col h-[480px] will-change-transform"
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              >
                {/* 重新设计的卡片头部 */}
                <div className="relative h-64 overflow-hidden">
                  {/* 主背景渐变 */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${project.gradient}`} />

                  {/* 网格纹理 */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px]" />

                  {/* 客户端渲染的代码背景 */}
                  <div className="absolute inset-0 opacity-20">
                    {bgElements.codeElements.map((element) => (
                      <div
                        key={element.id}
                        className="absolute text-white/30 font-mono text-xs will-change-transform"
                        style={element.style}
                      >
                        {element.content}
                      </div>
                    ))}
                  </div>

                  {/* 浮动技术标签 */}
                  <div className="absolute inset-0 overflow-hidden opacity-10">
                    {bgElements.techElements.map((element) => (
                      <div
                        key={element.id}
                        className="absolute text-white font-semibold text-sm will-change-transform"
                        style={element.style}
                      >
                        {element.content}
                      </div>
                    ))}
                  </div>

                  {/* 项目信息区域 */}
                  <div className="absolute inset-0 flex flex-col justify-center items-center p-8 z-10">
                    {/* 项目图标 */}
                    <motion.div
                      className="text-7xl mb-6 filter drop-shadow-lg"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.3 }}
                    >
                      {project.icon}
                    </motion.div>

                    {/* 项目标题 */}
                    <h4 className="text-3xl font-bold text-white mb-4 text-center tracking-tight">
                      {project.title}
                    </h4>

                    {/* 统计信息 */}
                    <div className="flex items-center gap-8">
                      <motion.div
                        className="flex items-center gap-2 bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-full"
                        whileHover={{ scale: 1.05 }}
                      >
                        <Star className="w-4 h-4 text-yellow-400" />
                        <span className="text-white font-semibold text-sm">{project.stars}</span>
                      </motion.div>
                      <motion.div
                        className="flex items-center gap-2 bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-full"
                        whileHover={{ scale: 1.05 }}
                      >
                        <GitFork className="w-4 h-4 text-blue-400" />
                        <span className="text-white font-semibold text-sm">{project.forks}</span>
                      </motion.div>
                    </div>
                  </div>

                  {/* 底部渐变遮罩 */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />

                  {/* 悬浮光效 */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>

                {/* 卡片内容区域 */}
                <div className="p-6 flex-1 flex flex-col">
                  {/* 项目描述 */}
                  <p className="text-slate-300 text-sm mb-6 leading-relaxed line-clamp-3">
                    {project.description}
                  </p>

                  {/* 技术标签 */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {project.tech.map((tech, i) => (
                      <motion.span
                        key={`${tech}-${i}`}
                        className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all duration-300 ${
                          techColors[tech] || 'bg-slate-700/50 text-slate-300'
                        } hover:scale-105`}
                        whileHover={{ y: -1 }}
                        transition={{ duration: 0.2 }}
                      >
                        {tech}
                      </motion.span>
                    ))}
                  </div>

                  {/* 查看项目按钮 */}
                  <div className="mt-auto">
                    <motion.a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`查看 ${project.title} 项目的 GitHub 源代码`}
                      className="group/btn w-full inline-flex items-center justify-center gap-2 px-4 py-2.5
                        bg-gradient-to-r from-violet-600 to-purple-600
                        hover:from-violet-500 hover:to-purple-500 text-white font-medium text-sm
                        rounded-lg shadow-lg shadow-violet-500/20
                        hover:shadow-xl hover:shadow-violet-500/30
                        transition-all duration-300 ease-out
                        border border-violet-500/20 hover:border-violet-400/40
                        relative overflow-hidden"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: 0.2 }}
                    >
                      {/* 按钮光效 */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />

                      <Github className="w-4 h-4" />
                      <span>查看项目</span>
                      <ExternalLink className="w-4 h-4 transform transition-transform duration-300 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                    </motion.a>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default Projects;
