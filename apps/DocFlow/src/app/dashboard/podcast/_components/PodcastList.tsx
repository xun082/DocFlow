'use client';

import { Play, Pause, ChevronDown } from 'lucide-react';
import { useState } from 'react';

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Podcast } from '@/services/podcast/type';

// 对话消息类型
interface DialogueMessage {
  role: 'interviewer' | 'candidate';
  content: string;
  emoji: string;
}

// 解析播客内容为对话格式
function parsePodcastContent(content: string): DialogueMessage[] {
  const lines = content.split('\n').filter((line) => line.trim());
  const messages: DialogueMessage[] = [];

  for (const line of lines) {
    // 匹配 "🤖：" 或 "🐱：" 格式
    const interviewerMatch = line.match(/^(🤖|👨‍💼|👩‍💼)[:：]\s*(.+)$/);
    const candidateMatch = line.match(/^(🐱|👤|🙋‍♂️|🙋‍♀️)[:：]\s*(.+)$/);

    if (interviewerMatch) {
      messages.push({
        role: 'interviewer',
        content: interviewerMatch[2].trim(),
        emoji: interviewerMatch[1],
      });
    } else if (candidateMatch) {
      messages.push({
        role: 'candidate',
        content: candidateMatch[2].trim(),
        emoji: candidateMatch[1],
      });
    }
  }

  return messages;
}

interface PodcastListProps {
  list: Podcast[];
  playingId: string | null;
  isPlaying: boolean;
  handlePlay: (url: string, id: string) => void;
  currentPage: number;
  total: number;
  changePage: (page: number) => void;
  pageSize: number;
  showPagination?: boolean;
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
  showPagination = true,
}: PodcastListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
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
        {list.map((podcast) => {
          const messages = parsePodcastContent(podcast.content);
          const isExpanded = expandedId === podcast.id;

          return (
            <Card
              key={podcast.id}
              className={`group transition-all duration-300 border-0 ${
                isExpanded
                  ? 'bg-gradient-to-r from-blue-50 via-blue-25 to-blue-50 shadow-md ring-1 ring-blue-200'
                  : 'bg-gradient-to-r from-white via-gray-50/30 to-white hover:shadow-md'
              }`}
            >
              <div className="p-6">
                <div className="flex items-start gap-4">
                  {/* 用户头像和信息 */}
                  <div className="flex items-center gap-3 flex-shrink-0">
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
                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => toggleExpand(podcast.id)}
                  >
                    <div
                      className={`space-y-3 transition-all duration-500 ease-in-out overflow-hidden ${
                        isExpanded ? '' : 'max-h-32'
                      }`}
                    >
                      {messages.map((message) => (
                        <div
                          key={podcast.id}
                          className={`flex gap-3 items-start transition-all ${
                            message.role === 'interviewer'
                              ? 'bg-blue-50/50 rounded-lg p-3'
                              : 'bg-green-50/50 rounded-lg p-3'
                          } ${!isExpanded ? 'hover:bg-opacity-70' : 'hover:bg-opacity-80'}`}
                        >
                          <span className="text-2xl flex-shrink-0">{message.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-xs font-medium mb-1 ${
                                message.role === 'interviewer' ? 'text-blue-700' : 'text-green-700'
                              }`}
                            >
                              {message.role === 'interviewer' ? '面试官' : '候选人'}
                            </p>
                            <p className="text-sm text-gray-700 leading-relaxed">
                              {message.content}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* 展开提示 */}
                    {messages.length > 2 && !isExpanded && (
                      <div className="mt-3 flex items-center justify-center gap-1 text-xs text-blue-600 font-medium group-hover:text-blue-700">
                        <ChevronDown className="w-3 h-3 animate-bounce" />
                        <span>展开全部</span>
                      </div>
                    )}
                  </div>

                  {/* 播放控制区域 */}
                  <div className="flex flex-col items-center gap-2 flex-shrink-0">
                    <button
                      type="button"
                      className={`h-12 w-12 rounded-full transition-all duration-200 flex items-center justify-center ${
                        playingId === podcast.id && isPlaying
                          ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg'
                          : 'bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg'
                      }`}
                      onClick={() => handlePlay(podcast.audio_url, podcast.id)}
                      aria-label={playingId === podcast.id && isPlaying ? '暂停' : '播放'}
                    >
                      {playingId === podcast.id && isPlaying ? (
                        <Pause className="h-5 w-5" />
                      ) : (
                        <Play className="h-5 w-5 ml-0.5" />
                      )}
                    </button>

                    {/* 播放状态指示器 */}
                    <div className="flex items-center gap-1 h-4">
                      {playingId === podcast.id && isPlaying && (
                        <>
                          <div className="w-1 h-3 bg-red-400 rounded-full animate-pulse" />
                          <div className="w-1 h-2 bg-red-400 rounded-full animate-pulse delay-75" />
                          <div className="w-1 h-4 bg-red-400 rounded-full animate-pulse delay-150" />
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
          );
        })}
      </div>

      {/* 分页组件 */}
      {showPagination && total > pageSize && (
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
