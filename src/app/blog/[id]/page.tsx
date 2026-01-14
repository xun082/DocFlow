'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Calendar, Clock, ArrowLeft } from 'lucide-react';

import Header from '@/components/homepage/Header';
import Footer from '@/components/homepage/Footer';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  readTime: string;
  category: string;
  tags: string[];
  author?: {
    name: string;
    avatar?: string;
  };
}

const blogPosts: Record<string, BlogPost> = {
  'docflow-ai-writing-platform': {
    id: 'docflow-ai-writing-platform',
    title: 'DocFlow：基于 Tiptap + Yjs 的 AI 智能写作平台',
    excerpt: '探索 DocFlow 如何结合 Tiptap 编辑器和 Yjs 实时协作技术，打造下一代智能写作平台。',
    content: `# DocFlow：基于 Tiptap + Yjs 的 AI 智能写作平台`,
    date: '2024-01-15',
    readTime: '8 分钟',
    category: '产品介绍',
    tags: ['Tiptap', 'Yjs', 'AI', '协作编辑'],
    author: {
      name: 'DocFlow Team',
    },
  },
  'tiptap-editor-guide': {
    id: 'tiptap-editor-guide',
    title: '深入理解 Tiptap 编辑器：从入门到精通',
    excerpt:
      'Tiptap 是一个基于 ProseMirror 的无头富文本编辑器框架。本文将带你深入了解 Tiptap 的核心概念、扩展系统以及如何构建自定义编辑器。',
    content: `# 深入理解 Tiptap 编辑器：从入门到精通`,
    date: '2024-01-10',
    readTime: '12 分钟',
    category: '技术教程',
    tags: ['Tiptap', '编辑器', 'React', 'TypeScript'],
    author: {
      name: 'DocFlow Team',
    },
  },
  'real-time-collaboration': {
    id: 'real-time-collaboration',
    title: '实时协作技术深度解析：从 CRDT 到 Yjs',
    excerpt: '深入了解实时协作的核心技术 CRDT，以及如何使用 Yjs 构建实时协作应用。',
    content: `# 实时协作技术深度解析：从 CRDT 到 Yjs`,
    date: '2024-01-05',
    readTime: '15 分钟',
    category: '技术教程',
    tags: ['Yjs', 'CRDT', '实时协作', '分布式系统'],
    author: {
      name: 'DocFlow Team',
    },
  },
  'ai-writing-assistant': {
    id: 'ai-writing-assistant',
    title: 'AI 写作助手：如何利用大语言模型提升写作效率',
    excerpt: '探索如何将大语言模型集成到写作工具中，提供智能续写、语法检查、内容优化等功能。',
    content: `# AI 写作助手：如何利用大语言模型提升写作效率`,
    date: '2023-12-28',
    readTime: '14 分钟',
    category: '技术教程',
    tags: ['Next.js', '性能优化', '前端', 'Web 性能'],
    author: {
      name: 'DocFlow Team',
    },
  },
  'design-system': {
    id: 'design-system',
    title: '构建可扩展的设计系统：从组件到模式',
    excerpt: '学习如何构建一个可扩展、可维护的设计系统，包括组件库、设计令牌、文档等。',
    content: `# 构建可扩展的设计系统：从组件到模式`,
    date: '2023-12-20',
    readTime: '16 分钟',
    category: '技术教程',
    tags: ['设计系统', '组件库', 'UI/UX', '前端开发'],
    author: {
      name: 'DocFlow Team',
    },
  },
};

export default function BlogPostPage() {
  const params = useParams();
  const [isMounted, setIsMounted] = useState(false);
  const [post, setPost] = useState<BlogPost | null>(null);

  useEffect(() => {
    setIsMounted(true);

    const postId = params.id as string;
    setPost(blogPosts[postId] || null);
  }, [params.id]);

  if (!isMounted) {
    return null;
  }

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

      <main className="max-w-4xl mx-auto px-4 py-12">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          返回博客
        </Link>

        <article className="prose prose-invert prose-lg max-w-none">
          <header className="mb-12">
            <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {post.date}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {post.readTime}
              </span>
              <span className="px-2 py-1 bg-violet-600/20 text-violet-400 rounded-full text-xs">
                {post.category}
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white via-violet-200 to-purple-200 bg-clip-text text-transparent">
              {post.title}
            </h1>

            <p className="text-xl text-gray-300 leading-relaxed">{post.excerpt}</p>

            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-6">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-white/10 text-gray-300 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          <div className="prose prose-invert prose-lg max-w-none prose-headings:text-white prose-p:text-gray-300 prose-strong:text-white prose-code:text-violet-400 prose-pre:bg-gray-900 prose-pre:border prose-pre:border-gray-800">
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
