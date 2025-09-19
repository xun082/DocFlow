'use client';

import { Play, Pause } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useState } from 'react';

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Podcast } from '@/services/podcast/type';

interface PodcastListProps {
  list: Podcast[];
  playingId: string | null;
  isPlaying: boolean;
  handlePlay: (url: string, id: string) => void;
  currentPage: number;
  total: number;
  changePage: (page: number) => void;
  pageSize: number;
}

export function PodcastList({
  list,
  playingId,
  isPlaying,
  handlePlay,
  currentPage,
  total,
  changePage,
  pageSize,
}: PodcastListProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const newSet = new Set(prev);

      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }

      return newSet;
    });
  };

  // 如果没有播客数据，显示空状态
  if (list.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
          <svg
            className="w-8 h-8 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">暂无播客内容</h3>
        <p className="text-gray-500 mb-6">上传简历后将生成AI播客内容</p>
        <div className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          请先上传简历文件
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {list.map((podcast) => (
          <Card
            key={podcast.id}
            className="group hover:shadow-md transition-all duration-200 border-0 bg-gradient-to-r from-white via-gray-50/30 to-white"
          >
            <div className="p-6">
              <div className="flex items-start gap-4">
                {/* 用户头像和信息 */}
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 ring-2 ring-gray-100">
                    <AvatarImage src={podcast.user?.avatar_url} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-sm font-semibold">
                      {podcast.user?.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block">
                    <p className="text-sm font-medium text-gray-900">{podcast.user?.name}</p>
                    <p className="text-xs text-gray-500">面试专家</p>
                  </div>
                </div>

                {/* 内容区域 */}
                <div className="flex-1 min-w-0">
                  <div className="prose prose-sm max-w-none">
                    {expandedIds.has(podcast.id) ? (
                      <div className="text-gray-700 leading-relaxed">
                        <ReactMarkdown>{podcast.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <div className="text-gray-700 leading-relaxed line-clamp-3">
                        <ReactMarkdown>{podcast.content}</ReactMarkdown>
                      </div>
                    )}
                  </div>

                  {/* 展开/收起按钮 */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-0 h-auto mt-2 text-xs font-medium"
                    onClick={() => toggleExpand(podcast.id)}
                  >
                    {expandedIds.has(podcast.id) ? '收起' : '展开全部'}
                  </Button>
                </div>

                {/* 播放控制区域 */}
                <div className="flex flex-col items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-12 w-12 rounded-full transition-all duration-200 ${
                      playingId === podcast.id && isPlaying
                        ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg'
                        : 'bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg'
                    }`}
                    onClick={() => handlePlay(podcast.audio_url, podcast.id)}
                  >
                    {playingId === podcast.id && isPlaying ? (
                      <Pause className="h-5 w-5" />
                    ) : (
                      <Play className="h-5 w-5 ml-0.5" />
                    )}
                  </Button>

                  {/* 播放状态指示器 */}
                  <div className="flex items-center gap-1">
                    {playingId === podcast.id && isPlaying && (
                      <>
                        <div className="w-1 h-3 bg-red-400 rounded-full animate-pulse"></div>
                        <div className="w-1 h-2 bg-red-400 rounded-full animate-pulse delay-75"></div>
                        <div className="w-1 h-4 bg-red-400 rounded-full animate-pulse delay-150"></div>
                      </>
                    )}
                  </div>

                  <span className="text-xs text-gray-500 font-medium">
                    {playingId === podcast.id && isPlaying ? '播放中' : 'AI播客'}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* 分页组件 */}
      {total > pageSize && (
        <Pagination className="mt-6">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage > 1) changePage(currentPage - 1);
                }}
              />
            </PaginationItem>
            {Array.from({ length: Math.ceil(total / pageSize) }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  href="#"
                  isActive={page === currentPage}
                  onClick={(e) => {
                    e.preventDefault();
                    changePage(page);
                  }}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage < Math.ceil(total / pageSize)) changePage(currentPage + 1);
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </>
  );
}
