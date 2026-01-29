import React from 'react';
import {
  Edit3,
  Users,
  Database,
  Search,
  Mic,
  Sparkles,
  MessageCircle,
  UserCircle,
  Zap,
} from 'lucide-react';

const featuresData = [
  {
    icon: Edit3,
    title: '沉浸式编辑器',
    description:
      '基于 Tiptap 打造的下一代编辑体验，支持 Markdown 快捷键、块级编辑、拖拽排版，让写作如行云流水般自然',
    gradient: 'from-violet-500 to-purple-600',
    bgColor: 'bg-violet-50',
    borderColor: 'border-violet-200',
    hoverBorder: 'hover:border-violet-400',
    textColor: 'text-violet-700',
  },
  {
    icon: Users,
    title: '实时协作引擎',
    description:
      '基于 Yjs CRDT 算法的毫秒级同步技术，支持百人同时在线编辑，冲突自动解决，协作从未如此丝滑',
    gradient: 'from-emerald-500 to-teal-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    hoverBorder: 'hover:border-emerald-400',
    textColor: 'text-emerald-700',
  },
  {
    icon: Sparkles,
    title: 'AI 创作引擎',
    description:
      '深度理解上下文语境的智能续写系统，支持多种写作风格切换，让 AI 成为你最懂你的创作伙伴',
    gradient: 'from-pink-500 to-rose-600',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
    hoverBorder: 'hover:border-pink-400',
    textColor: 'text-pink-700',
  },
  {
    icon: Database,
    title: '知识图谱系统',
    description:
      '智能构建知识关联网络，自动提取文档关键信息，支持语义搜索和知识发现，让信息价值最大化',
    gradient: 'from-blue-500 to-cyan-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    hoverBorder: 'hover:border-blue-400',
    textColor: 'text-blue-700',
  },
  {
    icon: Search,
    title: 'RAG 检索增强',
    description:
      '结合向量数据库和语义理解的智能检索系统，精准定位相关内容，为创作提供强大的知识支撑',
    gradient: 'from-orange-500 to-red-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    hoverBorder: 'hover:border-orange-400',
    textColor: 'text-orange-700',
  },
  {
    icon: MessageCircle,
    title: '智能对话助手',
    description: '基于文档上下文的专属 AI 助手，深度理解你的内容，提供精准的写作建议和创意灵感',
    gradient: 'from-indigo-500 to-blue-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    hoverBorder: 'hover:border-indigo-400',
    textColor: 'text-indigo-700',
  },
  {
    icon: Mic,
    title: '音频内容生成',
    description: '文档一键转换为专业播客，支持多语言、多音色、情感表达，让知识以声音的形式传播更远',
    gradient: 'from-purple-500 to-pink-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    hoverBorder: 'hover:border-purple-400',
    textColor: 'text-purple-700',
  },
  {
    icon: UserCircle,
    title: '生活智能助理',
    description:
      '全方位生活服务助手，智能规划出行路线、管理日程安排、提醒重要事项，让生活更有序高效',
    gradient: 'from-cyan-500 to-blue-600',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
    hoverBorder: 'hover:border-cyan-400',
    textColor: 'text-cyan-700',
  },
  {
    icon: Zap,
    title: 'Agent 流程编排',
    description:
      '可视化 Agent 构建平台，从输入处理到输出生成的完整流程设计，支持多模态数据处理和复杂逻辑编排',
    gradient: 'from-yellow-500 to-orange-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    hoverBorder: 'hover:border-yellow-400',
    textColor: 'text-yellow-700',
  },
];

const Features: React.FC = () => {
  return (
    <section id="features" className="relative py-20 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* 标题部分 */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            DocFlow
            <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              {' '}
              核心能力矩阵
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            九大核心功能模块，构建完整的 AI 驱动内容创作生态系统
          </p>
        </div>

        {/* 功能卡片网格 */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuresData.map((feature) => {
            const Icon = feature.icon;

            return (
              <div key={feature.title} className="group relative">
                {/* 主卡片 */}
                <div
                  className={`relative ${feature.bgColor} rounded-2xl border-2 ${feature.borderColor} ${feature.hoverBorder} overflow-hidden p-6 h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1`}
                >
                  {/* 顶部装饰渐变 */}
                  <div
                    className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.gradient}`}
                  />

                  {/* 内容区域 */}
                  <div className="relative">
                    {/* 图标区域 */}
                    <div className="flex justify-center mb-4">
                      <div
                        className={`relative w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
                      >
                        <Icon className="h-7 w-7 text-white" />
                      </div>
                    </div>

                    {/* 标题 */}
                    <h3
                      className={`text-xl font-bold ${feature.textColor} mb-3 text-center transition-all duration-300`}
                    >
                      {feature.title}
                    </h3>

                    {/* 描述 */}
                    <p className="text-gray-600 text-sm leading-relaxed text-center group-hover:text-gray-700 transition-colors duration-300">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
