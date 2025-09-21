import type { Variants } from 'framer-motion';

// 项目数据
export const projects = [
  {
    title: 'Online Editor',
    description:
      '基于 Next.js 和 NestJS 的在线代码编辑器，使用 Monaco Editor 和 Yjs 实现实时协作编辑和同步功能。',
    link: 'https://github.com/xun082/online-edit-web',
    repo: 'xun082/online-edit-web',
    stars: 704,
    forks: 146,
    tech: ['Next.js', 'TypeScript', 'Shadcn UI', 'Zustand', 'Tailwind CSS', 'Yjs'],
    gradient: 'from-cyan-500 via-blue-600 to-indigo-700',
    cardGlow: 'rgba(6,182,212,0.15)',
    icon: '📝',
  },
  {
    title: 'Create Neat',
    description: '基于 PNPM 和 Turborepo 开发的前端脚手架，旨在帮助用户快速创建各类型项目。',
    link: 'https://github.com/xun082/create-neat',
    repo: 'xun082/create-neat',
    stars: 607,
    forks: 155,
    tech: ['Webpack', 'Vite', 'NodeJs', 'TypeScript', 'Turborepo'],
    gradient: 'from-pink-600 via-purple-600 to-blue-600',
    cardGlow: 'rgba(219,39,119,0.15)',
    icon: '🚀',
  },
  {
    title: 'Create AI Toolkit',
    description:
      '一个 AI 驱动的开发工具包，提供智能化功能如自动生成提交信息、代码审查、根据描述生成 React 组件等，帮助开发者提升效率和代码质量。',
    link: 'https://github.com/xun082/create-ai-toolkit',
    repo: 'xun082/create-ai-toolkit',
    stars: 30,
    forks: 9,
    tech: ['Node.js', 'TypeScript', 'OpenAI'],
    gradient: 'from-emerald-500 via-teal-600 to-cyan-700',
    cardGlow: 'rgba(16,185,129,0.15)',
    icon: '🤖',
  },
];

// 技术标签颜色映射
export const techColors: { [key: string]: string } = {
  Webpack: 'bg-blue-500/20 text-blue-400',
  Vite: 'bg-purple-500/20 text-purple-400',
  NodeJs: 'bg-green-500/20 text-green-400',
  TypeScript: 'bg-blue-600/20 text-blue-400',
  Turborepo: 'bg-pink-500/20 text-pink-400',
  'Next.js': 'bg-gray-700/20 text-gray-300',
  'Shadcn UI': 'bg-slate-500/20 text-slate-400',
  Zustand: 'bg-orange-500/20 text-orange-400',
  'Tailwind CSS': 'bg-cyan-500/20 text-cyan-400',
  Yjs: 'bg-yellow-500/20 text-yellow-400',
  OpenAI: 'bg-emerald-500/20 text-emerald-400',
  'Node.js': 'bg-green-500/20 text-green-400',
};

// 联系方式数据（不包含 JSX 元素）
export const contactMethods = [
  {
    type: 'wechat',
    title: '微信交流',
    desc: '添加微信，获取更多支持和交流',
    text: 'yunmz777',
    isWechat: true,
    gradient: 'from-emerald-400 via-green-500 to-emerald-600',
    cardBg: 'from-emerald-500/20 via-green-500/10 to-emerald-500/20',
    glowColor: 'rgba(16, 185, 129, 0.4)',
    iconBg: 'from-emerald-400 to-green-500',
    borderHover: 'hover:border-emerald-400/50',
  },
  {
    type: 'juejin',
    title: '掘金技术',
    desc: '关注我们的技术文章和分享',
    link: 'https://juejin.cn/user/3782764966460398',
    text: '前往掘金主页',
    gradient: 'from-blue-400 via-indigo-500 to-purple-600',
    cardBg: 'from-blue-500/20 via-indigo-500/10 to-purple-500/20',
    glowColor: 'rgba(99, 102, 241, 0.4)',
    iconBg: 'from-blue-400 to-indigo-500',
    borderHover: 'hover:border-blue-400/50',
  },
  {
    type: 'github',
    title: 'GitHub 开源',
    desc: '查看我们的开源项目和代码',
    link: 'https://github.com/xun082',
    text: '前往 GitHub',
    gradient: 'from-slate-400 via-gray-500 to-slate-600',
    cardBg: 'from-slate-500/20 via-gray-500/10 to-slate-500/20',
    glowColor: 'rgba(148, 163, 184, 0.4)',
    iconBg: 'from-slate-400 to-gray-500',
    borderHover: 'hover:border-slate-400/50',
  },
];

// FAQ 数据
export const faqs = [
  {
    question: 'DocFlow 是完全免费的吗？',
    answer:
      'DocFlow 是完全开源免费的项目，基于 MIT 协议。你可以免费使用、修改和分发。我们也提供托管服务和技术支持的商业方案，但核心功能永远免费开放。',
    icon: '💝',
    gradient: 'from-emerald-400 via-green-500 to-teal-600',
    lightGradient: 'from-emerald-300 to-green-400',
    shadowColor: 'rgba(16, 185, 129, 0.3)',
    accentColor: 'text-emerald-400',
  },
  {
    question: '如何开始使用 DocFlow？',
    answer:
      '你可以直接在我们的网站上注册账号开始使用，或者下载源代码部署到自己的服务器。我们提供详细的部署文档、视频教程，以及 Docker 一键部署方案，让你 5 分钟内就能启动自己的文档协作平台。',
    icon: '🚀',
    gradient: 'from-blue-400 via-indigo-500 to-purple-600',
    lightGradient: 'from-blue-300 to-indigo-400',
    shadowColor: 'rgba(59, 130, 246, 0.3)',
    accentColor: 'text-blue-400',
  },
  {
    question: '支持多少人同时协作编辑？',
    answer:
      '理论上没有人数限制！我们基于 Yjs 的 CRDT 算法，经过测试支持 100+ 人同时编辑同一文档依然保持流畅。实际表现主要取决于你的服务器配置和网络环境。',
    icon: '👥',
    gradient: 'from-purple-400 via-pink-500 to-rose-600',
    lightGradient: 'from-purple-300 to-pink-400',
    shadowColor: 'rgba(168, 85, 247, 0.3)',
    accentColor: 'text-purple-400',
  },
  {
    question: '数据安全性如何保障？',
    answer:
      '我们采用端到端加密传输，所有数据存储在你自己控制的服务器上。开源代码保证完全透明，没有任何后门。你可以完全控制数据的存储、备份和访问权限，符合企业级安全要求。',
    icon: '🔒',
    gradient: 'from-orange-400 via-red-500 to-pink-600',
    lightGradient: 'from-orange-300 to-red-400',
    shadowColor: 'rgba(249, 115, 22, 0.3)',
    accentColor: 'text-orange-400',
  },
  {
    question: '可以导入导出其他格式吗？',
    answer:
      '当然可以！支持导入导出 Markdown、HTML、PDF、Word 等多种格式。我们还在开发更多格式支持，比如 Notion、Confluence 等平台的数据迁移工具。',
    icon: '📄',
    gradient: 'from-cyan-400 via-blue-500 to-indigo-600',
    lightGradient: 'from-cyan-300 to-blue-400',
    shadowColor: 'rgba(6, 182, 212, 0.3)',
    accentColor: 'text-cyan-400',
  },
  {
    question: '如何获得技术支持？',
    answer:
      '我们提供多种支持渠道：GitHub Issues（开源社区支持）、微信群（实时交流）、邮件支持，以及付费的专业技术服务。社区版本有活跃的开发者社区，问题通常能在 24 小时内得到回复。',
    icon: '🛠️',
    gradient: 'from-violet-400 via-purple-500 to-indigo-600',
    lightGradient: 'from-violet-300 to-purple-400',
    shadowColor: 'rgba(139, 92, 246, 0.3)',
    accentColor: 'text-violet-400',
  },
];

// 动画配置
export const springConfig = { damping: 25, stiffness: 700 };

export const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

export const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      duration: 0.4,
      bounce: 0.2,
    },
  },
};

export const contactContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
};

export const contactItem: Variants = {
  hidden: { opacity: 0, y: 50, scale: 0.8 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      duration: 0.8,
      bounce: 0.4,
    },
  },
};

export const faqContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2,
    },
  },
};

export const faqItem: Variants = {
  hidden: { opacity: 0, y: 50, scale: 0.9, rotateX: -15 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    rotateX: 0,
    transition: {
      type: 'spring' as const,
      duration: 0.8,
      bounce: 0.4,
    },
  },
};
