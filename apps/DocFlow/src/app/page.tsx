import type { Metadata } from 'next';

import {
  Header,
  Hero,
  Features,
  Contact,
  Footer,
  SITE_CONFIG,
  STRUCTURED_DATA,
} from './_components/homepage';

export const metadata: Metadata = {
  title: 'DocFlow - AI 智能写作平台 | 基于 Tiptap+Yjs 的实时协作编辑器',
  description: SITE_CONFIG.description,
  keywords: [
    '富文本编辑器',
    '在线文本编辑器',
    '协作文档编辑器',
    'AI 写作',
    'AI 续写',
    'Tiptap',
    'Yjs',
    '实时协作',
    '多人协作编辑',
    'Markdown 编辑器',
    'RAG 知识库',
    'AI 播客生成',
  ],
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: SITE_CONFIG.url,
    siteName: SITE_CONFIG.name,
    title: `${SITE_CONFIG.name} - ${SITE_CONFIG.tagline}`,
    description: SITE_CONFIG.description,
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: SITE_CONFIG.name }],
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
  alternates: { canonical: SITE_CONFIG.url },
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(STRUCTURED_DATA),
        }}
      />

      <style
        dangerouslySetInnerHTML={{
          __html: `*{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}.fade-in{animation:f .6s ease-out forwards}@keyframes f{to{opacity:1}}.fade-in{opacity:0}.fade-in-1{animation-delay:.1s}.fade-in-2{animation-delay:.2s}.fade-in-3{animation-delay:.3s}.slide-in{animation:s .25s cubic-bezier(.4,0,.2,1)}@keyframes s{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}@media(prefers-reduced-motion:reduce){*{animation:none!important;opacity:1!important}}`,
        }}
      />

      <div
        className="min-h-screen bg-gradient-to-br from-white via-violet-50/20 to-purple-50/10"
        style={{
          background:
            'linear-gradient(135deg, #fff 0%, rgba(245,243,255,.2) 50%, rgba(250,245,255,.1) 100%), radial-gradient(circle 600px at 25% 0%, rgba(167,139,250,.15), transparent), radial-gradient(circle 700px at 75% 100%, rgba(192,132,252,.12), transparent)',
        }}
      >
        <Header />
        <Hero />
        <Features />
        <Contact />
        <Footer />
      </div>
    </>
  );
}
