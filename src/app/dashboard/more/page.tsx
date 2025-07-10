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
import { useEffect } from 'react';

import request from '@/services/request';

const moreFeatures = [
  {
    id: 'mobile',
    name: '移动端应用',
    description: '下载DocFlow移动版，随时随地保持连接',
    icon: <Smartphone className="w-6 h-6" />,
    action: '下载',
    color: 'bg-green-500',
  },
  {
    id: 'feedback',
    name: '意见反馈',
    description: '告诉我们你的想法，帮助我们改进产品',
    icon: <MessageSquare className="w-6 h-6" />,
    action: '反馈',
    color: 'bg-blue-500',
  },
  {
    id: 'help',
    name: '帮助中心',
    description: '查找常见问题的答案和使用指南',
    icon: <HelpCircle className="w-6 h-6" />,
    action: '访问',
    color: 'bg-purple-500',
  },
  {
    id: 'rate',
    name: '应用评分',
    description: '如果你喜欢DocFlow，请给我们五星好评',
    icon: <Star className="w-6 h-6" />,
    action: '评分',
    color: 'bg-yellow-500',
  },
  {
    id: 'invite',
    name: '邀请好友',
    description: '邀请朋友加入，一起体验高效协作',
    icon: <Gift className="w-6 h-6" />,
    action: '邀请',
    color: 'bg-pink-500',
  },
  {
    id: 'newsletter',
    name: '订阅资讯',
    description: '订阅我们的产品更新和行业洞察',
    icon: <Mail className="w-6 h-6" />,
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
  useEffect(() => {
    async function getMoreFeatures() {
      const result = await request.get(
        `/api/v1/documents/35/content`,
        { cacheTime: 0 }, // 不缓存，确保数据新鲜
        undefined, // mode
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTIzLCJuYW1lIjoiMjA0MjIwNDI4NUBxcS5jb20iLCJlbWFpbCI6IjIwNDIyMDQyODVAcXEuY29tIiwiaWF0IjoxNzUyMDUzMjMwLCJleHAiOjE3NTQ2NDUyMzB9.pz0hnKhcGdq7tDiYxeEnUooLUoPnTg1OvHJtShix78w', // 传递 token，现在 request 已经支持 SSR
      );

      console.log('result', result);
    }

    getMoreFeatures();

    return () => {};
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* 页面头部 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">更多</h1>
        <p className="text-gray-600">探索更多功能和资源</p>
      </div>

      {/* 功能网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {moreFeatures.map((feature) => (
          <div
            key={feature.id}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <div
              className={`w-12 h-12 ${feature.color} rounded-full flex items-center justify-center text-white mb-4`}
            >
              {feature.icon}
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">{feature.name}</h3>
            <p className="text-sm text-gray-600 mb-4">{feature.description}</p>
            <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              {feature.action}
            </button>
          </div>
        ))}
      </div>

      {/* 快速链接 */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">快速链接</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {quickLinks.map((link, index) => (
            <a
              key={index}
              href={link.href}
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <span className="text-sm">{link.name}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          ))}
        </div>
      </div>

      {/* 版本信息 */}
      <div className="mt-8 text-center">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600">
            DocFlow v1.0.0 •
            <a href="#" className="text-blue-600 hover:underline ml-1">
              更新日志
            </a>
          </p>
          <p className="text-xs text-gray-500 mt-1">© 2024 DocFlow. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
