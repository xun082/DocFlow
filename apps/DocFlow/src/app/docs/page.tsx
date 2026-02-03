'use client';

import { useEffect, useState } from 'react';
import { MdPreview } from 'md-editor-rt';
import 'md-editor-rt/lib/preview.css';

import { TemplateApi } from '@/services/template';

const DocsPage = () => {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const root = document.documentElement;

    const updateTheme = () => {
      setTheme(root.classList.contains('dark') ? 'dark' : 'light');
    };

    updateTheme();

    const observer = new MutationObserver(updateTheme);
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let isActive = true;

    const fetchContent = async () => {
      try {
        const res = await TemplateApi.ProjectorIntro();

        console.log(res);
        if (!isActive) return;

        if (res.data?.code === 200) {
          const markdown = res.data.data.content;
          setContent(markdown);
          setError(null);
        } else {
          setError('内容加载失败');
        }
      } catch {
        if (isActive) {
          setError('内容加载失败');
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    fetchContent();

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <div className="h-full w-full overflow-auto bg-white dark:bg-slate-900">
      <div className="mx-auto w-full max-w-5xl px-6 py-8">
        {isLoading ? (
          <div className="text-sm text-slate-500 dark:text-slate-400">加载中...</div>
        ) : error ? (
          <div className="text-sm text-rose-500">{error}</div>
        ) : content ? (
          <MdPreview value={content} theme={theme} showCodeRowNumber={false} />
        ) : (
          <div className="text-sm text-slate-500 dark:text-slate-400">暂无内容</div>
        )}
      </div>
    </div>
  );
};

export default DocsPage;
