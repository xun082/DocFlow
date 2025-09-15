'use client';

import { Play, Pause } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

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
  expandedIds: Set<string>;
  playingId: string | null;
  isPlaying: boolean;
  toggleExpand: (id: string) => void;
  handlePlay: (url: string, id: string) => void;
  currentPage: number;
  total: number;
  changePage: (page: number) => void;
  pageSize: number;
}

export function PodcastList({
  list,
  expandedIds,
  playingId,
  isPlaying,
  toggleExpand,
  handlePlay,
  currentPage,
  total,
  changePage,
  pageSize,
}: PodcastListProps) {
  return (
    <>
      <div className="space-y-4">
        {list.map((podcast) => (
          <Card key={podcast.id} className="hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-4 p-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={podcast.user?.avatar_url} />
                <AvatarFallback>{podcast.user?.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 flex">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">
                    {podcast.content?.split('\n')[0]?.substring(0, 40)}
                  </h3>
                </div>

                {expandedIds.has(podcast.id) ? (
                  <div className="text-sm text-muted-foreground mt-2">
                    <ReactMarkdown>{podcast.content}</ReactMarkdown>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    <ReactMarkdown>{podcast.content}</ReactMarkdown>
                  </div>
                )}
                <Button
                  variant="link"
                  className="text-sm p-0 h-auto ml-2"
                  onClick={() => toggleExpand(podcast.id)}
                >
                  {expandedIds.has(podcast.id) ? '收起' : '展开全部'}
                </Button>
              </div>
              <div className="flex flex-col">
                <Button
                  variant="ghost"
                  size="sm"
                  className="space-x-2"
                  onClick={() => handlePlay(podcast.audio_url, podcast.id)}
                >
                  {playingId === podcast.id && isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
                <div className="flex items-center text-sm text-muted-foreground">
                  {podcast.user?.name}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* 分页组件 */}
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
    </>
  );
}
