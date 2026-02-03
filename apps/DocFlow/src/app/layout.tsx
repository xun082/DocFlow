import type { Metadata, Viewport } from 'next';
import { Toaster } from 'sonner';

import '@/styles/index.css';

import { inter } from './fonts';

import { QueryProvider } from '@/providers/QueryProvider';
import { AuthProvider } from '@/providers/AuthProvider';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://www.codecrack.cn'),
  title: 'DocFlow',
  description:
    'DocFlow 是一个基于 Tiptap 构建的现代化文档编辑器，支持实时协作、智能AI助手和丰富的内容格式，为团队提供高效的文档创作体验。',
  keywords: [
    // 核心功能关键词
    '协同',
    '协同编辑',
    '文档编辑器',
    '实时协作',
    '富文本编辑',
    'AI助手',
    '团队协作',
    'Markdown',
    'Tiptap',
    '在线编辑',
    // 高搜索量关键词（来自关键词研究）
    '富文本',
    '文本编辑',
    '好用的文本编辑器',
    '富文本编辑器',
    '富文本编辑器在线',
    '在线文本编辑器',
    '富文本框',
    'editor',
    '文本编辑器',
    '在线编辑器',
    'RTF文件',
    '富文本是什么意思',
    // 技术相关
    'React富文本编辑器',
    'Next.js编辑器',
    'Yjs协作',
    'CRDT同步',
    // 应用场景
    '在线文档编辑器',
    '协作文档编辑器',
    '团队文档编辑器',
    '企业文档编辑器',
  ],
  authors: [{ name: 'DocFlow Team' }],
  creator: 'DocFlow Team',
  publisher: 'DocFlow',
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
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  },
  manifest: '/site.webmanifest',
  twitter: {
    card: 'summary_large_image',
    site: '@docflow_app',
    creator: '@docflow_app',
    title: 'DocFlow',
    description:
      'DocFlow 是一个基于 Tiptap 构建的现代化文档编辑器，支持实时协作、智能AI助手和丰富的内容格式。',
  },
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: 'https://www.codecrack.cn',
    title: 'DocFlow',
    description:
      'DocFlow 是一个基于 Tiptap 构建的现代化文档编辑器，支持实时协作、智能AI助手和丰富的内容格式，为团队提供高效的文档创作体验。',
    siteName: 'DocFlow',
  },
  alternates: {
    canonical: 'https://www.codecrack.cn',
  },
  verification: {
    google: 'BT9sufowSh1mhZnmenGdqPdVxSLdMrQ4Il6sQH62qG0',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className={`h-full ${inter.variable}`} lang="zh-CN" suppressHydrationWarning>
      <head>
        <meta
          name="google-site-verification"
          content="BT9sufowSh1mhZnmenGdqPdVxSLdMrQ4Il6sQH62qG0"
        />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="theme-color" content="#ffffff" />
        <link rel="preconnect" href="https://www.codecrack.cn" />
        <link rel="dns-prefetch" href="https://www.codecrack.cn" />
      </head>
      <body
        className="flex flex-col h-full antialiased"
        style={inter.style}
        suppressHydrationWarning
      >
        <QueryProvider>
          <AuthProvider>
            <main className="h-full">{children}</main>
            <Toaster
              position="bottom-right"
              toastOptions={{
                duration: 4000,
                style: {
                  fontFamily:
                    'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans SC", "Helvetica Neue", Arial, sans-serif',
                },
              }}
            />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
