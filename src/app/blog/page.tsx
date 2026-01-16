'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
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
import { blogsApi } from '@/services/blogs';
import { BlogPost } from '@/services/blogs/type';

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

function BlogContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    const params = new URLSearchParams();

    if (searchQuery) {
      params.set('search', searchQuery);
    }

    if (selectedCategory && selectedCategory !== '全部') {
      params.set('category', selectedCategory);
    }

    const queryString = params.toString();
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname;

    blogsApi.getAll({ category: selectedCategory, title: searchQuery }).then((res) => {
      if (res.data) {
        setBlogPosts(res.data.data || []);
      }
    });
    router.replace(newUrl, { scroll: false });
  }, [searchQuery, selectedCategory, pathname, router]);

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <Header />

      <main className="relative z-10 pt-32 pb-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white via-violet-200 to-purple-200 bg-clip-text text-transparent">
                博客
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              探索 DocFlow 的技术实现、产品理念以及开发经验分享
            </p>
          </motion.div>

          <div className="mb-12 flex flex-col md:flex-row gap-30 items-center">
            <div className="relative w-2/2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索文章..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-1.5 bg-white/10 border border-white/20 rounded-[8px] text-white placeholder-gray-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-300"
              />
            </div>
            <div className="w-1/3">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full px-4 py-5  bg-white/10 border-white/20 text-white focus:border-violet-500 focus:ring-violet-500/20">
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
            {blogPosts.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group"
              >
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
              </motion.article>
            ))}
          </div>

          {blogPosts.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <FileText className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">没有找到相关文章</p>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

const BlogPage = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center text-white">
          加载中...
        </div>
      }
    >
      <BlogContent />
    </Suspense>
  );
};

export default BlogPage;
