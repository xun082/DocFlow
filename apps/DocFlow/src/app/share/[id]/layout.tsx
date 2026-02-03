import type { Metadata } from 'next';

// ISR: 每 5 分钟重新生成（因为分享链接可能会过期或修改）
export const revalidate = 300;

interface ShareLayoutProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

// 动态生成 SEO 元数据
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `文档分享 - DocFlow`,
    description: '查看共享的文档内容',
    robots: {
      index: false, // 分享页面不索引
      follow: false,
    },
  };
}

export default function ShareLayout({ children }: ShareLayoutProps) {
  return <>{children}</>;
}
