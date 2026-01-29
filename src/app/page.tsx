import React, { Suspense } from 'react';
import type { Metadata } from 'next';

import { AnalyticsTracker } from '@/components/homepage/AnalyticsTracker';
import { OAuthCallback } from '@/components/homepage/OAuthCallback';
import Header from '@/components/homepage/Header';
import Hero from '@/components/homepage/Hero';
import Features from '@/components/homepage/Features';
import Contact from '@/components/homepage/Contact';
import Footer from '@/components/homepage/Footer';

// SEO Metadata 配置
export const metadata: Metadata = {
  title: 'DocFlow',
  description:
    'DocFlow 是一个基于 Tiptap 构建的现代化富文本编辑器，支持实时协作、智能AI助手和丰富的内容格式。好用的在线文本编辑器，支持多人协同编辑、Markdown、RTF文件等多种格式。',
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
    'AI 写作',
    'Tiptap',
    'Yjs',
    '实时协作',
  ],
  authors: [{ name: 'DocFlow Team' }],
  creator: 'DocFlow',
  publisher: 'DocFlow',
  applicationName: 'DocFlow',
  category: 'productivity',
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: 'https://www.codecrack.cn',
    siteName: 'DocFlow',
    title: 'DocFlow - AI 智能写作平台',
    description:
      'DocFlow 是一个基于 Tiptap 构建的现代化富文本编辑器，支持实时协作、智能AI助手和丰富的内容格式。',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'DocFlow - AI 智能写作平台',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DocFlow - AI 智能写作平台',
    description:
      'DocFlow 是一个基于 Tiptap 构建的现代化富文本编辑器，支持实时协作、智能AI助手和丰富的内容格式。',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://www.codecrack.cn',
  },
};

// 结构化数据 - 提升 SEO
function StructuredData() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'DocFlow',
    alternateName: ['DocFlow 富文本编辑器', 'DocFlow 在线文本编辑器', 'DocFlow 协作文档编辑器'],
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
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

// 页面组件 - 纯服务端组件
export default function Page() {
  return (
    <>
      {/* 结构化数据 - 提升 SEO */}
      <StructuredData />

      {/* 客户端组件 - 使用 Suspense 包裹 */}
      <Suspense fallback={null}>
        <AnalyticsTracker />
        <OAuthCallback />
      </Suspense>

      {/* SEO 友好的隐藏文本 */}
      <div className="sr-only" aria-hidden="true">
        <h1>DocFlow - 好用的富文本编辑器</h1>
        <p>
          DocFlow 是一个功能强大的富文本编辑器，支持在线文本编辑、多人协同编辑和实时协作。
          作为一款好用的文本编辑器，DocFlow 提供了丰富的富文本编辑功能，支持
          Markdown、RTF文件等多种格式。 无论是个人使用还是团队协作，DocFlow
          都是您理想的在线文本编辑器和协作文档编辑器选择。
        </p>
      </div>

      <div className="min-h-screen bg-white relative overflow-hidden">
        {/* 装饰性渐变背景 - 纯 CSS */}
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-200/30 rounded-full blur-3xl animate-float" />
          <div className="absolute top-20 right-1/4 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl animate-float [animation-delay:2s]" />
          <div className="absolute top-1/2 left-1/3 w-96 h-96 bg-pink-200/30 rounded-full blur-3xl animate-float [animation-delay:4s]" />
          <div className="absolute bottom-20 right-1/3 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl animate-float [animation-delay:6s]" />
        </div>

        {/* Header - 纯服务端组件 */}
        <Header />

        {/* Hero Section - 服务端组件（交互部分用 Suspense） */}
        <Hero />

        {/* Features Section - 纯服务端组件 */}
        <Features />

        {/* Contact 组件 - 联系我们部分 */}
        <Suspense fallback={<div className="min-h-[400px] bg-gray-50" />}>
          <Contact />
        </Suspense>

        {/* Footer */}
        <Footer />
      </div>
    </>
  );
}
