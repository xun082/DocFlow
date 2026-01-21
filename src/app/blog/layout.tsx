import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.codecrack.cn';
const blogUrl = `${siteUrl}/blog`;

export const metadata: Metadata = {
  title: {
    template: '%s | DocFlow 博客',
    default: '博客 | DocFlow',
  },
  description:
    '探索 DocFlow 的技术实现、产品理念以及开发经验分享。涵盖前端开发、协同编辑、AI 技术等领域的深度文章。',
  keywords: [
    '技术博客',
    '前端开发',
    '协同编辑',
    'React',
    'Next.js',
    'Tiptap',
    'AI',
    '文档编辑器',
    '开发经验',
    '技术分享',
  ],
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: blogUrl,
    title: '博客 | DocFlow',
    description:
      '探索 DocFlow 的技术实现、产品理念以及开发经验分享。涵盖前端开发、协同编辑、AI 技术等领域的深度文章。',
    siteName: 'DocFlow',
  },
  twitter: {
    card: 'summary_large_image',
    title: '博客 | DocFlow',
    description:
      '探索 DocFlow 的技术实现、产品理念以及开发经验分享。涵盖前端开发、协同编辑、AI 技术等领域的深度文章。',
  },
  alternates: {
    canonical: blogUrl,
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
