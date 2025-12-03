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
  Share,
  Trash2,
  Download,
  MoreHorizontal,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { JSX, useEffect, useState } from 'react';

import { FileItem } from './_components/DocumentSidebar/folder/type';

import DocumentApi from '@/services/document';
import { LatestDocumentItem } from '@/services/document/type';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import ShareDialog from '@/app/docs/_components/DocumentSidebar/folder/ShareDialog';
import { useFileOperations } from '@/app/docs/_components/DocumentSidebar/folder/hooks/useFileOperations';
import { useSidebar } from '@/stores/sidebarStore';

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
  const router = useRouter();

  // 获取最新的文档
  const [recentDocs, setRecentDocs] = useState<LatestDocumentItem[]>([]);

  // 分享对话框状态
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareDialogFile, setShareDialogFile] = useState<FileItem | null>(null);

  const { triggerRefresh, refreshTrigger, lastOperationSource } = useSidebar();

  // 刷新文档列表的函数
  const refreshDocuments = async () => {
    try {
      const res = await DocumentApi.GetLatestDocuments(5);

      if (res?.data) {
        if (Array.isArray(res.data)) {
          setRecentDocs(res.data);
        } else if (res.data?.data && Array.isArray(res.data.data)) {
          setRecentDocs(res.data.data);
        } else if (res.data?.code === 200 && res.data?.data) {
          if (Array.isArray(res.data.data)) {
            setRecentDocs(res.data.data);
          } else {
            setRecentDocs((res.data.data as any)?.documents);
          }
        }
      }
    } catch (error) {
      console.error('获取最新文档失败:', error);
      setRecentDocs([]);
    }
  };

  // 文件操作功能
  const fileOperations = useFileOperations(refreshDocuments);

  // 处理分享按钮点击
  const handleShare = (latestDocumentItem: LatestDocumentItem) => {
    if (latestDocumentItem.id) {
      const fileItem: FileItem = {
        id: latestDocumentItem.id.toString(),
        name: latestDocumentItem.title, // 使用实际标题而不是documentName
        type: 'file',
        depth: 0,
      };
      setShareDialogFile(fileItem);
      setShareDialogOpen(true);
    }
  };

  useEffect(() => {
    DocumentApi.GetLatestDocuments(5)
      .then((res) => {
        // 检查响应数据结构
        if (res?.data) {
          // 如果 data 本身就是数组
          if (Array.isArray(res.data)) {
            setRecentDocs(res.data);
          }
          // 如果 data 包含 data 属性且是数组
          else if (res.data?.data && Array.isArray(res.data.data)) {
            setRecentDocs(res.data.data);
          }
          // 如果有 code 200 和 data
          else if (res.data?.code === 200 && res.data?.data) {
            if (Array.isArray(res.data.data)) {
              setRecentDocs(res.data.data);
            } else {
              setRecentDocs((res.data.data as any)?.documents);
            }
          }
        }
      })
      .catch((error) => {
        console.error('获取最新文档失败:', error);
        // 出错时设置为空数组
        setRecentDocs([]);
      });
  }, []);

  // 监听 refreshTrigger 变化，当从侧边栏触发刷新时重新获取数据
  useEffect(() => {
    if (refreshTrigger > 0 && lastOperationSource !== 'latestDoc') {
      // console.log('🚀 ~ file: page.tsx:209 ~ lastOperationSource:', lastOperationSource);
      refreshDocuments();
    }
  }, [refreshTrigger, lastOperationSource]);

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
          {Array.isArray(recentDocs) && recentDocs.length > 0 ? (
            recentDocs.map((doc) => (
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

                {/* 操作按钮 - DropdownMenu 下拉菜单 */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="text-gray-400 hover:text-gray-600 transition-colors">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                      onClick={() => router.push(`/docs/${doc.id}`)}
                      className="cursor-pointer"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      查看
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push(`/docs/${doc.id}`)}>
                      <Edit3 className="w-4 h-4 mr-2" />
                      编辑
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleShare(doc)}>
                      <Share className="w-4 h-4 mr-2" />
                      分享
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        fileOperations.handleDownload({
                          id: doc.id.toString(),
                          name: doc.title,
                          type: 'file',
                          parentId: '',
                          depth: 0,
                        })
                      }
                    >
                      <Download className="w-4 h-4 mr-2" />
                      下载
                    </DropdownMenuItem>
                    {/* <DropdownMenuItem onClick={() => console.log('打印文档:', doc.id)}>
                      <Printer className="w-4 h-4 mr-2" />
                      打印
                    </DropdownMenuItem> */}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        fileOperations.handleDelete({
                          id: doc.id.toString(),
                          name: doc.title,
                          type: 'file',
                          parentId: '',
                          depth: 0,
                        });
                      }}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      删除
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>暂无最近文档</p>
            </div>
          )}
        </div>
      </div>

      {/* 删除确认对话框 */}
      <Dialog open={fileOperations.showDeleteDialog} onOpenChange={fileOperations.cancelDelete}>
        <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden bg-white/95 backdrop-blur-sm border border-slate-200/50 shadow-lg transition-all">
          <DialogHeader className="p-6 pb-4">
            <DialogTitle className="text-xl font-semibold flex items-center space-x-2 text-red-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="animate-bounce"
              >
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <span>确认删除</span>
            </DialogTitle>
            <DialogDescription className="mt-3 text-slate-600">
              您确定要删除{' '}
              <span className="font-medium text-slate-900">
                "{fileOperations.fileToDelete?.name}"
              </span>{' '}
              吗？
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="p-6 pt-4 bg-slate-50/50 border-t border-slate-200/50 flex space-x-3">
            <Button
              variant="outline"
              onClick={fileOperations.cancelDelete}
              className="flex-1 bg-transparent hover:bg-slate-100 transition-colors"
            >
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                fileOperations.confirmDelete().then(() => {
                  triggerRefresh('latestDoc');
                });
              }}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white transition-colors"
            >
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 分享对话框 */}
      {shareDialogFile && (
        <ShareDialog
          file={shareDialogFile}
          isOpen={shareDialogOpen}
          onClose={() => {
            setShareDialogOpen(false);
            setShareDialogFile(null);
          }}
        />
      )}
    </div>
  );
};

export default Page;
