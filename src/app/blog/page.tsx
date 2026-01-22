import { Suspense } from 'react';
import Link from 'next/link';
import { Calendar, ArrowRight, FileText, Tag } from 'lucide-react';

import BlogFilters from './_components/BlogFilters';

import { formatDateTime } from '@/utils/format/date';
import Header from '@/components/homepage/Header';
import Footer from '@/components/homepage/Footer';
import { blogsServerApi } from '@/services/blogs';

interface BlogListPageProps {
  searchParams: Promise<{ category?: string; search?: string }>;
}

async function BlogContent({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string }>;
}) {
  const resolvedParams = await searchParams;
  const category = resolvedParams?.category || '';
  const searchQuery = resolvedParams?.search || '';

  // 服务端获取博客数据
  const response = await blogsServerApi.getAll({ category, title: searchQuery });

  const blogPosts = response.data?.data || [];

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <Header />

      <main className="relative z-10 pt-10 pb-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white via-violet-200 to-purple-200 bg-clip-text text-transparent">
                博客
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              探索 DocFlow 的技术实现、产品理念以及开发经验分享
            </p>
          </div>

          <BlogFilters initialSearch={searchQuery} initialCategory={category} />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <article key={post.id} className="group">
                <Link href={`/blog/${post.id}`}>
                  <div className="h-full bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-violet-500/50 hover:shadow-2xl hover:shadow-violet-500/10 transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-center space-x-2 text-sm text-violet-400 mb-4">
                      <Tag className="h-4 w-4" />
                      <span>{post.category}</span>
                    </div>

                    <h2 className="text-xl font-bold text-white mb-3 group-hover:text-violet-300 transition-colors line-clamp-2">
                      {post.title}
                    </h2>

                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">{post.summary}</p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags &&
                        post.tags?.split(',').map((tag) => (
                          <span
                            key={tag}
                            className="px-2.5 py-1 bg-white/5 text-gray-400 text-xs rounded-md border border-white/10"
                          >
                            {tag}
                          </span>
                        ))}
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDateTime(post.updatedAt)}</span>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 group-hover:text-violet-400 transition-all" />
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>

          {blogPosts.length === 0 && (
            <div className="text-center py-20">
              <FileText className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">没有找到相关文章</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function BlogPage({ searchParams }: BlogListPageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center text-white">
          加载中...
        </div>
      }
    >
      <BlogContent searchParams={searchParams} />
    </Suspense>
  );
}
