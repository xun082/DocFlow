import type { Metadata } from 'next';
import Link from 'next/link';
import { Calendar } from 'lucide-react';

import Header from '@/components/homepage/Header';
import Footer from '@/components/homepage/Footer';
import { blogsServerApi } from '@/services/blogs';
import { formatDateTime } from '@/utils/format/date';
import { BLOG_CATEGORIES } from '@/utils/constants/blog';

interface BlogPageProps {
  params: Promise<{ id: string }>;
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

// 动态生成 SEO 元数据
export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  const { id } = await params;
  const postId = Number(id);
  const response = await blogsServerApi.getInfo(postId);

  const post = response.data?.data;

  if (!post) {
    return {
      title: '文章未找到 - DocFlow',
      description: '您访问的文章不存在或已被删除',
    };
  }

  const description = post.summary || post.content.slice(0, 160).replace(/<[^>]*>/g, '');
  const blogUrl = `${siteUrl}/blog/${post.id}`;

  return {
    title: `${post.title} - DocFlow`,
    description,
    keywords: post.tags ? post.tags.split(',') : [],
    authors: [{ name: post.user?.name }],
    openGraph: {
      type: 'article',
      locale: 'zh_CN',
      url: blogUrl,
      title: post.title,
      description,
      siteName: 'DocFlow',
      images: post.coverImage ? [{ url: post.coverImage, alt: post.title }] : [],
      publishedTime: post.createdAt,
      modifiedTime: post.updatedAt,
      tags: post.tags ? post.tags.split(',') : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
      images: post.coverImage ? [post.coverImage] : [],
    },
    alternates: {
      canonical: blogUrl,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPageProps) {
  const { id } = await params;
  const postId = Number(id);

  const response = await blogsServerApi.getInfo(postId);

  const post = response.data?.data;

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
      <main className="relative z-10 px-4 sm:px-6 py-16">
        <article className="max-w-4xl mx-auto">
          {/* 封面图片 */}
          <div className="relative w-full h-[300px] md:h-[400px] rounded-2xl overflow-hidden shadow-2xl mb-12">
            <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>

          {/* 文章头部信息 */}
          <header className="mb-12">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg text-sm text-gray-400">
                <Calendar className="w-4 h-4" />
                <span>{formatDateTime(post.updatedAt)}</span>
              </span>
              <span className="px-3 py-1.5 bg-violet-500/10 text-violet-300 rounded-lg text-sm border border-violet-500/20">
                {BLOG_CATEGORIES.find((cat) => cat.key === post.category)?.label || '未分类'}
              </span>
            </div>

            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.tags.split(',').map((tag: string) => (
                  <span
                    key={tag}
                    className="px-3 py-1.5 bg-white/5 text-gray-400 rounded-lg text-sm border border-white/10 hover:bg-white/10 hover:border-violet-500/30 transition-all duration-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {post.summary && (
              <p className="mt-6 text-lg text-gray-300 leading-relaxed p-4 bg-white/5 rounded-lg border border-white/10">
                {post.summary}
              </p>
            )}
          </header>

          {/* 文章内容 */}
          <div
            className="tiptap-content prose prose-invert prose-lg max-w-none
              prose-headings:text-white prose-headings:font-bold prose-headings:mb-4 prose-headings:mt-8
              prose-p:text-gray-300 prose-p:leading-relaxed prose-p:mb-4
              prose-a:text-violet-400 prose-a:no-underline hover:prose-a:text-violet-300 hover:prose-a:underline
              prose-strong:text-white prose-strong:font-semibold
              prose-code:text-violet-400 prose-code:bg-white/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
              prose-pre:bg-gray-900 prose-pre:border prose-pre:border-gray-800 prose-pre:rounded-lg prose-pre:p-4
              prose-ul:text-gray-300 prose-ol:text-gray-300
              prose-li:marker:text-violet-400
              prose-blockquote:border-l-violet-500 prose-blockquote:text-gray-300 prose-blockquote:italic
              prose-img:rounded-lg prose-img:shadow-lg prose-img:max-h-[500px] prose-img:object-contain prose-img:mx-auto text-white"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>
      </main>

      <Footer />
    </div>
  );
}
