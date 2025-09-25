'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Edit3,
  Users,
  Database,
  Search,
  Mic,
  Sparkles,
  MessageCircle,
  Bot,
  Zap,
} from 'lucide-react';

interface FeaturesProps {
  isMounted: boolean;
}

const featuresData = [
  {
    icon: Edit3,
    title: '沉浸式编辑器',
    description:
      '基于 Tiptap 打造的下一代编辑体验，支持 Markdown 快捷键、块级编辑、拖拽排版，让写作如行云流水般自然',
    gradient: 'from-violet-500 to-purple-600',
    glowColor: 'rgba(139, 92, 246, 0.3)',
    bgGradient: 'from-violet-500/10 via-purple-500/5 to-violet-500/10',
  },
  {
    icon: Users,
    title: '实时协作引擎',
    description:
      '基于 Yjs CRDT 算法的毫秒级同步技术，支持百人同时在线编辑，冲突自动解决，协作从未如此丝滑',
    gradient: 'from-emerald-500 to-teal-600',
    glowColor: 'rgba(16, 185, 129, 0.3)',
    bgGradient: 'from-emerald-500/10 via-teal-500/5 to-emerald-500/10',
  },
  {
    icon: Sparkles,
    title: 'AI 创作引擎',
    description:
      '深度理解上下文语境的智能续写系统，支持多种写作风格切换，让 AI 成为你最懂你的创作伙伴',
    gradient: 'from-pink-500 to-rose-600',
    glowColor: 'rgba(236, 72, 153, 0.3)',
    bgGradient: 'from-pink-500/10 via-rose-500/5 to-pink-500/10',
  },
  {
    icon: Database,
    title: '知识图谱系统',
    description:
      '智能构建知识关联网络，自动提取文档关键信息，支持语义搜索和知识发现，让信息价值最大化',
    gradient: 'from-blue-500 to-cyan-600',
    glowColor: 'rgba(59, 130, 246, 0.3)',
    bgGradient: 'from-blue-500/10 via-cyan-500/5 to-blue-500/10',
  },
  {
    icon: Search,
    title: 'RAG 检索增强',
    description:
      '结合向量数据库和语义理解的智能检索系统，精准定位相关内容，为创作提供强大的知识支撑',
    gradient: 'from-orange-500 to-red-600',
    glowColor: 'rgba(249, 115, 22, 0.3)',
    bgGradient: 'from-orange-500/10 via-red-500/5 to-orange-500/10',
  },
  {
    icon: MessageCircle,
    title: '智能对话助手',
    description: '基于文档上下文的专属 AI 助手，深度理解你的内容，提供精准的写作建议和创意灵感',
    gradient: 'from-indigo-500 to-blue-600',
    glowColor: 'rgba(99, 102, 241, 0.3)',
    bgGradient: 'from-indigo-500/10 via-blue-500/5 to-indigo-500/10',
  },
  {
    icon: Mic,
    title: '音频内容生成',
    description: '文档一键转换为专业播客，支持多语言、多音色、情感表达，让知识以声音的形式传播更远',
    gradient: 'from-purple-500 to-pink-600',
    glowColor: 'rgba(168, 85, 247, 0.3)',
    bgGradient: 'from-purple-500/10 via-pink-500/5 to-purple-500/10',
  },
  {
    icon: Bot,
    title: '生活智能助理',
    description:
      '全方位生活服务助手，智能规划出行路线、管理日程安排、提醒重要事项，让生活更有序高效',
    gradient: 'from-cyan-500 to-blue-600',
    glowColor: 'rgba(6, 182, 212, 0.3)',
    bgGradient: 'from-cyan-500/10 via-blue-500/5 to-cyan-500/10',
  },
  {
    icon: Zap,
    title: 'Agent 流程编排',
    description:
      '可视化 Agent 构建平台，从输入处理到输出生成的完整流程设计，支持多模态数据处理和复杂逻辑编排',
    gradient: 'from-yellow-500 to-orange-600',
    glowColor: 'rgba(245, 158, 11, 0.3)',
    bgGradient: 'from-yellow-500/10 via-orange-500/5 to-yellow-500/10',
  },
];

const Features: React.FC<FeaturesProps> = ({ isMounted }) => {
  return (
    <section className="relative py-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* 标题部分 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            DocFlow
            <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              核心能力矩阵
            </span>
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            九大核心功能模块，构建完整的 AI 驱动内容创作生态系统
          </p>
        </motion.div>

        {/* 功能卡片网格 */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: isMounted ? 1 : 0.7, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {featuresData.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{
                opacity: isMounted ? 1 : 0.6,
                y: 0,
                scale: isMounted ? 1 : 0.95,
              }}
              transition={{
                duration: 0.6,
                delay: isMounted ? 0.3 + index * 0.1 : 0.1 + index * 0.05,
                ease: 'easeOut',
              }}
              className="group relative"
            >
              {/* 背景渐变光效 */}
              <div
                className={`absolute -inset-0.5 bg-gradient-to-r ${feature.gradient} rounded-2xl blur transition-all duration-1000 ${
                  isMounted
                    ? 'opacity-20 group-hover:opacity-40 group-hover:duration-200'
                    : 'opacity-10'
                }`}
              />

              {/* 主卡片 */}
              <div className="relative bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden p-6 h-full">
                {/* 顶部装饰渐变 */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.gradient}`}
                />

                {/* 背景图案 */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.bgGradient} transition-opacity duration-1000 ${
                    isMounted ? 'opacity-30' : 'opacity-10'
                  }`}
                />

                {/* 内容区域 */}
                <div className="relative">
                  {/* 图标区域 */}
                  <div className="flex justify-center mb-4">
                    <motion.div
                      className={`relative w-12 h-12 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center shadow-lg transition-all duration-500 ${
                        isMounted ? 'group-hover:scale-110' : ''
                      }`}
                      style={{
                        boxShadow: isMounted
                          ? `0 10px 20px ${feature.glowColor}, 0 0 0 1px rgba(255,255,255,0.1)`
                          : `0 5px 10px ${feature.glowColor}, 0 0 0 1px rgba(255,255,255,0.05)`,
                      }}
                      whileHover={
                        isMounted
                          ? {
                              scale: 1.1,
                              boxShadow: `0 15px 30px ${feature.glowColor}, 0 0 0 1px rgba(255,255,255,0.2)`,
                            }
                          : undefined
                      }
                      transition={{ duration: 0.3 }}
                    >
                      <feature.icon className="h-6 w-6 text-white drop-shadow-lg" />
                    </motion.div>
                  </div>

                  {/* 标题 */}
                  <h3
                    className={`text-lg font-bold text-white mb-3 text-center transition-all duration-300 ${
                      isMounted
                        ? 'group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-white group-hover:to-gray-300'
                        : ''
                    }`}
                  >
                    {feature.title}
                  </h3>

                  {/* 描述 */}
                  <p
                    className={`text-gray-400 text-sm leading-relaxed text-center transition-colors duration-300 ${
                      isMounted ? 'group-hover:text-gray-300' : ''
                    }`}
                  >
                    {feature.description}
                  </p>
                </div>

                {/* 悬浮时的边框光效 */}
                {isMounted && (
                  <div
                    className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}
                    style={{
                      background: `linear-gradient(135deg, ${feature.glowColor}00, ${feature.glowColor}20, ${feature.glowColor}00)`,
                      boxShadow: `inset 0 1px 0 rgba(255,255,255,0.1), 0 0 15px ${feature.glowColor}`,
                    }}
                  />
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
