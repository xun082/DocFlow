'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import {
  FileText,
  Github,
  Code,
  Edit3,
  Layers,
  Sparkles,
  Star,
  GitFork,
  ExternalLink,
  MessageCircle,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Zap,
  Target,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { getCookie } from '@/utils/cookie';

const Page = () => {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 25, stiffness: 700 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  useEffect(() => {
    setIsMounted(true);

    const token = getCookie('auth_token');
    setIsLoggedIn(!!token);

    // 检查是否是GitHub OAuth回调（如果callback URL配置错误指向了根目录）
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');

      if (code) {
        // 构建完整的callback URL，保留所有参数
        const callbackUrl = `/auth/callback${window.location.search}`;
        // 使用replace避免在浏览器历史中留下痕迹
        window.location.replace(callbackUrl);

        return; // 早期返回，避免设置其他监听器
      }

      const handleMouseMove = (e: MouseEvent) => {
        mouseX.set(e.clientX - 192);
        mouseY.set(e.clientY - 192);
      };

      window.addEventListener('mousemove', handleMouseMove);

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
      };
    }
  }, [mouseX, mouseY]);

  const handleGetStarted = () => {
    if (isLoggedIn) {
      router.push('/dashboard');
    } else {
      router.push('/auth');
    }
  };

  const features = [
    {
      icon: Edit3,
      title: '多人实时协作',
      description:
        '支持多人同时编辑同一文档，实时看到其他人的光标和修改，就像 Google Docs 一样流畅',
      gradient: 'from-violet-500 to-purple-600',
      glowColor: 'rgba(139, 92, 246, 0.3)',
      bgGradient: 'from-violet-500/10 via-purple-500/5 to-violet-500/10',
      details: ['实时同步编辑', '冲突自动解决', '历史版本追踪'],
    },
    {
      icon: Layers,
      title: '丰富编辑功能',
      description: '支持富文本、表格、代码块、图片等多种内容格式，满足各种文档编写需求',
      gradient: 'from-blue-500 to-cyan-600',
      glowColor: 'rgba(59, 130, 246, 0.3)',
      bgGradient: 'from-blue-500/10 via-cyan-500/5 to-blue-500/10',
      details: ['富文本编辑', '插入表格图片', '代码语法高亮'],
    },
    {
      icon: Code,
      title: '开发者友好',
      description: '基于现代 Web 技术栈构建，代码开源，支持自定义部署和二次开发',
      gradient: 'from-emerald-500 to-teal-600',
      glowColor: 'rgba(16, 185, 129, 0.3)',
      bgGradient: 'from-emerald-500/10 via-teal-500/5 to-emerald-500/10',
      details: ['完全开源', '技术栈先进', '易于部署'],
    },
  ];

  // 项目数据
  const projects = [
    {
      title: 'Online Editor',
      description:
        '基于 Next.js 和 NestJS 的在线代码编辑器，使用 Monaco Editor 和 Yjs 实现实时协作编辑和同步功能。',
      link: 'https://github.com/xun082/online-edit-web',
      repo: 'xun082/online-edit-web',
      stars: 670,
      forks: 140,
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
      stars: 592,
      forks: 151,
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

  const techColors: { [key: string]: string } = {
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

  // 优化的动画配置
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const item: Variants = {
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

  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});

  const handleCopyText = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStates((prev) => ({ ...prev, [key]: true }));
      setTimeout(() => {
        setCopiedStates((prev) => ({ ...prev, [key]: false }));
      }, 2000);
    } catch {
      // 复制失败时静默处理
    }
  };

  const contactContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const contactItem: Variants = {
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

  const contactMethods = [
    {
      icon: <MessageCircle className="h-6 w-6" />,
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
      icon: (
        <svg
          className="h-6 w-6"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 2.5c-5.2 0-9.5 4.3-9.5 9.5 0 2.1.7 4.1 1.9 5.7l.8-.8c-1-1.4-1.6-3.1-1.6-4.9 0-4.7 3.8-8.5 8.5-8.5s8.5 3.8 8.5 8.5-3.8 8.5-8.5 8.5c-1.8 0-3.5-.6-4.9-1.6l-.8.8c1.6 1.2 3.6 1.9 5.7 1.9 5.2 0 9.5-4.3 9.5-9.5S17.2 2.5 12 2.5zm0 3c-3.6 0-6.5 2.9-6.5 6.5s2.9 6.5 6.5 6.5 6.5-2.9 6.5-6.5S15.6 5.5 12 5.5zm0 2c2.5 0 4.5 2 4.5 4.5s-2 4.5-4.5 4.5-4.5-2-4.5-4.5S9.5 7.5 12 7.5zm0 2c-1.4 0-2.5 1.1-2.5 2.5s1.1 2.5 2.5 2.5 2.5-1.1 2.5-2.5S13.4 9.5 12 9.5z" />
        </svg>
      ),
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
      icon: <Github className="h-6 w-6" />,
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

  // FAQ 组件逻辑
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const faqContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.2,
      },
    },
  };

  const faqItem: Variants = {
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

  const faqs = [
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

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      {/* 动态背景 */}
      <div className="absolute inset-0">
        {/* 鼠标跟随光圈 - 使用优化的 motion value */}
        <motion.div
          className="pointer-events-none absolute h-96 w-96 rounded-full bg-gradient-to-r from-violet-500/20 to-purple-500/20 blur-3xl will-change-transform"
          style={{
            x: springX,
            y: springY,
          }}
        />

        {/* 静态装饰光圈 */}
        <motion.div
          className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-gradient-to-r from-blue-500/10 to-cyan-500/10 blur-3xl will-change-transform"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
            repeatType: 'reverse',
          }}
        />

        <motion.div
          className="absolute top-3/4 right-1/4 h-96 w-96 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 blur-3xl will-change-transform"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
            repeatType: 'reverse',
            delay: 2,
          }}
        />

        {/* 网格背景 */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[length:60px_60px]" />
      </div>

      {/* Header */}
      <header className="relative z-50 px-6 py-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <motion.div
            className="flex items-center space-x-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/25">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">DocFlow</span>
            <span className="rounded-full bg-gradient-to-r from-violet-500 to-purple-500 px-3 py-1 text-xs font-medium text-white">
              开源
            </span>
          </motion.div>

          <motion.div
            className="flex items-center space-x-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
          >
            <Link
              href="https://github.com/xun082/DocFlow"
              target="_blank"
              aria-label="查看 DocFlow 在 GitHub 上的源代码"
            >
              <div className="flex items-center space-x-2 rounded-lg border border-transparent px-4 py-2 text-gray-400 transition-colors duration-300 hover:border-white/10 hover:bg-white/5 hover:text-white">
                <Github className="h-4 w-4" />
                <span className="text-sm font-medium">GitHub</span>
              </div>
            </Link>
            <Button
              onClick={handleGetStarted}
              className="bg-gradient-to-r from-violet-500 to-purple-600 px-6 py-2.5 text-white shadow-lg shadow-violet-500/25 transition-all duration-300 hover:scale-105 hover:from-violet-600 hover:to-purple-700"
            >
              {isLoggedIn ? '快速开始' : '免费使用'}
            </Button>
          </motion.div>
        </div>
      </header>

      {/* Hero Section - 主要内容 */}
      <section className="relative flex min-h-[calc(100vh-120px)] items-center justify-center px-6">
        <div className="relative z-10 mx-auto w-full max-w-7xl text-center">
          {/* 主标题部分 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="mb-12"
          >
            <div className="mb-6 inline-flex items-center space-x-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-white backdrop-blur-xl">
              <Sparkles className="h-4 w-4 text-violet-400" />
              <span className="text-sm font-medium">基于 Tiptap + Yjs 构建</span>
            </div>

            <h1 className="mb-6 text-5xl leading-tight font-bold md:text-7xl">
              <span className="bg-gradient-to-r from-white via-violet-200 to-purple-200 bg-clip-text text-transparent">
                在线协作
              </span>
              <br />
              <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                文档编辑器
              </span>
            </h1>

            <p className="mx-auto mb-8 max-w-3xl text-lg leading-relaxed text-gray-300">
              让团队像使用 Google Docs 一样协作编辑文档
              <br />
              <span className="text-gray-400">支持实时同步、富文本编辑、版本管理</span>
            </p>
          </motion.div>

          {/* 三个功能卡片 - 美化版本，有平滑的加载状态 */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: isMounted ? 1 : 0.7, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
            className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3"
          >
            {features.map((feature, index) => (
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
                  delay: isMounted ? 0.4 + index * 0.1 : 0.2 + index * 0.05,
                  ease: 'easeOut',
                }}
                className="group relative"
              >
                {/* 背景渐变光效 - 只在 mounted 后显示完整效果 */}
                <div
                  className={`absolute -inset-0.5 bg-gradient-to-r ${feature.gradient} rounded-3xl blur transition-all duration-1000 ${
                    isMounted
                      ? 'opacity-20 group-hover:opacity-40 group-hover:duration-200'
                      : 'opacity-10'
                  }`}
                />

                {/* 主卡片 */}
                <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/80 backdrop-blur-xl">
                  {/* 顶部装饰渐变 */}
                  <div
                    className={`absolute top-0 right-0 left-0 h-1 bg-gradient-to-r ${feature.gradient}`}
                  />

                  {/* 背景图案 */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${feature.bgGradient} transition-opacity duration-1000 ${
                      isMounted ? 'opacity-30' : 'opacity-10'
                    }`}
                  />

                  {/* 内容区域 */}
                  <div className="relative h-full p-6">
                    {/* 图标区域 */}
                    <div className="mb-4 flex justify-center">
                      <motion.div
                        className={`relative h-14 w-14 bg-gradient-to-br ${feature.gradient} flex items-center justify-center rounded-2xl shadow-2xl transition-all duration-500 ${
                          isMounted ? 'group-hover:scale-110' : ''
                        }`}
                        style={{
                          boxShadow: isMounted
                            ? `0 15px 30px ${feature.glowColor}, 0 0 0 1px rgba(255,255,255,0.1)`
                            : `0 8px 16px ${feature.glowColor}, 0 0 0 1px rgba(255,255,255,0.05)`,
                        }}
                        whileHover={
                          isMounted
                            ? {
                                scale: 1.15,
                                boxShadow: `0 20px 40px ${feature.glowColor}, 0 0 0 1px rgba(255,255,255,0.2)`,
                              }
                            : undefined
                        }
                        transition={{ duration: 0.3 }}
                      >
                        <feature.icon className="h-7 w-7 text-white drop-shadow-lg" />

                        {/* 图标光环效果 - 只在 mounted 后显示 */}
                        {isMounted && (
                          <div
                            className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} rounded-2xl opacity-0 blur-md transition-opacity duration-500 group-hover:opacity-20`}
                          />
                        )}
                      </motion.div>
                    </div>

                    {/* 标题 */}
                    <h2
                      className={`mb-3 text-xl font-bold text-white transition-all duration-300 ${
                        isMounted
                          ? 'group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 group-hover:bg-clip-text group-hover:text-transparent'
                          : ''
                      }`}
                    >
                      {feature.title}
                    </h2>

                    {/* 描述 */}
                    <p
                      className={`mb-4 text-sm leading-relaxed text-gray-400 transition-colors duration-300 ${
                        isMounted ? 'group-hover:text-gray-300' : ''
                      }`}
                    >
                      {feature.description}
                    </p>

                    {/* 特性列表 */}
                    <div className="space-y-2">
                      {feature.details.map((detail, detailIndex) => (
                        <motion.div
                          key={detailIndex}
                          className={`flex items-center text-xs text-gray-500 transition-colors duration-300 ${
                            isMounted ? 'group-hover:text-gray-400' : ''
                          }`}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            delay: isMounted ? 0.6 + detailIndex * 0.1 : 0.3 + detailIndex * 0.05,
                            duration: 0.4,
                          }}
                        >
                          <div
                            className={`h-1.5 w-1.5 bg-gradient-to-r ${feature.gradient} mr-3 flex-shrink-0 rounded-full shadow-sm`}
                          />
                          <span>{detail}</span>
                        </motion.div>
                      ))}
                    </div>

                    {/* 底部装饰线 */}
                    <div
                      className={`absolute right-6 bottom-0 left-6 h-px bg-gradient-to-r ${feature.gradient} transition-opacity duration-500 ${
                        isMounted ? 'opacity-20 group-hover:opacity-40' : 'opacity-10'
                      }`}
                    />
                  </div>

                  {/* 悬浮时的边框光效 - 只在 mounted 后显示 */}
                  {isMounted && (
                    <div
                      className={`pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
                      style={{
                        background: `linear-gradient(135deg, ${feature.glowColor}00, ${feature.glowColor}20, ${feature.glowColor}00)`,
                        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.1), 0 0 20px ${feature.glowColor}`,
                      }}
                    />
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Contact 组件 - 联系我们部分 */}
      <section className="relative overflow-hidden px-6 py-24">
        {/* 背景装饰 */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-violet-500/5 to-black/0" />

        {/* 动态背景光效 */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-1/2 left-1/4 h-96 w-96 rounded-full bg-gradient-to-r from-emerald-500/10 to-blue-500/10 blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
              x: [0, 50, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="absolute top-1/3 right-1/4 h-80 w-80 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 blur-3xl"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.5, 0.2],
              x: [0, -30, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 2,
            }}
          />
        </div>

        <div className="relative mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="mb-16 text-center"
          >
            <div className="relative inline-block">
              {/* 标题背景光效 */}
              <motion.div
                className="absolute -inset-4 rounded-2xl bg-gradient-to-r from-violet-600/20 to-purple-600/20 blur-xl"
                animate={{
                  scale: [1, 1.05, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
              <h3 className="relative mb-6 bg-gradient-to-r from-white via-violet-200 to-purple-200 bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
                加入社区
              </h3>
            </div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mx-auto max-w-2xl text-xl leading-relaxed text-gray-300"
            >
              与开发者交流学习，共同构建更好的协作编辑器
            </motion.p>
          </motion.div>

          <motion.div
            variants={contactContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-100px' }}
            className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3"
          >
            {contactMethods.map((method, index) => (
              <motion.div
                key={method.title}
                variants={contactItem}
                onHoverStart={() => setHoveredIndex(index)}
                onHoverEnd={() => setHoveredIndex(null)}
                className={`group relative overflow-hidden rounded-3xl transition-all duration-500 ${method.borderHover}`}
              >
                {/* 主要边框和背景 */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/10 via-white/5 to-white/10" />

                {/* 动态边框光效 */}
                <motion.div
                  className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  animate={{
                    opacity: hoveredIndex === index ? 0.15 : 0,
                  }}
                />

                {/* 卡片背景渐变 */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${method.cardBg} rounded-3xl opacity-50 transition-opacity duration-500 group-hover:opacity-80`}
                />

                {/* 悬浮时的光晕效果 */}
                <motion.div
                  className="absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{
                    boxShadow: `0 0 60px ${method.glowColor}`,
                  }}
                />

                <div className="relative flex h-full flex-col rounded-3xl border border-white/20 p-8 backdrop-blur-xl">
                  {/* 图标区域 */}
                  <div className="mb-6 flex justify-center">
                    <motion.div
                      className={`relative h-16 w-16 bg-gradient-to-br ${method.iconBg} flex items-center justify-center rounded-2xl shadow-2xl`}
                      whileHover={{
                        scale: 1.1,
                        rotate: [0, -5, 5, 0],
                      }}
                      transition={{
                        scale: { duration: 0.2 },
                        rotate: { duration: 0.6, ease: 'easeInOut' },
                      }}
                    >
                      {/* 图标背景光环 */}
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${method.iconBg} rounded-2xl opacity-50 blur-sm transition-opacity duration-500 group-hover:opacity-80`}
                      />

                      <div className="relative text-white drop-shadow-lg">{method.icon}</div>

                      {/* 图标光点装饰 */}
                      <motion.div
                        className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-white/60 blur-sm"
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.6, 1, 0.6],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                      />
                    </motion.div>
                  </div>

                  {/* 内容区域 */}
                  <div className="flex flex-1 flex-col justify-between text-center">
                    <div>
                      <motion.h3
                        className="mb-3 text-2xl font-bold text-white transition-all duration-300 group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-200 group-hover:bg-clip-text group-hover:text-transparent"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.2 }}
                      >
                        {method.title}
                      </motion.h3>
                      <p className="mb-6 text-base leading-relaxed text-gray-400 transition-colors duration-300 group-hover:text-gray-300">
                        {method.desc}
                      </p>
                    </div>

                    {/* 按钮区域 */}
                    <div className="mt-auto">
                      {method.isWechat ? (
                        <motion.button
                          onClick={() => handleCopyText(method.text, 'wechat')}
                          className={`relative overflow-hidden bg-gradient-to-r px-6 py-3 ${method.gradient} group/btn w-full rounded-xl text-base font-medium text-white shadow-lg transition-all duration-300`}
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {/* 按钮背景动画 */}
                          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 opacity-0 transition-opacity duration-300 group-hover/btn:opacity-100" />

                          <span className="relative flex items-center justify-center gap-2">
                            <span>{method.text}</span>
                            <motion.div
                              animate={copiedStates.wechat ? { rotate: 360 } : {}}
                              transition={{ duration: 0.3 }}
                            >
                              {copiedStates.wechat ? (
                                <Check className="h-4 w-4" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </motion.div>
                          </span>
                        </motion.button>
                      ) : (
                        <motion.a
                          href={method.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${method.text} - ${method.desc}`}
                          className={`relative overflow-hidden bg-gradient-to-r px-6 py-3 ${method.gradient} group/btn block rounded-xl text-base font-medium text-white shadow-lg transition-all duration-300`}
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {/* 按钮背景动画 */}
                          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 opacity-0 transition-opacity duration-300 group-hover/btn:opacity-100" />

                          <span className="relative">{method.text}</span>
                        </motion.a>
                      )}
                    </div>
                  </div>

                  {/* 装饰性光点 */}
                  <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-white/30 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  <div className="absolute bottom-4 left-4 h-1 w-1 rounded-full bg-white/40 opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* 底部装饰线 */}
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8, duration: 1, ease: 'easeOut' }}
            className="mx-auto mt-16 h-1 w-32 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 opacity-50"
          />
        </div>
      </section>

      {/* 社区项目展示 */}
      <section className="relative py-24">
        <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-violet-500/5 to-black/0" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 space-y-6 text-center">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="inline-block rounded-full border border-violet-500/20 bg-violet-500/10 px-6 py-2 text-sm font-medium text-violet-400"
            >
              开源项目
            </motion.span>
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: 0.1, duration: 0.5, ease: 'easeOut' }}
              className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-4xl font-bold text-transparent sm:text-5xl"
            >
              更多开源项目
            </motion.h3>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: 0.2, duration: 0.5, ease: 'easeOut' }}
              className="mx-auto max-w-2xl text-base text-gray-300 sm:text-lg"
            >
              这些项目都是与社区的朋友们一起完成的，期待更多开发者的参与和贡献！
            </motion.p>
          </div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-100px' }}
            className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3"
          >
            {projects.map((project, projectIndex) => {
              const bgElements = getBackgroundElements()[projectIndex];

              return (
                <motion.div
                  key={project.title}
                  variants={item}
                  className="group relative flex h-[480px] flex-col overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur-lg transition-all duration-500 will-change-transform hover:border-white/20 hover:shadow-[0_0_30px_rgba(139,92,246,0.1)]"
                  style={{
                    boxShadow: `0 0 40px ${project.cardGlow}`,
                  }}
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                >
                  {/* 炫酷的项目卡片头部设计 */}
                  <div className="relative h-56 overflow-hidden">
                    {/* 渐变背景 */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${project.gradient} opacity-80`}
                    ></div>

                    {/* 客户端渲染的代码模式背景 */}
                    <div className="absolute inset-0">
                      {bgElements.codeElements.map((element) => (
                        <div
                          key={element.id}
                          className="absolute font-mono text-white/10 will-change-transform"
                          style={element.style}
                        >
                          {element.content}
                        </div>
                      ))}
                    </div>

                    {/* 客户端渲染的技术浮动图标 */}
                    <div className="absolute inset-0 overflow-hidden">
                      {bgElements.techElements.map((element) => (
                        <div
                          key={element.id}
                          className="absolute text-lg font-bold text-white/20 will-change-transform"
                          style={element.style}
                        >
                          {element.content}
                        </div>
                      ))}
                    </div>

                    {/* 项目图标和名称区域 */}
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center">
                      {/* 项目图标 */}
                      <div className="mb-4 text-6xl">{project.icon}</div>
                      <h4 className="mb-3 text-3xl font-bold tracking-tight text-white drop-shadow-md">
                        {project.title}
                      </h4>
                      <div className="mb-2 flex items-center gap-6">
                        <div className="flex items-center gap-2">
                          <Star className="h-5 w-5 text-xl text-yellow-300" />
                          <span className="text-lg font-semibold text-white">{project.stars}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <GitFork className="h-5 w-5 text-xl text-blue-300" />
                          <span className="text-lg font-semibold text-white">{project.forks}</span>
                        </div>
                      </div>
                    </div>

                    {/* 底部渐变遮罩 */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                    {/* 动态光效 */}
                    <div
                      className="absolute -inset-[100px] rotate-45 transform-gpu bg-white/5 opacity-30 blur-3xl transition-opacity duration-700 will-change-transform group-hover:opacity-50"
                      style={{
                        background: `linear-gradient(90deg, transparent 0%, ${project.cardGlow.replace('0.15', '0.4')} 50%, transparent 100%)`,
                      }}
                    ></div>
                  </div>

                  <div className="flex flex-1 flex-col p-6">
                    <p className="mb-6 line-clamp-3 text-sm text-gray-200">{project.description}</p>

                    <div className="mb-6 flex flex-wrap gap-2">
                      {project.tech.map((tech, i) => (
                        <span
                          key={`${tech}-${i}`}
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            techColors[tech] || 'bg-slate-800/50 text-slate-300'
                          }`}
                        >
                          {tech}
                        </span>
                      ))}
                    </div>

                    <div className="mt-auto w-full text-center">
                      <a
                        href={project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`查看 ${project.title} 项目的 GitHub 源代码`}
                        className="group/link relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-md bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-3 font-medium text-white shadow-[0_0_0_3px_rgba(139,92,246,0.1)] transition-all duration-300 will-change-transform before:absolute before:inset-0 before:translate-x-[-100%] before:bg-gradient-to-r before:from-violet-700 before:to-purple-700 before:transition-transform before:duration-500 before:ease-out hover:shadow-[0_0_0_3px_rgba(139,92,246,0.2)] hover:before:translate-x-0 active:scale-[0.98]"
                      >
                        <span className="relative z-10 flex items-center gap-2">
                          <Github className="h-5 w-5 text-xl" />
                          <span>查看项目</span>
                          <ExternalLink className="h-4 w-4 transform text-lg transition-transform duration-300 will-change-transform group-hover/link:translate-x-1" />
                        </span>
                      </a>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* FAQ 常见问题 */}
      <section className="relative overflow-hidden px-6 py-32">
        {/* 增强的背景装饰 */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-indigo-500/3 to-black/0" />

        {/* 复杂的动态背景光效 */}
        <div className="absolute inset-0">
          {/* 主背景光球 */}
          <motion.div
            className="absolute top-1/4 left-1/3 h-[600px] w-[600px] rounded-full bg-gradient-to-r from-indigo-500/8 to-purple-500/8 blur-3xl"
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.3, 0.8, 0.3],
              x: [0, -80, 0],
              y: [0, 50, 0],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="absolute right-1/3 bottom-1/4 h-[500px] w-[500px] rounded-full bg-gradient-to-r from-pink-500/8 to-violet-500/8 blur-3xl"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.7, 0.2],
              x: [0, 60, 0],
              y: [0, -60, 0],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 4,
            }}
          />

          {/* 额外的装饰光点 */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-2 w-2 rounded-full bg-white/20 blur-sm"
              style={{
                left: `${20 + i * 10}%`,
                top: `${30 + i * 8}%`,
              }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 0.8, 0.3],
                y: [0, -20, 0],
              }}
              transition={{
                duration: 3 + i * 0.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.3,
              }}
            />
          ))}
        </div>

        <div className="relative mx-auto max-w-5xl">
          {/* 超级炫酷的标题区域 */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="mb-20 text-center"
          >
            <div className="relative inline-block">
              {/* 多层次标题图标 */}
              <motion.div
                className="mb-8 flex items-center justify-center"
                animate={{
                  y: [0, -8, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <div className="relative">
                  {/* 主图标 */}
                  <motion.div
                    className="relative z-10 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 shadow-2xl"
                    whileHover={{
                      scale: 1.1,
                      rotate: [0, -5, 5, 0],
                    }}
                    transition={{
                      scale: { duration: 0.3 },
                      rotate: { duration: 0.8, ease: 'easeInOut' },
                    }}
                  >
                    <HelpCircle className="h-10 w-10 text-white drop-shadow-lg" />
                  </motion.div>

                  {/* 多层光环 */}
                  <motion.div
                    className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 opacity-40 blur-lg"
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.4, 0.8, 0.4],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                  <motion.div
                    className="absolute inset-0 rounded-3xl bg-gradient-to-br from-pink-500 to-violet-600 opacity-20 blur-2xl"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.2, 0.6, 0.2],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: 1,
                    }}
                  />

                  {/* 旋转装饰元素 */}
                  <motion.div
                    className="absolute -top-3 -right-3"
                    animate={{
                      rotate: [0, 360],
                      scale: [1, 1.3, 1],
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                  >
                    <Sparkles className="h-6 w-6 text-yellow-400 drop-shadow-lg" />
                  </motion.div>

                  <motion.div
                    className="absolute -bottom-2 -left-2"
                    animate={{
                      rotate: [360, 0],
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 6,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                  >
                    <Zap className="h-5 w-5 text-blue-400 drop-shadow-lg" />
                  </motion.div>

                  <motion.div
                    className="absolute top-1/2 -right-8"
                    animate={{
                      y: [0, -10, 0],
                      rotate: [0, 180, 360],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: 0.5,
                    }}
                  >
                    <Target className="h-4 w-4 text-purple-400 drop-shadow-lg" />
                  </motion.div>
                </div>
              </motion.div>

              {/* 增强的主标题 */}
              <motion.div
                className="absolute -inset-8 rounded-[3rem] bg-gradient-to-r from-indigo-600/15 via-purple-600/25 to-pink-600/15 blur-3xl"
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.5, 0.9, 0.5],
                  rotate: [0, 1, -1, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
              <h3 className="relative mb-8 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-5xl font-bold tracking-tight text-transparent md:text-6xl">
                常见问题
              </h3>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="mx-auto max-w-3xl text-xl leading-relaxed text-gray-300"
            >
              快速找到你关心的问题答案，让使用更加顺畅
              <br />
              <span className="text-lg text-gray-400">点击问题查看详细回答</span>
            </motion.p>
          </motion.div>

          {/* 超级增强的FAQ列表 */}
          <motion.div
            variants={faqContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-100px' }}
            className="space-y-6"
          >
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                variants={faqItem}
                onHoverStart={() => setHoveredIndex(index)}
                onHoverEnd={() => setHoveredIndex(null)}
                className="group relative overflow-hidden rounded-3xl transition-all duration-700"
                style={{
                  perspective: '1000px',
                }}
              >
                {/* 多层背景效果 */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-white/5 via-white/8 to-white/5" />

                {/* 动态边框光效 */}
                <motion.div
                  className={`absolute inset-0 rounded-3xl bg-gradient-to-r ${faq.gradient} opacity-0 transition-opacity duration-500`}
                  animate={{
                    opacity: hoveredIndex === index ? 0.15 : 0,
                  }}
                />

                {/* 悬浮时的多层光晕 */}
                <motion.div
                  className="absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-500"
                  style={{
                    boxShadow: `0 0 60px ${faq.shadowColor}, 0 0 100px ${faq.shadowColor}40`,
                  }}
                  animate={{
                    opacity: hoveredIndex === index ? 1 : 0,
                  }}
                />

                {/* 展开状态的额外光效 */}
                {expandedFAQ === index && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 rounded-3xl"
                    style={{
                      boxShadow: `inset 0 0 60px ${faq.shadowColor}30`,
                    }}
                  />
                )}

                <div className="relative overflow-hidden rounded-3xl border border-white/20 backdrop-blur-xl">
                  {/* 问题标题区域 */}
                  <motion.button
                    onClick={() => toggleFAQ(index)}
                    className="group/btn relative flex w-full items-center justify-between overflow-hidden px-8 py-8 text-left transition-all duration-500 hover:bg-white/5"
                    whileHover={{ x: 8 }}
                    whileTap={{ scale: 0.995 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* 按钮背景效果 */}
                    <motion.div
                      className={`absolute inset-0 bg-gradient-to-r ${faq.lightGradient} opacity-0 transition-opacity duration-500`}
                      animate={{
                        opacity: hoveredIndex === index ? 0.05 : 0,
                      }}
                    />

                    <div className="relative z-10 flex flex-1 items-center">
                      {/* 增强的问题图标 */}
                      <motion.div
                        className={`relative h-14 w-14 bg-gradient-to-br ${faq.gradient} mr-6 flex items-center justify-center rounded-2xl shadow-xl`}
                        whileHover={{
                          scale: 1.15,
                          rotate: [0, -8, 8, 0],
                        }}
                        transition={{
                          scale: { duration: 0.3 },
                          rotate: { duration: 0.8, ease: 'easeInOut' },
                        }}
                      >
                        <span className="relative z-10 text-2xl">{faq.icon}</span>

                        {/* 多层图标光环 */}
                        <motion.div
                          className={`absolute inset-0 bg-gradient-to-br ${faq.gradient} rounded-2xl opacity-50 blur-sm transition-all duration-500`}
                          animate={{
                            opacity: hoveredIndex === index ? 0.8 : 0.5,
                            scale: hoveredIndex === index ? 1.1 : 1,
                          }}
                        />
                        <motion.div
                          className={`absolute inset-0 bg-gradient-to-br ${faq.gradient} rounded-2xl opacity-20 blur-lg transition-all duration-500`}
                          animate={{
                            opacity: hoveredIndex === index ? 0.6 : 0.2,
                            scale: hoveredIndex === index ? 1.3 : 1,
                          }}
                        />

                        {/* 图标内部光点 */}
                        <motion.div
                          className="absolute top-1 right-1 h-2 w-2 rounded-full bg-white/60 blur-sm"
                          animate={{
                            scale: [1, 1.5, 1],
                            opacity: [0.6, 1, 0.6],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'easeInOut',
                            delay: index * 0.2,
                          }}
                        />
                      </motion.div>

                      {/* 增强的问题文本 */}
                      <motion.span
                        className={`text-xl font-semibold text-white transition-all duration-500 ${faq.accentColor}`}
                        animate={{
                          x: hoveredIndex === index ? 5 : 0,
                        }}
                      >
                        {faq.question}
                      </motion.span>
                    </div>

                    {/* 增强的展开/收起图标 */}
                    <motion.div
                      animate={{
                        rotate: expandedFAQ === index ? 180 : 0,
                        scale: hoveredIndex === index ? 1.1 : 1,
                      }}
                      transition={{ duration: 0.4, ease: 'easeInOut' }}
                      className="relative ml-6"
                    >
                      <motion.div
                        className={`h-12 w-12 bg-gradient-to-br ${faq.gradient} flex items-center justify-center rounded-xl shadow-lg`}
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.2 }}
                      >
                        {expandedFAQ === index ? (
                          <ChevronUp className="h-6 w-6 text-white" />
                        ) : (
                          <ChevronDown className="h-6 w-6 text-white" />
                        )}
                      </motion.div>
                    </motion.div>
                  </motion.button>

                  {/* 增强的答案内容区域 */}
                  <AnimatePresence>
                    {expandedFAQ === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{
                          height: { duration: 0.5, ease: 'easeInOut' },
                          opacity: { duration: 0.4, delay: 0.1 },
                        }}
                        className="overflow-hidden"
                      >
                        <div className="px-8 pb-8">
                          {/* 多彩分割线 */}
                          <motion.div
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                            className={`h-0.5 w-full bg-gradient-to-r ${faq.gradient} mb-6 rounded-full opacity-40`}
                          />

                          {/* 增强的答案文本 */}
                          <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                            className="relative pl-20"
                          >
                            {/* 答案前的装饰图标 */}
                            <motion.div
                              className={`absolute top-2 left-0 h-8 w-8 bg-gradient-to-br ${faq.gradient} flex items-center justify-center rounded-lg`}
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ delay: 0.4, duration: 0.5, ease: 'easeOut' }}
                            >
                              <span className="text-sm">💡</span>
                            </motion.div>

                            <p className="text-lg leading-relaxed text-gray-300">{faq.answer}</p>
                          </motion.div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* 超级炫酷的底部装饰元素 */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 1.2, duration: 1, ease: 'easeOut' }}
            className="mt-20 flex justify-center"
          >
            <div className="relative">
              {/* 主装饰线 */}
              <div className="h-2 w-32 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500" />

              {/* 多层光晕效果 */}
              <motion.div
                className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 opacity-60 blur-sm"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.6, 0.9, 0.6],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
              <motion.div
                className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-30 blur-lg"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 0.7, 0.3],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 1,
                }}
              />

              {/* 装饰粒子 */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute h-1 w-1 rounded-full bg-white"
                  style={{
                    left: `${10 + i * 15}%`,
                    top: '50%',
                  }}
                  animate={{
                    y: [0, -20, 0],
                    opacity: [0.3, 1, 0.3],
                    scale: [1, 1.5, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-white/10 px-6 py-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center justify-between md:flex-row">
            <div className="mb-4 flex items-center space-x-4 md:mb-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
                <FileText className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-semibold text-white">DocFlow</span>
              <span className="text-sm text-gray-500">© 2025</span>
            </div>

            <div className="flex items-center space-x-6">
              <Link
                href="https://github.com/xun082/DocFlow"
                target="_blank"
                aria-label="访问 DocFlow 的 GitHub 仓库"
                className="text-gray-400 transition-colors duration-300 will-change-transform hover:scale-110 hover:text-white"
              >
                <Github className="h-5 w-5" />
              </Link>
              <span className="text-sm text-gray-500">MIT 开源协议</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Page;
