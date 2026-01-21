import type { Metadata } from 'next';
import Link from 'next/link';
import { Calendar } from 'lucide-react';

import Header from '@/components/homepage/Header';
import Footer from '@/components/homepage/Footer';
import { blogsServerApi } from '@/services/blogs';
import { formatDateTime } from '@/utils/format/date';

interface BlogPageProps {
  params: Promise<{ id: string }>;
}

// 动态生成 SEO 元数据
export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  const { id } = await params;
  const postId = Number(id);
  const response = await blogsServerApi.getInfo(postId);
  const post = response.data?.data;

  if (!post) {
    return {
      title: '文章未找到',
      description: '您访问的文章不存在或已被删除',
    };
  }

  const description = post.summary || post.content.slice(0, 160).replace(/<[^>]*>/g, '');

  return {
    title: post.title,
    description,
    keywords: post.tags ? post.tags.split(',') : [],
    authors: [{ name: post.user_name }],
    openGraph: {
      type: 'article',
      locale: 'zh_CN',
      url: `https://www.codecrack.cn/blog/${post.id}`,
      title: post.title,
      description,
      siteName: 'DocFlow',
      images: post.cover_image ? [{ url: post.cover_image, alt: post.title }] : [],
      publishedTime: post.created_at,
      modifiedTime: post.updated_at,
      authors: [post.user_name],
      tags: post.tags ? post.tags.split(',') : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
      images: post.cover_image ? [post.cover_image] : [],
    },
    alternates: {
      canonical: `https://www.codecrack.cn/blog/${post.id}`,
    },
  };
}

//  没有图片使用随机颜色，兜底逻辑
const gradients = [
  'from-violet-500 via-purple-500 to-fuchsia-500',
  'from-blue-500 via-cyan-500 to-teal-500',
  'from-pink-500 via-rose-500 to-red-500',
  'from-orange-500 via-amber-500 to-yellow-500',
  'from-emerald-500 via-green-500 to-lime-500',
  'from-indigo-500 via-violet-500 to-purple-500',
  'from-cyan-500 via-blue-500 to-indigo-500',
];

const getRandomGradient = () => {
  return gradients[Math.floor(Math.random() * gradients.length)];
};

export default async function BlogPostPage({ params }: BlogPageProps) {
  const { id } = await params;
  const postId = Number(id);

  const response = await blogsServerApi.getInfo(postId);
  const post = response.data?.data;
  const gradient = getRandomGradient();

  if (!post) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold text-white mb-4">文章未找到</h1>
          <Link href="/blog" className="text-violet-400 hover:text-violet-300">
            返回博客列表
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />
      <main className="max-w-[90vw] mx-auto text-white ">
        <article className="prose prose-invert prose-lg max-w-none flex flex-col items-center">
          <header className="mb-16">
            {post.cover_image ? (
              <div className="rounded-xl overflow-hidden shadow-2xl">
                <img
                  src={post.cover_image}
                  alt={post.title}
                  className="w-full h-auto object-cover"
                  style={{ aspectRatio: '3/1' }}
                />
              </div>
            ) : (
              <div
                className={`rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-r ${gradient}`}
              ></div>
            )}
            <div className="h-48 flex flex-col items-center justify-center">
              <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight text-center">
                {post.title}
              </h1>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                <span className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 rounded-md">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{formatDateTime(post.updated_at)}</span>
                </span>
                <span className="px-2.5 py-1 bg-violet-500/10 text-violet-300 rounded-md">
                  {post.category}
                </span>
              </div>
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {post.tags.split(',').map((tag: string) => (
                    <span
                      key={tag}
                      className="px-3 py-1.5 bg-white/5 text-gray-400 rounded-md text-sm border border-white/10 hover:bg-white/10 transition-colors"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </header>

          <div
            className="tiptap-content max-w-[70vw] prose prose-invert prose-lg prose-headings:text-white prose-p:text-gray-300 prose-strong:text-white prose-code:text-violet-400 prose-pre:bg-gray-900 prose-pre:border prose-pre:border-gray-800"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>
      </main>

      <Footer />
    </div>
  );
}
