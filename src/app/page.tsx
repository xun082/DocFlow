'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useMotionValue, useSpring } from 'framer-motion';

import useAnalytics from '@/hooks/useAnalysis';
import { springConfig } from '@/utils';
import Header from '@/components/homepage/Header';
import Hero from '@/components/homepage/Hero';

// 动态导入优化 - 设置更高优先级的 loading 组件
const Features = dynamic(() => import('@/components/homepage/Features'), {
  loading: () => <div className="min-h-screen" />,
  ssr: true,
});

const Contact = dynamic(() => import('@/components/homepage/Contact'), {
  loading: () => <div className="min-h-[400px]" />,
  ssr: true,
});

const Projects = dynamic(() => import('@/components/homepage/Projects'), {
  loading: () => <div className="min-h-screen" />,
  ssr: true,
});

const Footer = dynamic(() => import('@/components/homepage/Footer'), {
  loading: () => <div className="min-h-[200px]" />,
  ssr: true,
});

const BackgroundEffects = dynamic(() => import('@/components/homepage/BackgroundEffects'), {
  loading: () => null,
  ssr: false,
});

const Page = () => {
  useAnalytics();

  const [isMounted, setIsMounted] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  // 分离认证检查和OAuth回调处理
  useEffect(() => {
    setIsMounted(true);

    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');

    if (code && state) {
      const callbackUrl = `/auth/callback${window.location.search}`;
      window.location.replace(callbackUrl);
    }
  }, []);

  // 鼠标移动效果 - 独立effect，避免不必要的重渲染
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX - 192);
      mouseY.set(e.clientY - 192);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [mouseX, mouseY]);

  return (
    <>
      {/* 结构化数据 - 提升 SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'DocFlow',
            alternateName: [
              'DocFlow 富文本编辑器',
              'DocFlow 在线文本编辑器',
              'DocFlow 协作文档编辑器',
            ],
            description:
              'DocFlow 是一个基于 Tiptap 构建的现代化富文本编辑器，支持实时协作、智能AI助手和丰富的内容格式。好用的在线文本编辑器，支持多人协同编辑、Markdown、RTF文件等多种格式。',
            url: 'https://www.codecrack.cn',
            applicationCategory: 'ProductivityApplication',
            operatingSystem: 'Web Browser',
            browserRequirements: 'Requires JavaScript. Requires HTML5.',
            softwareVersion: '1.0',
            featureList: [
              '富文本编辑',
              '实时协作',
              'AI助手',
              'Markdown支持',
              '多人协同编辑',
              '在线文档编辑',
              '文本编辑器',
            ],
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'CNY',
            },
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: '4.8',
              ratingCount: '1250',
            },
            keywords: [
              '富文本编辑器',
              '在线文本编辑器',
              '文本编辑器',
              '协作文档编辑器',
              '富文本',
              '文本编辑',
              '好用的文本编辑器',
              '富文本编辑器在线',
              '在线编辑器',
            ],
          }),
        }}
      />

      {/* SEO 友好的隐藏文本 - 帮助搜索引擎理解页面内容 */}
      <div className="sr-only" aria-hidden="true">
        <h1>DocFlow - 好用的富文本编辑器</h1>
        <p>
          DocFlow 是一个功能强大的富文本编辑器，支持在线文本编辑、多人协同编辑和实时协作。
          作为一款好用的文本编辑器，DocFlow 提供了丰富的富文本编辑功能，支持
          Markdown、RTF文件等多种格式。 无论是个人使用还是团队协作，DocFlow
          都是您理想的在线文本编辑器和协作文档编辑器选择。
        </p>
        <p>
          富文本编辑器在线使用，无需安装即可开始编辑。支持富文本编辑、文本编辑、在线编辑器等多种编辑模式。
          DocFlow 富文本编辑器基于 Tiptap 构建，提供流畅的编辑体验和强大的协作功能。
        </p>
      </div>

      <div className="min-h-screen bg-black relative overflow-hidden">
        {/* 动态背景 */}
        <BackgroundEffects springX={springX} springY={springY} />

        {/* Header */}
        <Header />

        {/* Hero Section - 主要内容 */}
        <Hero isMounted={isMounted} />

        {/* Features Section - 功能介绍 */}
        <Features isMounted={isMounted} />

        {/* Contact 组件 - 联系我们部分 */}
        <Contact />

        {/* 社区项目展示 */}
        <Projects isMounted={isMounted} />

        {/* Footer */}
        <Footer />
      </div>
    </>
  );
};

export default Page;
