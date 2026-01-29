import React from 'react';
import { MessageCircle, Zap, Github, Users } from 'lucide-react';

import { ContactCard } from './contact-card';

const Contact: React.FC = () => {
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
          <ContactCard
            icon={MessageCircle}
            title="微信交流"
            description="添加微信，获取更多支持和交流"
            buttonText="微信号"
            displayText="yunmz777"
            buttonGradient="bg-gradient-to-r from-green-600 to-green-500"
            borderHoverColor="hover:border-green-400"
            shadowColor="hover:shadow-green-500/10"
            animationDelay="animate-fade-in-delay-100"
          />

          {/* 掘金卡片 */}
          <ContactCard
            icon={Zap}
            title="掘金技术"
            description="关注我们的技术文章和分享"
            buttonText="前往掘金主页"
            buttonGradient="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600"
            borderHoverColor="hover:border-blue-400"
            shadowColor="hover:shadow-blue-500/10"
            href="https://juejin.cn/user/3782764966460398"
            animationDelay="animate-fade-in-delay-200"
          />

          {/* GitHub 卡片 */}
          <ContactCard
            icon={Github}
            title="GitHub 开源"
            description="查看我们的开源项目和代码"
            buttonText="前往 GitHub"
            buttonGradient="bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900"
            borderHoverColor="hover:border-gray-400"
            shadowColor="hover:shadow-gray-500/10"
            href="https://github.com/xun082"
            animationDelay="animate-fade-in-delay-300"
          />
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
