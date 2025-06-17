'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Shield,
  Github,
  Mail,
  ArrowRight,
  Star,
  Code,
  Heart,
  BookOpen,
  GitFork,
  Edit3,
  Globe2,
  Layers,
  Eye,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { getCookie } from '@/utils/cookie';

interface GitHubStats {
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  subscribers_count: number;
}

const Page = () => {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [githubStats, setGithubStats] = useState<GitHubStats>({
    stargazers_count: 88,
    forks_count: 16,
    watchers_count: 1,
    subscribers_count: 1,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 检查用户是否已登录
    const token = getCookie('auth_token');
    setIsLoggedIn(!!token);

    // 获取GitHub数据
    fetchGitHubStats();
  }, []);

  const fetchGitHubStats = async () => {
    try {
      const response = await fetch('https://api.github.com/repos/xun082/DocFlow');

      if (response.ok) {
        const data = await response.json();
        setGithubStats({
          stargazers_count: data.stargazers_count,
          forks_count: data.forks_count,
          watchers_count: data.watchers_count,
          subscribers_count: data.subscribers_count,
        });
      }
    } catch (error) {
      console.error('Failed to fetch GitHub stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
      title: '实时协作编辑',
      description: '基于 Tiptap 的富文本编辑器，支持多人实时协作，CRDT 算法保证数据一致性',
      highlight: 'Tiptap + Yjs',
      gradient: 'from-purple-500 via-pink-500 to-red-500',
      glowColor: 'shadow-purple-500/25',
    },
    {
      icon: Layers,
      title: 'CRDT 数据同步',
      description: '使用 Yjs 和 @hocuspocus 实现冲突自由的实时数据复制技术',
      highlight: 'Yjs CRDT',
      gradient: 'from-green-500 via-emerald-500 to-teal-500',
      glowColor: 'shadow-green-500/25',
    },
    {
      icon: Code,
      title: '现代技术栈',
      description: 'Next.js 19 + TypeScript + Tailwind CSS，组件化设计，易于扩展',
      highlight: 'React 19',
      gradient: 'from-blue-500 via-cyan-500 to-indigo-500',
      glowColor: 'shadow-blue-500/25',
    },
    {
      icon: Globe2,
      title: '插件生态',
      description: '支持插件扩展、主题切换，WebSocket 实时通信，PWA 支持',
      highlight: '可扩展',
      gradient: 'from-orange-500 via-amber-500 to-yellow-500',
      glowColor: 'shadow-orange-500/25',
    },
  ];

  const techStack = [
    {
      name: 'Tiptap',
      desc: '富文本编辑器，基于 ProseMirror',
      color: 'from-purple-600 to-indigo-600',
      icon: '✏️',
      animation: 'animate-pulse',
    },
    {
      name: 'Yjs',
      desc: '协同编辑核心，CRDT 数据结构',
      color: 'from-green-600 to-teal-600',
      icon: '🔄',
      animation: 'animate-spin',
    },
    {
      name: '@hocuspocus',
      desc: 'Yjs 的服务端与客户端 Provider',
      color: 'from-blue-600 to-cyan-600',
      icon: '🌐',
      animation: 'animate-bounce',
    },
    {
      name: 'Next.js 19',
      desc: 'UI 框架，支持 Suspense 等新特性',
      color: 'from-gray-800 to-gray-900',
      icon: '⚡',
      animation: 'animate-pulse',
    },
    {
      name: 'Socket.io',
      desc: '协同通信通道',
      color: 'from-red-600 to-orange-600',
      icon: '📡',
      animation: 'animate-ping',
    },
    {
      name: 'Tailwind CSS',
      desc: '原子化 CSS，集成动画、表单样式等',
      color: 'from-cyan-600 to-blue-600',
      icon: '🎨',
      animation: 'animate-pulse',
    },
  ];

  const stats = [
    {
      number: isLoading ? '...' : githubStats.stargazers_count.toString(),
      label: 'GitHub Stars',
      icon: Star,
      gradient: 'from-yellow-500 to-orange-500',
      animation: 'group-hover:animate-spin',
    },
    {
      number: isLoading ? '...' : githubStats.forks_count.toString(),
      label: 'Forks',
      icon: GitFork,
      gradient: 'from-green-500 to-emerald-500',
      animation: 'group-hover:animate-bounce',
    },
    {
      number: isLoading ? '...' : githubStats.watchers_count.toString(),
      label: 'Watchers',
      icon: Eye,
      gradient: 'from-blue-500 to-indigo-500',
      animation: 'group-hover:animate-pulse',
    },
    {
      number: 'MIT',
      label: '开源协议',
      icon: Shield,
      gradient: 'from-purple-500 to-pink-500',
      animation: 'group-hover:animate-pulse',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* 动态背景 */}
      <div className="absolute inset-0">
        {/* 渐变光圈 */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>

        {/* 星空效果 */}
        <div className="stars absolute inset-0">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute bg-white rounded-full animate-twinkle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 3 + 1}px`,
                height: `${Math.random() * 3 + 1}px`,
                animationDelay: `${Math.random() * 3}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Header */}
      <header className="relative z-10 px-4 py-6 bg-black/20 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/50 hover:shadow-blue-500/75 transition-all duration-300 hover:scale-110">
              <FileText className="h-7 w-7 text-white" />
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-3xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                DocFlow
              </span>
              <span className="text-xs bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full font-medium shadow-lg shadow-green-500/25 animate-pulse">
                开源
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              href="https://github.com/xun082/DocFlow"
              target="_blank"
              className="flex items-center space-x-2 text-gray-300 hover:text-yellow-400 transition-all duration-300 group bg-white/5 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:shadow-lg hover:shadow-yellow-500/25"
            >
              <Star className="h-4 w-4 group-hover:animate-spin transition-all duration-300" />
              <span className="font-medium">
                {isLoading ? '...' : githubStats.stargazers_count}
              </span>
            </Link>
            <Link
              href="https://github.com/xun082/DocFlow"
              target="_blank"
              className="flex items-center space-x-2 text-gray-300 hover:text-green-400 transition-all duration-300 group bg-white/5 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:shadow-lg hover:shadow-green-500/25"
            >
              <GitFork className="h-4 w-4 group-hover:animate-bounce transition-all duration-300" />
              <span className="font-medium">{isLoading ? '...' : githubStats.forks_count}</span>
            </Link>
            {isLoggedIn ? (
              <Button
                onClick={() => router.push('/dashboard')}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-xl shadow-blue-500/25 hover:shadow-blue-500/50 hover:scale-105 transition-all duration-300"
              >
                进入控制台
              </Button>
            ) : (
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => router.push('/auth')}
                  className="border-white/20 text-gray-300 hover:bg-white/10 hover:border-white/30 hover:text-white backdrop-blur-sm transition-all duration-300"
                >
                  登录
                </Button>
                <Button
                  onClick={() => router.push('/auth')}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-xl shadow-purple-500/25 hover:shadow-purple-500/50 hover:scale-105 transition-all duration-300"
                >
                  开始使用
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-4 py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="mb-12">
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center space-x-3 bg-gradient-to-r from-green-500/20 to-blue-500/20 backdrop-blur-xl text-white px-6 py-3 rounded-full border border-white/20 shadow-2xl shadow-green-500/10 hover:scale-105 transition-all duration-500">
                <span className="text-2xl animate-bounce">🚀</span>
                <span className="font-semibold">基于 Tiptap + Yjs 构建</span>
                <span className="text-green-400">•</span>
                <span className="font-semibold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  开源免费
                </span>
              </div>
            </div>
            <h1 className="text-6xl md:text-8xl font-bold mb-8 leading-tight">
              <span className="bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent drop-shadow-2xl">
                现代化
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-pulse">
                协作文档编辑器
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
              基于 <span className="font-bold text-purple-400 animate-pulse">Tiptap</span> 和{' '}
              <span className="font-bold text-green-400 animate-pulse">Yjs</span>{' '}
              构建的现代化协同文档编辑器
              <br />
              <span className="text-lg text-gray-400 bg-gradient-to-r from-gray-400 to-gray-300 bg-clip-text text-transparent">
                集成丰富的编辑能力与多人实时协作功能，支持插件扩展、主题切换与持久化存储
              </span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-20">
            <Button
              onClick={handleGetStarted}
              size="lg"
              className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-700 hover:via-pink-700 hover:to-red-700 text-white px-12 py-6 text-xl rounded-2xl shadow-2xl shadow-purple-500/25 hover:shadow-purple-500/50 transform hover:scale-110 transition-all duration-500 hover:-translate-y-1 font-bold"
            >
              {isLoggedIn ? '进入控制台' : '立即体验'}
              <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform duration-300" />
            </Button>

            <Link
              href="https://github.com/xun082/DocFlow"
              target="_blank"
              className="inline-flex items-center px-12 py-6 text-xl font-bold text-gray-300 bg-white/5 backdrop-blur-xl border-2 border-white/20 rounded-2xl hover:bg-white/10 hover:border-white/30 hover:text-white hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-500 hover:scale-105 hover:-translate-y-1"
            >
              <Github className="mr-3 h-6 w-6" />
              查看源码
            </Link>

            <Link
              href="https://delicate-rugelach-ae7768.netlify.app/"
              target="_blank"
              className="inline-flex items-center px-12 py-6 text-xl font-bold text-emerald-300 bg-gradient-to-r from-emerald-500/10 to-green-500/10 backdrop-blur-xl border-2 border-emerald-500/30 rounded-2xl hover:from-emerald-500/20 hover:to-green-500/20 hover:border-emerald-500/50 hover:text-emerald-100 hover:shadow-2xl hover:shadow-emerald-500/25 transition-all duration-500 hover:scale-105 hover:-translate-y-1"
            >
              <BookOpen className="mr-3 h-6 w-6" />
              在线演示
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group cursor-pointer">
                <div
                  className={`w-20 h-20 bg-gradient-to-br ${stat.gradient} rounded-3xl shadow-2xl mx-auto mb-6 flex items-center justify-center group-hover:scale-125 transition-all duration-500 hover:rotate-12`}
                >
                  <stat.icon className={`h-8 w-8 text-white ${stat.animation}`} />
                </div>
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-3 group-hover:scale-110 transition-all duration-300">
                  {stat.number}
                </div>
                <div className="text-gray-400 font-medium group-hover:text-white transition-colors duration-300">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-24 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent mb-8">
              核心特性
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              基于现代前端技术栈构建，提供卓越的编辑体验和协作能力
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`group p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 hover:border-white/20 hover:shadow-2xl ${feature.glowColor} transition-all duration-500 hover:-translate-y-4 hover:scale-105 cursor-pointer`}
              >
                <div
                  className={`w-18 h-18 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-lg`}
                >
                  <feature.icon className="h-9 w-9 text-white" />
                </div>
                <div className="mb-4">
                  <span
                    className={`text-xs bg-gradient-to-r ${feature.gradient} text-white px-3 py-1 rounded-full font-bold shadow-lg`}
                  >
                    {feature.highlight}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-4 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 group-hover:bg-clip-text transition-all duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="px-4 py-24 bg-gradient-to-br from-black/30 to-purple-900/30">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent mb-8">
            技术栈
          </h2>
          <p className="text-xl text-gray-300 mb-20 max-w-3xl mx-auto">
            使用最新的前端技术构建，专注于协作编辑的核心能力
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {techStack.map((tech, index) => (
              <div
                key={index}
                className="group p-8 bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl hover:shadow-2xl hover:bg-white/10 transition-all duration-500 hover:-translate-y-4 hover:scale-105 border border-white/10 hover:border-white/20 cursor-pointer"
              >
                <div
                  className={`w-20 h-20 bg-gradient-to-br ${tech.color} rounded-3xl flex items-center justify-center text-3xl mb-8 mx-auto group-hover:scale-125 transition-all duration-500 shadow-2xl group-hover:rotate-12`}
                >
                  <span className={tech.animation}>{tech.icon}</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                  {tech.name}
                </h3>
                <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                  {tech.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className="px-4 py-24 bg-black/20 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent mb-8">
            加入开源社区
          </h2>
          <p className="text-xl text-gray-300 mb-20">
            欢迎贡献代码、报告问题、提出建议，让我们一起打造更好的协作编辑器
          </p>

          <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto mb-20">
            <Link
              href="/auth"
              className="group p-12 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 backdrop-blur-xl rounded-3xl shadow-2xl hover:shadow-2xl hover:from-blue-500/20 hover:to-indigo-500/20 transition-all duration-500 border border-blue-500/20 hover:border-blue-500/40 hover:scale-105 hover:-translate-y-2"
            >
              <Github className="h-20 w-20 text-gray-300 group-hover:text-white mx-auto mb-8 group-hover:scale-125 group-hover:rotate-12 transition-all duration-500" />
              <h3 className="text-2xl font-bold text-white mb-4">GitHub 登录</h3>
              <p className="text-gray-300 group-hover:text-gray-200 transition-colors duration-300">
                使用您的 GitHub 账号快速开始体验
              </p>
            </Link>

            <Link
              href="/auth/email"
              className="group p-12 bg-gradient-to-br from-emerald-500/10 to-green-500/10 backdrop-blur-xl rounded-3xl shadow-2xl hover:shadow-2xl hover:from-emerald-500/20 hover:to-green-500/20 transition-all duration-500 border border-emerald-500/20 hover:border-emerald-500/40 hover:scale-105 hover:-translate-y-2"
            >
              <Mail className="h-20 w-20 text-emerald-400 group-hover:text-emerald-300 mx-auto mb-8 group-hover:scale-125 group-hover:rotate-12 transition-all duration-500" />
              <h3 className="text-2xl font-bold text-white mb-4">邮箱登录</h3>
              <p className="text-gray-300 group-hover:text-gray-200 transition-colors duration-300">
                使用邮箱验证码安全快速登录
              </p>
            </Link>
          </div>

          <div className="p-10 bg-gradient-to-r from-green-500/10 via-blue-500/10 to-purple-500/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl hover:shadow-2xl hover:scale-105 transition-all duration-500">
            <h3 className="text-3xl font-bold text-white mb-8 flex items-center justify-center">
              <Heart className="h-8 w-8 text-red-400 mr-4 animate-pulse" />
              如何参与贡献？
            </h3>
            <div className="grid md:grid-cols-3 gap-6 text-gray-300">
              {[
                { emoji: '🐛', text: '报告 Bug' },
                { emoji: '💡', text: '提出新功能' },
                { emoji: '🔧', text: '提交代码' },
                { emoji: '📖', text: '改进文档' },
                { emoji: '🎨', text: '设计改进' },
                { emoji: '🧪', text: '编写测试' },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-4 p-6 bg-white/5 backdrop-blur-sm rounded-2xl hover:bg-white/10 hover:scale-105 transition-all duration-300 cursor-pointer group"
                >
                  <span className="text-3xl group-hover:scale-125 transition-transform duration-300">
                    {item.emoji}
                  </span>
                  <span className="font-medium group-hover:text-white transition-colors duration-300">
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/40 backdrop-blur-xl text-white px-4 py-20 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/50">
                  <FileText className="h-7 w-7 text-white" />
                </div>
                <span className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  DocFlow
                </span>
              </div>
              <p className="text-gray-300 leading-relaxed mb-8 max-w-md text-lg">
                基于 Tiptap 和 Yjs 构建的现代化协同文档编辑器，
                <br />
                让团队协作更加高效透明。完全开源，欢迎贡献！
              </p>
              <div className="flex space-x-6">
                <Link
                  href="https://github.com/xun082/DocFlow"
                  target="_blank"
                  className="flex items-center space-x-3 text-gray-400 hover:text-white transition-all duration-300 group bg-white/5 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:shadow-lg"
                >
                  <Github className="h-5 w-5 group-hover:scale-125 transition-transform duration-300" />
                  <span>GitHub</span>
                </Link>
                <Link
                  href="https://delicate-rugelach-ae7768.netlify.app/"
                  target="_blank"
                  className="flex items-center space-x-3 text-gray-400 hover:text-white transition-all duration-300 group bg-white/5 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:shadow-lg"
                >
                  <Globe2 className="h-5 w-5 group-hover:scale-125 transition-transform duration-300" />
                  <span>在线演示</span>
                </Link>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-8 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                快速链接
              </h3>
              <div className="space-y-4 text-sm">
                <Link
                  href="https://github.com/xun082/DocFlow"
                  target="_blank"
                  className="block text-gray-400 hover:text-white transition-colors duration-300 hover:translate-x-2"
                >
                  GitHub 仓库
                </Link>
                <Link
                  href="https://github.com/xun082/DocFlow/issues"
                  target="_blank"
                  className="block text-gray-400 hover:text-white transition-colors duration-300 hover:translate-x-2"
                >
                  问题反馈
                </Link>
                <Link
                  href="https://github.com/xun082/DocFlow/blob/main/CONTRIBUTING.md"
                  target="_blank"
                  className="block text-gray-400 hover:text-white transition-colors duration-300 hover:translate-x-2"
                >
                  贡献指南
                </Link>
                <Link
                  href="https://github.com/xun082/DocFlow/wiki"
                  target="_blank"
                  className="block text-gray-400 hover:text-white transition-colors duration-300 hover:translate-x-2"
                >
                  开发文档
                </Link>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-8 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                技术栈
              </h3>
              <div className="space-y-3 text-sm text-gray-400">
                <div className="hover:text-white transition-colors duration-300 cursor-pointer">
                  Tiptap + ProseMirror
                </div>
                <div className="hover:text-white transition-colors duration-300 cursor-pointer">
                  Yjs CRDT
                </div>
                <div className="hover:text-white transition-colors duration-300 cursor-pointer">
                  Next.js 19
                </div>
                <div className="hover:text-white transition-colors duration-300 cursor-pointer">
                  TypeScript
                </div>
                <div className="hover:text-white transition-colors duration-300 cursor-pointer">
                  Tailwind CSS
                </div>
                <div className="hover:text-white transition-colors duration-300 cursor-pointer">
                  Socket.io
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-white/20 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex items-center space-x-2 mb-4 md:mb-0">
                <span className="text-sm text-gray-400">
                  © {new Date().getFullYear()} DocFlow. 基于 MIT 许可证开源.
                </span>
              </div>

              <div className="flex items-center space-x-8 text-sm text-gray-400">
                <div className="flex items-center space-x-2 hover:text-red-400 transition-colors duration-300 cursor-pointer">
                  <Heart className="h-4 w-4 text-red-400 animate-pulse" />
                  <span>开源社区驱动</span>
                </div>
                <div className="flex items-center space-x-2 hover:text-green-400 transition-colors duration-300 cursor-pointer">
                  <Shield className="h-4 w-4 text-green-400" />
                  <span>代码透明</span>
                </div>
                <div className="flex items-center space-x-2 hover:text-yellow-400 transition-colors duration-300 cursor-pointer">
                  <Star className="h-4 w-4 text-yellow-400 animate-pulse" />
                  <span>{isLoading ? '...' : githubStats.stargazers_count} Stars</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes twinkle {
          0%,
          100% {
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
        }
        .animate-twinkle {
          animation: twinkle 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default Page;
