'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FileText, Users, Shield, Zap, Github, Mail, ArrowRight, Star } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { getCookie } from '@/utils/cookie';

const Page = () => {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // 检查用户是否已登录
    const token = getCookie('auth_token');
    setIsLoggedIn(!!token);
  }, []);

  const handleGetStarted = () => {
    if (isLoggedIn) {
      router.push('/dashboard');
    } else {
      router.push('/auth');
    }
  };

  const features = [
    {
      icon: FileText,
      title: '实时协作编辑',
      description: '多人同时编辑文档，实时同步，提升团队协作效率',
    },
    {
      icon: Users,
      title: '团队管理',
      description: '灵活的权限管理，支持团队协作和文档共享',
    },
    {
      icon: Shield,
      title: '安全可靠',
      description: '企业级安全保障，数据加密存储，隐私保护',
    },
    {
      icon: Zap,
      title: '高性能',
      description: '毫秒级响应，流畅的编辑体验，支持大型文档',
    },
  ];

  const stats = [
    { number: '1000+', label: '活跃用户' },
    { number: '50K+', label: '文档创建' },
    { number: '99.9%', label: '在线时间' },
    { number: '24/7', label: '技术支持' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="relative z-10 px-4 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-800">文档系统</span>
          </div>

          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              <Button
                onClick={() => router.push('/dashboard')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                进入控制台
              </Button>
            ) : (
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => router.push('/auth')}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  登录
                </Button>
                <Button
                  onClick={() => router.push('/auth')}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  开始使用
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-4 py-20">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              新一代
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                协作文档
              </span>
              平台
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              实时协作编辑，智能文档管理，让团队协作更高效。支持多人同时编辑，版本控制，权限管理。
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button
              onClick={handleGetStarted}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 text-lg rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              {isLoggedIn ? '进入控制台' : '立即开始'}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>

            <Link
              href="/docs/1"
              className="inline-flex items-center px-8 py-4 text-lg font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-300"
            >
              查看演示
              <FileText className="ml-2 h-5 w-5" />
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-20 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">为什么选择我们？</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              我们提供最先进的协作编辑技术，让您的团队工作更加高效
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Login Options Section */}
      <section className="px-4 py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">开始您的协作之旅</h2>
          <p className="text-xl text-gray-600 mb-12">支持多种登录方式，快速开始使用</p>

          <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            <Link
              href="/auth"
              className="group p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              <Github className="h-12 w-12 text-gray-800 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">GitHub 登录</h3>
              <p className="text-gray-600">使用您的 GitHub 账号快速登录</p>
            </Link>

            <Link
              href="/auth/email"
              className="group p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              <Mail className="h-12 w-12 text-blue-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">邮箱登录</h3>
              <p className="text-gray-600">使用邮箱验证码安全登录</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <FileText className="h-6 w-6 text-blue-400" />
              <span className="text-xl font-semibold">文档系统</span>
            </div>

            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <span>© {new Date().getFullYear()} 文档系统. 保留所有权利.</span>
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-yellow-400" />
                <span>企业级安全保障</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Page;
