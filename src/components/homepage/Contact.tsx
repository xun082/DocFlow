'use client';

import React, { useState } from 'react';
import { MessageCircle, Copy, Zap, Github, Users } from 'lucide-react';

// Check 图标组件
const CheckIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

const Contact: React.FC = () => {
  const [wechatCopied, setWechatCopied] = useState(false);

  const handleWechatCopy = async () => {
    const text = 'yunmz777';

    await navigator.clipboard.writeText(text);
    setWechatCopied(true);
    setTimeout(() => setWechatCopied(false), 2000);
  };

  const handleJuejinClick = () => {
    window.open('https://juejin.cn/user/3782764966460398', '_blank', 'noopener,noreferrer');
  };

  const handleGithubClick = () => {
    window.open('https://github.com/xun082', '_blank', 'noopener,noreferrer');
  };

  return (
    <section className="relative px-6 py-24 overflow-hidden bg-gray-50">
      {/* 装饰性背景 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-100 rounded-full blur-3xl opacity-50 animate-float" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-blue-100 rounded-full blur-3xl opacity-50 animate-float [animation-delay:3s]" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* 标题区域 */}
        <div className="text-center mb-16 animate-fade-in">
          {/* 图标装饰 */}
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl mb-6 shadow-lg animate-scale-in">
            <Users className="w-8 h-8 text-white" />
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            加入{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              DocFlow
            </span>{' '}
            社区
          </h2>

          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            与全球开发者一起探索 AI 写作的无限可能
          </p>
        </div>

        {/* 联系方式卡片 */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* 微信卡片 */}
          <div className="group relative animate-fade-in-delay-100">
            <div className="relative p-6 bg-white border-2 border-gray-200 rounded-2xl hover:border-green-400 transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/10 hover:-translate-y-1">
              {/* 内容 */}
              <div className="relative z-10">
                {/* 图标 */}
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>

                {/* 文案 */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2">微信交流</h3>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                  添加微信，获取更多支持和交流
                </p>

                {/* 微信按钮 */}
                <button
                  onClick={handleWechatCopy}
                  className="w-full px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-500 text-white text-sm font-medium rounded-xl hover:from-green-500 hover:to-green-400 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-green-500/25 transform hover:-translate-y-0.5 hover:scale-105 active:scale-95"
                  type="button"
                  aria-label="复制微信号"
                >
                  <span aria-live="polite">{wechatCopied ? '已复制' : 'yunmz777'}</span>
                  <span
                    className={`transition-transform duration-300 ${wechatCopied ? 'rotate-180 scale-110' : ''}`}
                  >
                    {wechatCopied ? (
                      <CheckIcon className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* 掘金卡片 */}
          <div className="group relative animate-fade-in-delay-200">
            <div className="relative p-6 bg-white border-2 border-gray-200 rounded-2xl hover:border-blue-400 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1">
              <div className="relative z-10">
                {/* 图标 */}
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Zap className="w-6 h-6 text-white" />
                </div>

                {/* 文案 */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2">掘金技术</h3>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                  关注我们的技术文章和分享
                </p>

                {/* 掘金按钮 */}
                <button
                  onClick={handleJuejinClick}
                  className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white text-sm font-medium rounded-xl hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-blue-500/25 transform hover:-translate-y-0.5 hover:scale-105 active:scale-95"
                  type="button"
                  aria-label="前往掘金主页"
                >
                  前往掘金主页
                </button>
              </div>
            </div>
          </div>

          {/* GitHub 卡片 */}
          <div className="group relative animate-fade-in-delay-300">
            <div className="relative p-6 bg-white border-2 border-gray-200 rounded-2xl hover:border-gray-400 transition-all duration-300 hover:shadow-2xl hover:shadow-gray-500/10 hover:-translate-y-1">
              <div className="relative z-10">
                {/* 图标 */}
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Github className="w-6 h-6 text-white" />
                </div>

                {/* 文案 */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2">GitHub 开源</h3>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                  查看我们的开源项目和代码
                </p>

                {/* GitHub 按钮 */}
                <button
                  onClick={handleGithubClick}
                  className="w-full px-4 py-2.5 bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900 text-white text-sm font-medium rounded-xl hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-gray-500/25 transform hover:-translate-y-0.5 hover:scale-105 active:scale-95"
                  type="button"
                  aria-label="前往 GitHub"
                >
                  前往 GitHub
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 底部装饰 */}
        <div className="text-center mt-12 pt-8 border-t border-gray-200 animate-fade-in-delay-500">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-violet-500" />
            <span className="text-sm text-gray-600 font-medium">DocFlow Community</span>
            <Zap className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-xs text-gray-500">共同构建下一代智能写作平台</p>
        </div>
      </div>
    </section>
  );
};

export default Contact;
