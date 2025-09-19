'use client';

import { useEffect, useState } from 'react';
import { useAudioPlayer } from 'react-use-audio-player';

import { PodcastListSkeleton } from './_components/PodcastListSkeleton';
import { PodcastList } from './_components/PodcastList';
import { UploadResumeCard } from './_components/UploadResumeCard';
import { PodcastTaskList } from './_components/PodcastTaskList';

import PodcastApi from '@/services/podcast';
import { Podcast } from '@/services/podcast/type';
import { useNotificationSocket } from '@/hooks/ws/useNotificationSocket';

const DEFAULT_PAGE_SIZE = 10;
const INITIAL_VOLUME = 0.75;

const PodcastPage = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const [list, setList] = useState<Podcast[]>([]);
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

  const { load, isPlaying, togglePlayPause } = useAudioPlayer();

  const handleUploadSuccess = () => {
    if (!isConnected) {
      connect();
    } else {
      console.log('WebSocket已连接');
    }
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

  return (
    <div className="max-w-6xl mx-auto p-4">
      <UploadResumeCard onUploadSuccess={handleUploadSuccess} />

      {/* 只在有任务时显示任务列表 */}
      {podcastTasks.size > 0 && <PodcastTaskList tasks={podcastTasks} />}

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
