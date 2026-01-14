'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Calendar, Clock, ArrowRight, FileText, Search, Tag } from 'lucide-react';

import Header from '@/components/homepage/Header';
import Footer from '@/components/homepage/Footer';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  readTime: string;
  category: string;
  tags: string[];
  coverImage?: string;
}

const blogPosts: BlogPost[] = [
  {
    id: 'docflow-ai-writing-platform',
    title: 'DocFlow：基于 Tiptap + Yjs 的 AI 智能写作平台',
    excerpt:
      '探索 DocFlow 如何结合 Tiptap 编辑器和 Yjs 实时协作技术，打造下一代智能写作平台。支持 AI 续写、RAG 知识库检索、多人实时协作等核心功能。',
    content: '',
    date: '2024-01-15',
    readTime: '8 分钟',
    category: '产品介绍',
    tags: ['Tiptap', 'Yjs', 'AI', '协作编辑'],
  },
  {
    id: 'tiptap-editor-guide',
    title: '深入理解 Tiptap 编辑器：从入门到精通',
    excerpt:
      'Tiptap 是一个基于 ProseMirror 的无头富文本编辑器框架。本文将带你深入了解 Tiptap 的核心概念、扩展系统以及如何构建自定义编辑器。',
    content: '',
    date: '2024-01-10',
    readTime: '12 分钟',
    category: '技术教程',
    tags: ['Tiptap', 'ProseMirror', '编辑器', '教程'],
  },
  {
    id: 'yjs-realtime-collaboration',
    title: 'Yjs 实时协作技术详解：CRDT 的应用实践',
    excerpt:
      'Yjs 是一个基于 CRDT（无冲突复制数据类型）的实时协作框架。本文将详细介绍 Yjs 的工作原理、核心概念以及如何在项目中实现实时协作功能。',
    content: '',
    date: '2024-01-05',
    readTime: '10 分钟',
    category: '技术深度',
    tags: ['Yjs', 'CRDT', '实时协作', '同步'],
  },
  {
    id: 'rag-knowledge-base',
    title: 'RAG 知识库检索：让 AI 写作更智能',
    excerpt:
      'RAG（Retrieval-Augmented Generation）技术结合了检索和生成的优势。本文将介绍如何在 DocFlow 中实现 RAG 知识库检索，提升 AI 写作的准确性和相关性。',
    content: '',
    date: '2023-12-28',
    readTime: '9 分钟',
    category: 'AI 技术',
    tags: ['RAG', '知识库', 'AI', '检索'],
  },
  {
    id: 'nextjs-performance-optimization',
    title: 'Next.js 性能优化实战：从 SSR 到 ISR',
    excerpt:
      '本文将分享 DocFlow 在使用 Next.js 构建过程中的性能优化经验，包括 SSR、ISR、图片优化、代码分割等技术的实际应用。',
    content: '',
    date: '2023-12-20',
    readTime: '11 分钟',
    category: '性能优化',
    tags: ['Next.js', 'SSR', 'ISR', '性能'],
  },
  {
    id: 'collaborative-editing-best-practices',
    title: '协作编辑最佳实践：构建流畅的实时编辑体验',
    excerpt:
      '实时协作编辑涉及许多技术挑战。本文将分享 DocFlow 在构建协作编辑功能时的经验，包括冲突解决、光标同步、操作合并等最佳实践。',
    content: '',
    date: '2023-12-15',
    readTime: '7 分钟',
    category: '开发经验',
    tags: ['协作编辑', '最佳实践', '实时同步', '用户体验'],
  },
];

const categories = ['全部', '产品介绍', '技术教程', '技术深度', 'AI 技术', '性能优化', '开发经验'];

const BlogPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '全部');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

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
    router.replace(newUrl, { scroll: false });
  }, [searchQuery, selectedCategory, pathname, router]);

  const filteredPosts = blogPosts.filter((post) => {
    const matchesCategory = selectedCategory === '全部' || post.category === selectedCategory;
    const matchesSearch =
      searchQuery === '' ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <Header isLoggedIn={false} onGetStarted={() => {}} />

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
                  {categories.map((category) => (
                    <SelectItem
                      key={category}
                      value={category}
                      className="focus:bg-violet-600/20 focus:text-white"
                    >
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post, index) => (
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

                    <p className="text-gray-400 mb-4 line-clamp-3 text-sm leading-relaxed">
                      {post.excerpt}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.slice(0, 3).map((tag) => (
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
                          <span>{post.date}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{post.readTime}</span>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 group-hover:text-violet-400 transition-all" />
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>

          {filteredPosts.length === 0 && (
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
};

export default BlogPage;
