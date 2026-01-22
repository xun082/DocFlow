import { Suspense } from 'react';
import Link from 'next/link';
import { Calendar, ArrowRight, FileText, Search, Tag } from 'lucide-react';

import { formatDateTime } from '@/utils/format/date';
import { blogsServerApi } from '@/services/blogs';
import type { BlogPost } from '@/services/blogs/type';
import Header from '@/components/homepage/Header';
import Footer from '@/components/homepage/Footer';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface BlogListPageProps {
  searchParams: Promise<{ category?: string; search?: string }>;
}

const BLOG_CATEGORIES = [
  { key: 'ALL', label: '' },
  { key: 'TECH', label: '技术' },
  { key: 'LIFE', label: '生活' },
  { key: 'STUDY', label: '学习' },
  { key: 'ENTERTAINMENT', label: '娱乐' },
  { key: 'SPORTS', label: '运动' },
  { key: 'TRAVEL', label: '旅游' },
  { key: 'FOOD', label: '美食' },
  { key: 'PHOTOGRAPHY', label: '摄影' },
  { key: 'MUSIC', label: '音乐' },
  { key: 'MOVIE', label: '电影' },
  { key: 'READING', label: '阅读' },
  { key: 'OTHER', label: '其他' },
] as const;

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

  // API 一定会返回数据（成功或失败）
  const blogPosts = response.data?.data?.list || [];
  const hasError = response.error;
  const isEmpty = !hasError && blogPosts.length === 0;

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <Header />

      <main className="relative z-10 pt-32 pb-20 px-4 sm:px-6">
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

          <div className="mb-12 flex flex-col md:flex-row gap-8 items-center">
            <div className="relative flex-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索文章..."
                defaultValue={searchQuery}
                className="w-full pl-10 pr-4 py-1.5 bg-white/10 border border-white/20 rounded-[8px] text-white placeholder-gray-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-300"
              />
            </div>
            <div className="flex-1">
              <Select defaultValue={category} name="category">
                <SelectTrigger className="w-full px-4 py-5 bg-white/10 border-white/20 text-white focus:border-violet-500 focus:ring-violet-500/20">
                  <SelectValue placeholder="分类" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-white/20 text-white">
                  {BLOG_CATEGORIES.map((category) => (
                    <SelectItem
                      key={category.key}
                      value={category.key}
                      className="focus:bg-violet-600/20 focus:text-white"
                    >
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 错误提示 */}
          {hasError && (
            <div className="text-center py-20">
              <FileText className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <p className="text-red-400 text-lg mb-2">获取文章失败</p>
              <p className="text-gray-500 text-sm">{response.error}</p>
            </div>
          )}

          {/* 空状态提示 */}
          {isEmpty && (
            <div className="text-center py-20">
              <FileText className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">没有找到相关文章</p>
            </div>
          )}

          {/* 博客列表 */}
          {!hasError && !isEmpty && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.map((post: BlogPost) => (
                <article key={post.id} className="group">
                  <Link href={`/blog/${post.id}`}>
                    <div className="h-full bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:border-violet-500/50 hover:shadow-2xl hover:shadow-violet-500/10 transition-all duration-300 hover:-translate-y-1">
                      {/* 封面图片 */}
                      <div className="relative w-full h-48 overflow-hidden">
                        <img
                          src={post.cover_image}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                        {/* 分类标签 */}
                        <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 bg-black/50 backdrop-blur-sm rounded-lg text-xs text-violet-300 border border-violet-500/30">
                          <Tag className="h-3 w-3" />
                          <span>{post.category}</span>
                        </div>
                      </div>

                      {/* 内容区域 */}
                      <div className="p-6">
                        <h2 className="text-xl font-bold text-white mb-3 group-hover:text-violet-300 transition-colors line-clamp-2">
                          {post.title}
                        </h2>

                        <p className="text-gray-400 text-sm mb-4 line-clamp-2 leading-relaxed">
                          {post.summary}
                        </p>

                        {/* 标签 */}
                        {post.tags && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {post.tags
                              .split(',')
                              .slice(0, 3)
                              .map((tag: string) => (
                                <span
                                  key={tag}
                                  className="px-2.5 py-1 bg-white/5 text-gray-400 text-xs rounded-md border border-white/10"
                                >
                                  {tag}
                                </span>
                              ))}
                            {post.tags.split(',').length > 3 && (
                              <span className="px-2.5 py-1 bg-white/5 text-gray-400 text-xs rounded-md border border-white/10">
                                +{post.tags.split(',').length - 3}
                              </span>
                            )}
                          </div>
                        )}

                        {/* 底部信息 */}
                        <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-white/5">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDateTime(post.updated_at)}</span>
                          </div>
                          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 group-hover:text-violet-400 transition-all" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
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
