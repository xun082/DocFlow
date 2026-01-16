'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Calendar, ArrowLeft } from 'lucide-react';
import DOMPurify from 'dompurify';

import Header from '@/components/homepage/Header';
import Footer from '@/components/homepage/Footer';
import { blogsApi } from '@/services/blogs';
import { BlogPost } from '@/services/blogs/type';
import { formatDateTime } from '@/utils/format/date';

export default function BlogPostPage() {
  const params = useParams();
  const [isMounted, setIsMounted] = useState(false);
  const [post, setPost] = useState<BlogPost | null>(null);

  useEffect(() => {
    setIsMounted(true);
    blogsApi.getBlogInfo(Number(params.id)).then((res) => {
      if (res.data) {
        setPost(res.data.data);
      }
    });
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
                {formatDateTime(post.updated_at)}
              </span>
              {/* <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {post.readTime}
              </span> */}
              <span className="px-2 py-1 bg-violet-600/20 text-violet-400 rounded-full text-xs">
                {post.category}
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white via-violet-200 to-purple-200 bg-clip-text text-transparent">
              {post.title}
            </h1>

            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-6">
                {post.tags &&
                  post.tags.split(',').map((tag) => (
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
          {/* <p className="text-white mb-12">{post.content}</p> */}
          <div className="prose prose-invert prose-lg max-w-none prose-headings:text-white prose-p:text-gray-300 prose-strong:text-white prose-code:text-violet-400 prose-pre:bg-gray-900 prose-pre:border prose-pre:border-gray-800">
            <div
              className="text-white"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
            />
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
