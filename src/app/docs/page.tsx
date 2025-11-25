'use client';

import {
  FileText,
  FileVideo,
  Clock,
  Edit3,
  Eye,
  FileCode,
  FileMusic,
  FileImage,
} from 'lucide-react';
import React, { JSX, useEffect, useState } from 'react';

import DocumentApi from '@/services/document';
import { LatestDocumentItem } from '@/services/document/type';

interface DocStatItem {
  name: string;
  value: string;
  icon: JSX.Element;
  color: string;
  desc?: string;
}

interface RecentDoc {
  id: string;
  title: string;
  type: 'text' | 'media' | 'code' | 'image' | 'audio' | 'video' | 'file';
  updatedAt: string;
  author: string;
  isNew?: boolean;
}

const docStatus: DocStatItem[] = [
  {
    name: '总文档数',
    value: '248',
    icon: <FileText className="w-6 h-6" />,
    color: 'bg-blue-500',
    desc: '包含所有类型文档',
  },
  {
    name: '文本类文档',
    value: '186',
    icon: <FileText className="w-6 h-6" />,
    color: 'bg-green-500',
    desc: '纯文本/Markdown/富文本',
  },
  {
    name: '多媒体文档',
    value: '32',
    icon: <FileVideo className="w-6 h-6" />,
    color: 'bg-purple-500',
    desc: '含图片/视频/附件',
  },
  {
    name: '本周新增',
    value: '12',
    icon: <Edit3 className="w-6 h-6" />,
    color: 'bg-emerald-500',
    desc: '近7天创建的文档',
  },
  {
    name: '待更新文档',
    value: '27',
    icon: <Clock className="w-6 h-6" />,
    color: 'bg-amber-500',
    desc: '超过90天未更新',
  },
  {
    name: '总浏览量',
    value: '3,842',
    icon: <Eye className="w-6 h-6" />,
    color: 'bg-indigo-500',
    desc: '所有文档累计浏览',
  },
];

// const recentDocs: RecentDoc[] = [
//   {
//     id: 'doc-1024',
//     title: '2024年产品迭代规划文档',
//     type: 'text',
//     updatedAt: '2024-05-20 14:30',
//     author: 'wangchaozi',
//   },
//   {
//     id: 'doc-1023',
//     title: '知识库API接口设计规范',
//     type: 'code',
//     updatedAt: '2024-05-19 09:15',
//     author: 'monent',
//   },
//   {
//     id: 'doc-1022',
//     title: 'Q2季度市场分析报告',
//     type: 'media',
//     updatedAt: '2024-05-18 16:45',
//     author: 'monent',
//     isNew: true,
//   },
//   {
//     id: 'doc-1021',
//     title: '用户调研访谈记录（五月）',
//     type: 'text',
//     updatedAt: '2024-05-17 11:20',
//     author: 'monent',
//   },
//   {
//     id: 'doc-1020',
//     title: '产品宣传视频分镜脚本',
//     type: 'video',
//     updatedAt: '2024-05-16 15:50',
//     author: 'monent',
//   },
// ];

const getDocIcon = (type: RecentDoc['type']): JSX.Element => {
  switch (type) {
    case 'text':
      return <FileText className="w-4 h-4 text-blue-500" />;
    case 'media':
      return <FileVideo className="w-4 h-4 text-purple-500" />;
    case 'code':
      return <FileCode className="w-4 h-4 text-green-500" />;
    case 'image':
      return <FileImage className="w-4 h-4 text-amber-500" />;
    case 'audio':
      return <FileMusic className="w-4 h-4 text-indigo-500" />;
    default:
      return <FileText className="w-4 h-4 text-gray-500" />;
  }
};

const Page = () => {
  // 获取最新的文档
  const [recentDocs, setRecentDocs] = useState<LatestDocumentItem[]>([]);

  useEffect(() => {
    DocumentApi.GetLatestDocuments(5).then((res) => {
      if (res?.data?.code === 200 && res.data?.data) {
        setRecentDocs(res.data.data);
      }
    });
  }, []);

  return (
    <div className="container mx-auto px-4 py-6 overflow-auto max-h-[calc(100vh-40px)]">
      {/* 统计卡片区域 */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="mb-6 pb-3 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800">文档统计</h2>
          <p className="text-gray-500 text-sm mt-1">所有文档的综合数据</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {docStatus.map((item, idx) => (
            <div
              key={idx}
              className="flex items-start p-4 rounded-lg border border-gray-100 hover:shadow-md transition-all duration-200"
            >
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center text-white ${item.color} 
                           mr-4 mt-0.5 flex-shrink-0`}
              >
                {item.icon}
              </div>

              <div className="flex-grow">
                <p className="text-gray-500 text-sm font-medium">{item.name}</p>
                <h3 className="text-2xl font-bold text-gray-800 mt-0.5">{item.value}</h3>
                {item.desc && <p className="text-gray-400 text-xs mt-1">{item.desc}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 最近文档区域 */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="mb-4 pb-3 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">最近文档</h2>
          <p className="text-gray-500 text-sm mt-1">最近更新或创建的文档列表</p>
        </div>

        <div className="space-y-3">
          {recentDocs.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors duration-200"
            >
              {/* 文档信息 */}
              <div className="flex items-center">
                <div className="mr-3 p-2 bg-gray-100 rounded">
                  {getDocIcon(doc.type.toLowerCase() as any)}
                </div>
                <div>
                  <div className="flex items-center">
                    <span className="text-gray-800 font-medium">{doc.title}</span>
                    {/* {doc.isNew && (
                      <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-full">
                        新
                      </span>
                    )} */}
                  </div>
                  <div className="flex items-center mt-1 text-xs text-gray-500">
                    <span>{doc.author}</span>
                    <span className="mx-1">•</span>
                    <span>{doc.updated_at}</span>
                  </div>
                </div>
              </div>

              {/* 操作按钮，目前是一个查看图标，之后会改为一个tool工具栏，包括但不限于分享，编辑，打印，删除 */}
              <button className="text-gray-400 hover:text-gray-600 transition-colors">
                <FileText className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Page;
