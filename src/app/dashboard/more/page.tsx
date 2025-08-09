'use client';

import {
  HelpCircle,
  MessageSquare,
  Star,
  Gift,
  Smartphone,
  Mail,
  ExternalLink,
} from 'lucide-react';

const moreFeatures = [
  {
    id: 'mobile',
    name: '移动端应用',
    description: '下载DocFlow移动版，随时随地保持连接',
    icon: <Smartphone className="h-6 w-6" />,
    action: '下载',
    color: 'bg-green-500',
  },
  {
    id: 'feedback',
    name: '意见反馈',
    description: '告诉我们你的想法，帮助我们改进产品',
    icon: <MessageSquare className="h-6 w-6" />,
    action: '反馈',
    color: 'bg-blue-500',
  },
  {
    id: 'help',
    name: '帮助中心',
    description: '查找常见问题的答案和使用指南',
    icon: <HelpCircle className="h-6 w-6" />,
    action: '访问',
    color: 'bg-purple-500',
  },
  {
    id: 'rate',
    name: '应用评分',
    description: '如果你喜欢DocFlow，请给我们五星好评',
    icon: <Star className="h-6 w-6" />,
    action: '评分',
    color: 'bg-yellow-500',
  },
  {
    id: 'invite',
    name: '邀请好友',
    description: '邀请朋友加入，一起体验高效协作',
    icon: <Gift className="h-6 w-6" />,
    action: '邀请',
    color: 'bg-pink-500',
  },
  {
    id: 'newsletter',
    name: '订阅资讯',
    description: '订阅我们的产品更新和行业洞察',
    icon: <Mail className="h-6 w-6" />,
    action: '订阅',
    color: 'bg-indigo-500',
  },
];

const quickLinks = [
  { name: '产品路线图', href: '#' },
  { name: '开发者文档', href: '#' },
  { name: 'API参考', href: '#' },
  { name: '状态页面', href: '#' },
  { name: '隐私政策', href: '#' },
  { name: '服务条款', href: '#' },
];

export default function MorePage() {
  return (
    <div className="mx-auto max-w-4xl p-6">
      {/* 页面头部 */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">更多</h1>
        <p className="text-gray-600">探索更多功能和资源</p>
      </div>

      {/* 功能网格 */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {moreFeatures.map((feature) => (
          <div
            key={feature.id}
            className="rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md"
          >
            <div
              className={`h-12 w-12 ${feature.color} mb-4 flex items-center justify-center rounded-full text-white`}
            >
              {feature.icon}
            </div>
            <h3 className="mb-2 font-semibold text-gray-900">{feature.name}</h3>
            <p className="mb-4 text-sm text-gray-600">{feature.description}</p>
            <button className="w-full rounded-lg bg-gray-100 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-200">
              {feature.action}
            </button>
          </div>
        ))}
      </div>

      {/* 快速链接 */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">快速链接</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {quickLinks.map((link, index) => (
            <a
              key={index}
              href={link.href}
              className="flex items-center space-x-2 text-gray-600 transition-colors hover:text-blue-600"
            >
              <span className="text-sm">{link.name}</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          ))}
        </div>
      </div>

      {/* 版本信息 */}
      <div className="mt-8 text-center">
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <p className="text-sm text-gray-600">
            DocFlow v1.0.0 •
            <a href="#" className="ml-1 text-blue-600 hover:underline">
              更新日志
            </a>
          </p>
          <p className="mt-1 text-xs text-gray-500">© 2024 DocFlow. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
