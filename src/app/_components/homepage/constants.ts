import {
  Edit3,
  Users,
  Sparkles,
  Database,
  Search,
  MessageCircle,
  Mic,
  UserCircle,
  Zap,
} from 'lucide-react';

import type { FeatureItem } from './types';

export const FEATURES: readonly FeatureItem[] = [
  {
    icon: Edit3,
    title: '沉浸式编辑器',
    description:
      '基于 Tiptap 打造的下一代编辑体验,支持 Markdown 快捷键、块级编辑、拖拽排版,让写作如行云流水般自然',
    gradient: 'from-violet-500 to-purple-600',
    bgColor: 'bg-violet-50',
    borderColor: 'border-violet-200',
    hoverBorder: 'hover:border-violet-400',
    textColor: 'text-violet-700',
  },
  {
    icon: Users,
    title: '实时协作引擎',
    description:
      '基于 Yjs CRDT 算法的毫秒级同步技术,支持百人同时在线编辑,冲突自动解决,协作从未如此丝滑',
    gradient: 'from-emerald-500 to-teal-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    hoverBorder: 'hover:border-emerald-400',
    textColor: 'text-emerald-700',
  },
  {
    icon: Sparkles,
    title: 'AI 创作引擎',
    description:
      '深度理解上下文语境的智能续写系统,支持多种写作风格切换,让 AI 成为你最懂你的创作伙伴',
    gradient: 'from-pink-500 to-rose-600',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
    hoverBorder: 'hover:border-pink-400',
    textColor: 'text-pink-700',
  },
  {
    icon: Database,
    title: '知识图谱系统',
    description:
      '智能构建知识关联网络,自动提取文档关键信息,支持语义搜索和知识发现,让信息价值最大化',
    gradient: 'from-blue-500 to-cyan-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    hoverBorder: 'hover:border-blue-400',
    textColor: 'text-blue-700',
  },
  {
    icon: Search,
    title: 'RAG 检索增强',
    description: '结合向量数据库和语义理解的智能检索系统,精准定位相关内容,为创作提供强大的知识支撑',
    gradient: 'from-orange-500 to-red-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    hoverBorder: 'hover:border-orange-400',
    textColor: 'text-orange-700',
  },
  {
    icon: MessageCircle,
    title: '智能对话助手',
    description: '基于文档上下文的专属 AI 助手,深度理解你的内容,提供精准的写作建议和创意灵感',
    gradient: 'from-indigo-500 to-blue-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    hoverBorder: 'hover:border-indigo-400',
    textColor: 'text-indigo-700',
  },
  {
    icon: Mic,
    title: '音频内容生成',
    description: '文档一键转换为专业播客,支持多语言、多音色、情感表达,让知识以声音的形式传播更远',
    gradient: 'from-purple-500 to-pink-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    hoverBorder: 'hover:border-purple-400',
    textColor: 'text-purple-700',
  },
  {
    icon: UserCircle,
    title: '生活智能助理',
    description: '全方位生活服务助手,智能规划出行路线、管理日程安排、提醒重要事项,让生活更有序高效',
    gradient: 'from-cyan-500 to-blue-600',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
    hoverBorder: 'hover:border-cyan-400',
    textColor: 'text-cyan-700',
  },
  {
    icon: Zap,
    title: 'Agent 流程编排',
    description:
      '可视化 Agent 构建平台,从输入处理到输出生成的完整流程设计,支持多模态数据处理和复杂逻辑编排',
    gradient: 'from-yellow-500 to-orange-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    hoverBorder: 'hover:border-yellow-400',
    textColor: 'text-yellow-700',
  },
] as const;

export const SITE_CONFIG = {
  name: 'DocFlow',
  tagline: 'AI 智能写作平台',
  description:
    'DocFlow 基于 Tiptap+Yjs 构建的智能协作编辑器,集成 AI 续写、RAG 知识库检索、AI 播客生成。支持多人实时协作编辑、Markdown、富文本等格式。',
  url: 'https://www.codecrack.cn',
  githubUrl: 'https://github.com/xun082/DocFlow',
  blogUrl: '/blog',
  dashboardUrl: '/dashboard',
  year: 2026,
  beianNumber: '粤ICP备2025376666号',
  gonganBeian: '粤公网安备 44030502008888号',
  techStack: ['React 19', 'TypeScript', 'AI Powered'],
} as const;

export const STRUCTURED_DATA = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: SITE_CONFIG.name,
  description: SITE_CONFIG.description,
  url: SITE_CONFIG.url,
  applicationCategory: 'ProductivityApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'CNY' },
} as const;
