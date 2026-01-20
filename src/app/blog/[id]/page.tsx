import Link from 'next/link';
import { Calendar } from 'lucide-react';

import Header from '@/components/homepage/Header';
import Footer from '@/components/homepage/Footer';
import { blogsApi } from '@/services/blogs';
import { formatDateTime } from '@/utils/format/date';

export default async function BlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const postId = Number(id);

  const response = await blogsApi.getBlogInfo(postId);
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
      <main className="max-w-[80vw] mx-auto">
        <article className="prose prose-invert prose-lg max-w-none">
          <header className="mb-16 flex flex-col items-center">
            {post.cover_image && (
              <div className="mb-8 rounded-sm overflow-hidden shadow-2xl">
                <img
                  src={post.cover_image}
                  alt={post.title}
                  className="w-full h-auto object-cover"
                  style={{ aspectRatio: '3/1' }}
                />
              </div>
            )}
            <h1 className="text-4xl md:text-5xl font-bold  text-white leading-tight">
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
                {post.tags.split(',').map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1.5 bg-white/5 text-gray-400 rounded-md text-sm border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          <div
            className="tiptap-content prose prose-invert prose-lg max-w-none prose-headings:text-white prose-p:text-gray-300 prose-strong:text-white prose-code:text-violet-400 prose-pre:bg-gray-900 prose-pre:border prose-pre:border-gray-800"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>
      </main>

      <Footer />
    </div>
  );
}
