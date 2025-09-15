'use client';

import { useEffect, useState } from 'react';
import { Play, Pause } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import { useAudioPlayer } from 'react-use-audio-player';

import { Button } from '@/components/ui/button';
import PodcastApi from '@/services/podcast';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Podcast } from '@/services/podcast/type';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const DEFAULT_PAGE_SIZE = 10;
const INITIAL_VOLUME = 0.75;
const INTERVIEWER_OPTIONS = [
  { value: 'front_end', label: '前端面试官' },
  { value: 'hrbp', label: 'HRBP面试官' },
  { value: 'marketing_manager', label: '经理面试官' },
];
const CANDIDATE_ID = 'hunyin_6';
const VOICE_ID = 'Chinese (Mandarin)_News_Anchor';
const SUPPORTED_FILE_TYPES = '.pdf,.md,.doc,.docx';

const PodcastPage = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const [list, setList] = useState<Podcast[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [interviewer, setInterviewer] = useState<string>('front_end');
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
  const [playingId, setPlayingId] = useState<string | null>(null);

  const audioConfig = {
    html5: true,
    initialVolume: INITIAL_VOLUME,
    onend: () => setPlayingId(null),
  };

  const handlePlay = (url: string, id: string) => {
    if (playingId === id) {
      togglePlayPause();
    } else {
      if (playingId && isPlaying) {
        togglePlayPause();
        setTimeout(() => {
          setPlayingId(id);
          load(url, {
            ...audioConfig,
            onload: () => {
              if (!isPlaying) {
                togglePlayPause();
              }
            },
          });
        }, 100);
      } else {
        setPlayingId(id);
        load(url, {
          ...audioConfig,
          onload: () => {
            if (!isPlaying) {
              togglePlayPause();
            }
          },
        });
      }
    }
  };

  const handleFileUpload = async () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = SUPPORTED_FILE_TYPES;

    fileInput.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('interviewer', interviewer);
        formData.append('candidate_id', CANDIDATE_ID);
        formData.append('interviewer_voice_id', VOICE_ID);
        setIsUploading(true);

        const res = await PodcastApi.uploadFile(formData);
        toast(res?.data?.code === 200 ? '上传成功' : '上传失败');
      } catch (error) {
        console.error('上传失败:', error);
        toast.error('上传失败');
      } finally {
        setIsUploading(false);
      }
    };

    fileInput.click();
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await PodcastApi.getList({
          page: currentPage,
          limit: DEFAULT_PAGE_SIZE,
        });

        if (result?.data?.code === 200 && result?.data?.data) {
          const { podcasts, total } = result.data?.data;
          setList(podcasts);
          setTotal(total);
        }
      } catch (error) {
        console.error('加载播客列表失败:', error);
      }
    };

    fetchData();
  }, [currentPage]);

  const changePage = (page: number) => {
    setCurrentPage(page);
  };

  const { load, isPlaying, togglePlayPause } = useAudioPlayer();

  return (
    <div className="max-w-6xl mx-auto p-4">
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
        <div className="p-6 text-center">
          <h3 className="text-lg font-semibold text-blue-800 mb-4">上传简历转为AI博客</h3>
          <p className="text-blue-600 text-sm mb-6">将文件转换为结构化音频文件，提升内容传播效率</p>
          <div className="flex justify-center">
            <Select onValueChange={setInterviewer} defaultValue="front_end">
              <SelectTrigger className="w-[200px] mb-4">
                <SelectValue placeholder="选择面试官" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>面试官</SelectLabel>
                  {INTERVIEWER_OPTIONS.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white ml-4"
              disabled={isUploading}
              onClick={handleFileUpload}
            >
              {isUploading ? '上传中...' : '上传简历'}
            </Button>
          </div>
          <p className="text-xs text-blue-500 mt-4">支持word、md、ppt、pdf等常见文件格式</p>
        </div>
      </Card>
      <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
        <div className="mb-4 pb-3 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">播客列表</h2>
          <p className="text-gray-500 text-sm mt-1">最新更新的播客内容</p>
        </div>

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
          {Array.from({ length: Math.ceil(total / DEFAULT_PAGE_SIZE) }, (_, i) => i + 1).map(
            (page) => (
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
            ),
          )}
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (currentPage < Math.ceil(total / DEFAULT_PAGE_SIZE)) changePage(currentPage + 1);
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default PodcastPage;
