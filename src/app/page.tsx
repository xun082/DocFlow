'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
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
    const token = getCookie('auth_token');
    setIsLoggedIn(!!token);

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX - 192);
      mouseY.set(e.clientY - 192);
    };

    window.addEventListener('mousemove', handleMouseMove);

    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 100);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timer);
    };
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

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        duration: 0.4,
        bounce: 0.2,
      },
    },
  };

  // Contact 组件逻辑
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});

  const handleCopyText = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStates((prev) => ({ ...prev, [key]: true }));
      setTimeout(() => {
        setCopiedStates((prev) => ({ ...prev, [key]: false }));
      }, 2000);
    } catch (err) {
      console.error('复制失败', err);
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

  const contactItem = {
    hidden: { opacity: 0, y: 50, scale: 0.8 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        duration: 0.8,
        bounce: 0.4,
      },
    },
  };

  const contactMethods = [
    {
      icon: <MessageCircle className="w-6 h-6" />,
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
          className="w-6 h-6"
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
      icon: <Github className="w-6 h-6" />,
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

  const faqItem = {
    hidden: { opacity: 0, y: 50, scale: 0.9, rotateX: -15 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      rotateX: 0,
      transition: {
        type: 'spring',
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
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* 动态背景 */}
      <div className="absolute inset-0">
        {/* 鼠标跟随光圈 - 使用优化的 motion value */}
        <motion.div
          className="absolute w-96 h-96 bg-gradient-to-r from-violet-500/20 to-purple-500/20 rounded-full blur-3xl pointer-events-none will-change-transform"
          style={{
            x: springX,
            y: springY,
          }}
        />

        {/* 静态装饰光圈 */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl will-change-transform"
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
          className="absolute top-3/4 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl will-change-transform"
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
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div
            className="flex items-center space-x-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/25">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">DocFlow</span>
            <span className="text-xs bg-gradient-to-r from-violet-500 to-purple-500 text-white px-3 py-1 rounded-full font-medium">
              开源
            </span>
          </motion.div>

          <motion.div
            className="flex items-center space-x-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
          >
            <Link href="https://github.com/xun082/DocFlow" target="_blank">
              <div className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors duration-300 px-4 py-2 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10">
                <Github className="h-4 w-4" />
                <span className="text-sm font-medium">GitHub</span>
              </div>
            </Link>
            <Button
              onClick={handleGetStarted}
              className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-lg shadow-violet-500/25 hover:scale-105 transition-all duration-300 px-6 py-2.5"
            >
              {isLoggedIn ? '快速开始' : '免费使用'}
            </Button>
          </motion.div>
        </div>
      </header>

      {/* Hero Section - 主要内容 */}
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
              <span className="text-sm font-medium">基于 Tiptap + Yjs 构建</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-white via-violet-200 to-purple-200 bg-clip-text text-transparent">
                在线协作
              </span>
              <br />
              <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                文档编辑器
              </span>
            </h1>

            <p className="text-lg text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
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
            className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto"
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
                <div className="relative bg-black/80 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden">
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
                  <div className="relative p-6 h-full">
                    {/* 图标区域 */}
                    <div className="flex justify-center mb-4">
                      <motion.div
                        className={`relative w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-500 ${
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
                            className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} rounded-2xl opacity-0 group-hover:opacity-20 blur-md transition-opacity duration-500`}
                          />
                        )}
                      </motion.div>
                    </div>

                    {/* 标题 */}
                    <h3
                      className={`text-xl font-bold text-white mb-3 transition-all duration-300 ${
                        isMounted
                          ? 'group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-white group-hover:to-gray-300'
                          : ''
                      }`}
                    >
                      {feature.title}
                    </h3>

                    {/* 描述 */}
                    <p
                      className={`text-gray-400 text-sm mb-4 leading-relaxed transition-colors duration-300 ${
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
                            className={`w-1.5 h-1.5 bg-gradient-to-r ${feature.gradient} rounded-full mr-3 flex-shrink-0 shadow-sm`}
                          />
                          <span>{detail}</span>
                        </motion.div>
                      ))}
                    </div>

                    {/* 底部装饰线 */}
                    <div
                      className={`absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r ${feature.gradient} transition-opacity duration-500 ${
                        isMounted ? 'opacity-20 group-hover:opacity-40' : 'opacity-10'
                      }`}
                    />
                  </div>

                  {/* 悬浮时的边框光效 - 只在 mounted 后显示 */}
                  {isMounted && (
                    <div
                      className={`absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}
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
      <section className="relative px-6 py-24 overflow-hidden">
        {/* 背景装饰 */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-violet-500/5 to-black/0" />

        {/* 动态背景光效 */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-1/2 left-1/4 w-96 h-96 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 rounded-full blur-3xl"
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
            className="absolute top-1/3 right-1/4 w-80 h-80 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl"
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

        <div className="max-w-7xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="text-center mb-16"
          >
            <div className="relative inline-block">
              {/* 标题背景光效 */}
              <motion.div
                className="absolute -inset-4 bg-gradient-to-r from-violet-600/20 to-purple-600/20 rounded-2xl blur-xl"
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
              <h2 className="relative text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-violet-200 to-purple-200 bg-clip-text text-transparent mb-6">
                加入社区
              </h2>
            </div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed"
            >
              与开发者交流学习，共同构建更好的协作编辑器
            </motion.p>
          </motion.div>

          <motion.div
            variants={contactContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-100px' }}
            className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
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
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-white/10 rounded-3xl" />

                {/* 动态边框光效 */}
                <motion.div
                  className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  animate={{
                    opacity: hoveredIndex === index ? 0.15 : 0,
                  }}
                />

                {/* 卡片背景渐变 */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${method.cardBg} rounded-3xl opacity-50 group-hover:opacity-80 transition-opacity duration-500`}
                />

                {/* 悬浮时的光晕效果 */}
                <motion.div
                  className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    boxShadow: `0 0 60px ${method.glowColor}`,
                  }}
                />

                <div className="relative p-8 backdrop-blur-xl border border-white/20 rounded-3xl h-full flex flex-col">
                  {/* 图标区域 */}
                  <div className="flex justify-center mb-6">
                    <motion.div
                      className={`relative w-16 h-16 bg-gradient-to-br ${method.iconBg} rounded-2xl flex items-center justify-center shadow-2xl`}
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
                        className={`absolute inset-0 bg-gradient-to-br ${method.iconBg} rounded-2xl opacity-50 group-hover:opacity-80 blur-sm transition-opacity duration-500`}
                      />

                      <div className="relative text-white drop-shadow-lg">{method.icon}</div>

                      {/* 图标光点装饰 */}
                      <motion.div
                        className="absolute -top-1 -right-1 w-3 h-3 bg-white/60 rounded-full blur-sm"
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
                  <div className="text-center flex-1 flex flex-col justify-between">
                    <div>
                      <motion.h3
                        className="text-2xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-white group-hover:to-gray-200 transition-all duration-300"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.2 }}
                      >
                        {method.title}
                      </motion.h3>
                      <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300 text-base leading-relaxed mb-6">
                        {method.desc}
                      </p>
                    </div>

                    {/* 按钮区域 */}
                    <div className="mt-auto">
                      {method.isWechat ? (
                        <motion.button
                          onClick={() => handleCopyText(method.text, 'wechat')}
                          className={`relative overflow-hidden px-6 py-3 bg-gradient-to-r ${method.gradient} text-white rounded-xl font-medium text-base shadow-lg transition-all duration-300 group/btn w-full`}
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {/* 按钮背景动画 */}
                          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />

                          <span className="relative flex items-center justify-center gap-2">
                            <span>{method.text}</span>
                            <motion.div
                              animate={copiedStates.wechat ? { rotate: 360 } : {}}
                              transition={{ duration: 0.3 }}
                            >
                              {copiedStates.wechat ? (
                                <Check className="w-4 h-4" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </motion.div>
                          </span>
                        </motion.button>
                      ) : (
                        <motion.a
                          href={method.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`relative overflow-hidden px-6 py-3 bg-gradient-to-r ${method.gradient} text-white rounded-xl font-medium text-base shadow-lg transition-all duration-300 group/btn block`}
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {/* 按钮背景动画 */}
                          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />

                          <span className="relative">{method.text}</span>
                        </motion.a>
                      )}
                    </div>
                  </div>

                  {/* 装饰性光点 */}
                  <div className="absolute top-4 right-4 w-2 h-2 bg-white/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute bottom-4 left-4 w-1 h-1 bg-white/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
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
            className="w-32 h-1 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full mx-auto mt-16 opacity-50"
          />
        </div>
      </section>

      {/* 社区项目展示 */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-violet-500/5 to-black/0" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center space-y-6 mb-16">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="inline-block text-violet-400 font-medium bg-violet-500/10 border border-violet-500/20 px-6 py-2 rounded-full text-sm"
            >
              开源项目
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: 0.1, duration: 0.5, ease: 'easeOut' }}
              className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent"
            >
              更多开源项目
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: 0.2, duration: 0.5, ease: 'easeOut' }}
              className="text-gray-300 max-w-2xl mx-auto text-base sm:text-lg"
            >
              这些项目都是与社区的朋友们一起完成的，期待更多开发者的参与和贡献！
            </motion.p>
          </div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-100px' }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
          >
            {projects.map((project, projectIndex) => {
              const bgElements = getBackgroundElements()[projectIndex];

              return (
                <motion.div
                  key={project.title}
                  variants={item}
                  className="group relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl
                    overflow-hidden hover:border-white/20 transition-all duration-500
                    hover:shadow-[0_0_30px_rgba(139,92,246,0.1)] flex flex-col h-[480px] will-change-transform"
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
                          className="absolute text-white/10 font-mono will-change-transform"
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
                          className="absolute text-white/20 font-bold text-lg will-change-transform"
                          style={element.style}
                        >
                          {element.content}
                        </div>
                      ))}
                    </div>

                    {/* 项目图标和名称区域 */}
                    <div className="absolute inset-0 flex flex-col justify-center items-center p-6 z-10 text-center">
                      {/* 项目图标 */}
                      <div className="text-6xl mb-4">{project.icon}</div>
                      <h3 className="text-3xl font-bold text-white mb-3 drop-shadow-md tracking-tight">
                        {project.title}
                      </h3>
                      <div className="flex items-center gap-6 mb-2">
                        <div className="flex items-center gap-2">
                          <Star className="text-yellow-300 text-xl w-5 h-5" />
                          <span className="text-white font-semibold text-lg">{project.stars}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <GitFork className="text-blue-300 text-xl w-5 h-5" />
                          <span className="text-white font-semibold text-lg">{project.forks}</span>
                        </div>
                      </div>
                    </div>

                    {/* 底部渐变遮罩 */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                    {/* 动态光效 */}
                    <div
                      className="absolute -inset-[100px] bg-white/5 rotate-45 transform-gpu blur-3xl opacity-30 group-hover:opacity-50 transition-opacity duration-700 will-change-transform"
                      style={{
                        background: `linear-gradient(90deg, transparent 0%, ${project.cardGlow.replace('0.15', '0.4')} 50%, transparent 100%)`,
                      }}
                    ></div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col">
                    <p className="text-gray-200 text-sm mb-6 line-clamp-3">{project.description}</p>

                    <div className="flex flex-wrap gap-2 mb-6">
                      {project.tech.map((tech, i) => (
                        <span
                          key={`${tech}-${i}`}
                          className={`px-3 py-1 text-xs rounded-full font-medium ${
                            techColors[tech] || 'bg-slate-800/50 text-slate-300'
                          }`}
                        >
                          {tech}
                        </span>
                      ))}
                    </div>

                    <div className="mt-auto text-center w-full">
                      <a
                        href={project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center gap-2 px-6 py-3
                          relative overflow-hidden group/link
                          bg-gradient-to-r from-violet-600 to-purple-600
                          before:absolute before:inset-0
                          before:bg-gradient-to-r before:from-violet-700 before:to-purple-700
                          before:translate-x-[-100%] before:transition-transform before:duration-500
                          before:ease-out hover:before:translate-x-0
                          text-white font-medium
                          transition-all duration-300
                          rounded-md shadow-[0_0_0_3px_rgba(139,92,246,0.1)]
                          hover:shadow-[0_0_0_3px_rgba(139,92,246,0.2)]
                          active:scale-[0.98] will-change-transform"
                      >
                        <span className="relative z-10 flex items-center gap-2">
                          <Github className="text-xl w-5 h-5" />
                          <span>查看项目</span>
                          <ExternalLink className="text-lg w-4 h-4 transform transition-transform duration-300 group-hover/link:translate-x-1 will-change-transform" />
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
      <section className="relative px-6 py-32 overflow-hidden">
        {/* 增强的背景装饰 */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-indigo-500/3 to-black/0" />

        {/* 复杂的动态背景光效 */}
        <div className="absolute inset-0">
          {/* 主背景光球 */}
          <motion.div
            className="absolute top-1/4 left-1/3 w-[600px] h-[600px] bg-gradient-to-r from-indigo-500/8 to-purple-500/8 rounded-full blur-3xl"
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
            className="absolute bottom-1/4 right-1/3 w-[500px] h-[500px] bg-gradient-to-r from-pink-500/8 to-violet-500/8 rounded-full blur-3xl"
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
              className="absolute w-2 h-2 bg-white/20 rounded-full blur-sm"
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

        <div className="max-w-5xl mx-auto relative">
          {/* 超级炫酷的标题区域 */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="text-center mb-20"
          >
            <div className="relative inline-block">
              {/* 多层次标题图标 */}
              <motion.div
                className="flex items-center justify-center mb-8"
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
                    className="w-20 h-20 bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 rounded-3xl flex items-center justify-center shadow-2xl relative z-10"
                    whileHover={{
                      scale: 1.1,
                      rotate: [0, -5, 5, 0],
                    }}
                    transition={{
                      scale: { duration: 0.3 },
                      rotate: { duration: 0.8, ease: 'easeInOut' },
                    }}
                  >
                    <HelpCircle className="w-10 h-10 text-white drop-shadow-lg" />
                  </motion.div>

                  {/* 多层光环 */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl opacity-40 blur-lg"
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
                    className="absolute inset-0 bg-gradient-to-br from-pink-500 to-violet-600 rounded-3xl opacity-20 blur-2xl"
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
                    <Sparkles className="w-6 h-6 text-yellow-400 drop-shadow-lg" />
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
                    <Zap className="w-5 h-5 text-blue-400 drop-shadow-lg" />
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
                    <Target className="w-4 h-4 text-purple-400 drop-shadow-lg" />
                  </motion.div>
                </div>
              </motion.div>

              {/* 增强的主标题 */}
              <motion.div
                className="absolute -inset-8 bg-gradient-to-r from-indigo-600/15 via-purple-600/25 to-pink-600/15 rounded-[3rem] blur-3xl"
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
              <h2 className="relative text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-indigo-200 via-purple-200 to-pink-200 bg-clip-text text-transparent mb-8 tracking-tight">
                常见问题
              </h2>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
            >
              快速找到你关心的问题答案，让使用更加顺畅
              <br />
              <span className="text-gray-400 text-lg">点击问题查看详细回答</span>
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
                <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-white/8 to-white/5 rounded-3xl" />

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

                <div className="relative backdrop-blur-xl border border-white/20 rounded-3xl overflow-hidden">
                  {/* 问题标题区域 */}
                  <motion.button
                    onClick={() => toggleFAQ(index)}
                    className="w-full px-8 py-8 text-left flex items-center justify-between hover:bg-white/5 transition-all duration-500 group/btn relative overflow-hidden"
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

                    <div className="flex items-center flex-1 relative z-10">
                      {/* 增强的问题图标 */}
                      <motion.div
                        className={`relative w-14 h-14 bg-gradient-to-br ${faq.gradient} rounded-2xl flex items-center justify-center mr-6 shadow-xl`}
                        whileHover={{
                          scale: 1.15,
                          rotate: [0, -8, 8, 0],
                        }}
                        transition={{
                          scale: { duration: 0.3 },
                          rotate: { duration: 0.8, ease: 'easeInOut' },
                        }}
                      >
                        <span className="text-2xl relative z-10">{faq.icon}</span>

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
                          className="absolute top-1 right-1 w-2 h-2 bg-white/60 rounded-full blur-sm"
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
                      className="ml-6 relative"
                    >
                      <motion.div
                        className={`w-12 h-12 bg-gradient-to-br ${faq.gradient} rounded-xl flex items-center justify-center shadow-lg`}
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.2 }}
                      >
                        {expandedFAQ === index ? (
                          <ChevronUp className="w-6 h-6 text-white" />
                        ) : (
                          <ChevronDown className="w-6 h-6 text-white" />
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
                            className={`w-full h-0.5 bg-gradient-to-r ${faq.gradient} opacity-40 mb-6 rounded-full`}
                          />

                          {/* 增强的答案文本 */}
                          <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                            className="pl-20 relative"
                          >
                            {/* 答案前的装饰图标 */}
                            <motion.div
                              className={`absolute left-0 top-2 w-8 h-8 bg-gradient-to-br ${faq.gradient} rounded-lg flex items-center justify-center`}
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ delay: 0.4, duration: 0.5, ease: 'easeOut' }}
                            >
                              <span className="text-sm">💡</span>
                            </motion.div>

                            <p className="text-gray-300 leading-relaxed text-lg">{faq.answer}</p>
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
            className="flex justify-center mt-20"
          >
            <div className="relative">
              {/* 主装饰线 */}
              <div className="w-32 h-2 bg-gradient-to-r from-indigo-500 via-purple-500 via-pink-500 to-cyan-500 rounded-full" />

              {/* 多层光晕效果 */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 via-pink-500 to-cyan-500 rounded-full blur-sm opacity-60"
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
                className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full blur-lg opacity-30"
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
                  className="absolute w-1 h-1 bg-white rounded-full"
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
      <footer className="relative px-6 py-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
                <FileText className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-semibold text-white">DocFlow</span>
              <span className="text-sm text-gray-500">© 2025</span>
            </div>

            <div className="flex items-center space-x-6">
              <Link
                href="https://github.com/xun082/DocFlow"
                target="_blank"
                className="text-gray-400 hover:text-white transition-colors duration-300 hover:scale-110 will-change-transform"
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
