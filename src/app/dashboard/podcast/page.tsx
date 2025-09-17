'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAudioPlayer } from 'react-use-audio-player';

import { PodcastListSkeleton } from './_components/PodcastListSkeleton';
import { PodcastList } from './_components/PodcastList';

import { Button } from '@/components/ui/button';
import PodcastApi from '@/services/podcast';
import { Card } from '@/components/ui/card';
import { Podcast } from '@/services/podcast/type';
import { useNotificationSocket } from '@/hooks/ws/useNotificationSocket';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

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

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [playingId, setPlayingId] = useState<string | null>(null);

  const { podcastTasks, connect, isConnected } = useNotificationSocket();

  const audioConfig = {
    html5: true,
    initialVolume: INITIAL_VOLUME,
    autoPlay: true,
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

        const res = await PodcastApi.uploadFileAsync(formData);

        // 上传成功后，确保WebSocket已连接
        if (res?.data?.code === 200) {
          toast.success('上传成功');

          if (!isConnected) {
            connect();
          } else {
            console.log('WebSocket已连接');
          }
        } else {
          toast.error('上传失败');
        }
      } catch (error) {
        console.error('上传失败:', error);
        toast.error('上传失败');
      } finally {
        setIsUploading(false);
      }
    };

    fileInput.click();
  };

  // 加载播客列表
  useEffect(() => {
    setIsLoading(true);

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
      } finally {
        setIsLoading(false);
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

      {/* 循环遍历任务列表 */}

      <div className="bg-white rounded-xl shadow-sm p-6 mt-6 transition-all duration-300 hover:shadow-md">
        <div className="mb-4 pb-3 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">简历转播客列表</h2>
          <span className="text-sm text-gray-500">共 {podcastTasks.size} 个任务</span>
        </div>

        {/* 空状态处理 */}
        {podcastTasks.size === 0 ? (
          <div className="py-10 text-center">
            <div className="inline-block p-4 rounded-full bg-gray-100 mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <p className="text-gray-500">暂无播客任务</p>
            <p className="text-gray-400 text-sm mt-1">上传文件后将显示任务进度</p>
          </div>
        ) : (
          <div className="space-y-4">
            {[...podcastTasks].map(([jobId, task]) => (
              <div
                key={jobId}
                className="p-4 border border-gray-100 rounded-lg transition-all duration-300 hover:border-blue-200 hover:bg-blue-50/50"
              >
                <div className="flex flex-wrap justify-between items-start gap-4">
                  <div className="flex-1 min-w-[200px]">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-gray-500 text-sm">状态：</p>
                      <Badge
                        className={`
                            ${
                              task.status === 'completed'
                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                : task.status === 'failed'
                                  ? 'bg-red-100 text-red-800 hover:bg-red-200'
                                  : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                            }
                            transition-all duration-300
                          `}
                      >
                        {task.status === 'completed'
                          ? '已完成'
                          : task.status === 'failed'
                            ? '失败'
                            : '处理中'}
                      </Badge>
                    </div>

                    {task.progress !== undefined && (
                      <div className="mt-3">
                        <div className="flex justify-between items-center mb-1">
                          <p className="text-gray-500 text-sm">进度：</p>
                          <p className="text-sm font-medium">{task.progress}%</p>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className={`
                                h-2.5 rounded-full transition-all duration-1000 ease-out
                                ${
                                  task.status === 'completed'
                                    ? 'bg-green-500'
                                    : task.status === 'failed'
                                      ? 'bg-red-500'
                                      : 'bg-blue-500'
                                }
                              `}
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end">
                    {task.jobId && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">任务ID：</span>
                        <span className="text-xs text-gray-400 font-mono truncate max-w-[100px]">
                          {task.jobId.substring(0, 8)}...
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
        <div className="mb-4 pb-3 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">播客列表</h2>
          <p className="text-gray-500 text-sm mt-1">最新更新的播客内容</p>
        </div>

        {isLoading ? (
          <PodcastListSkeleton />
        ) : (
          <PodcastList
            list={list}
            playingId={playingId}
            isPlaying={isPlaying}
            handlePlay={handlePlay}
            currentPage={currentPage}
            total={total}
            changePage={changePage}
            pageSize={DEFAULT_PAGE_SIZE}
          />
        )}
      </div>
    </div>
  );
};

export default PodcastPage;
