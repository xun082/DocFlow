import { Suspense } from 'react';
import Link from 'next/link';
import { Calendar, ArrowRight, FileText, Search, Tag } from 'lucide-react';

import { formatDateTime } from '@/utils/format/date';
import Header from '@/components/homepage/Header';
import Footer from '@/components/homepage/Footer';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { blogsServerApi } from '@/services/blogs';

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
  searchParams: { category?: string; search?: string };
}) {
  const category = searchParams?.category || '';
  const searchQuery = searchParams?.search || '';

  // 服务端获取博客数据
  const response = await blogsServerApi.getAll({ category, title: searchQuery });
  const blogPosts = response.data?.data || [];

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
                          <span>{formatDateTime(post.updated_at)}</span>
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

const BlogPage = ({ searchParams }: { searchParams: { category?: string; search?: string } }) => {
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
};

export default BlogPage;
