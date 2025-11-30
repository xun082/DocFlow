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
  metadataBase: new URL('https://demos.tiptap.dev'),
  title: 'DocFlow - 智能文档协作平台',
  description:
    'DocFlow 是一个基于 Tiptap 构建的现代化文档编辑器，支持实时协作、智能AI助手和丰富的内容格式，为团队提供高效的文档创作体验。',
  keywords: ['文档编辑器', '实时协作', '富文本编辑', 'AI助手', '团队协作', 'Markdown'],
  authors: [{ name: 'DocFlow Team' }],
  robots: 'index, follow',
  icons: [{ url: '/favicon.svg' }],
  twitter: {
    card: 'summary_large_image',
    site: '@docflow_app',
    creator: '@docflow_app',
    title: 'DocFlow - 智能文档协作平台',
    description:
      'DocFlow 是一个基于 Tiptap 构建的现代化文档编辑器，支持实时协作、智能AI助手和丰富的内容格式。',
  },
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    title: 'DocFlow - 智能文档协作平台',
    description:
      'DocFlow 是一个基于 Tiptap 构建的现代化文档编辑器，支持实时协作、智能AI助手和丰富的内容格式，为团队提供高效的文档创作体验。',
    siteName: 'DocFlow',
  },
  alternates: {
    canonical: 'https://docflow.app',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className={`h-full ${inter.variable}`} lang="zh-CN" suppressHydrationWarning>
      <head>
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body
        className={`flex flex-col h-full antialiased ${inter.className}`}
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
