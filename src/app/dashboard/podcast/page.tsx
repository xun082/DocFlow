'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAudioPlayer } from 'react-use-audio-player';
import { toast } from 'sonner';

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
  const searchParams = useSearchParams();
  const router = useRouter();

  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const [total, setTotal] = useState<number>(0);
  const [list, setList] = useState<Podcast[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const { podcastTasks, connect, isConnected, clearCompletedTasks } = useNotificationSocket();

  // 监听播客任务完成状态
  useEffect(() => {
    const completedTasks = Array.from(podcastTasks.values()).filter(
      (task) => task.status === 'completed',
    );

    if (completedTasks.length > 0) {
      // 延迟3秒后执行清理和刷新，让用户看到完成状态
      const timer = setTimeout(async () => {
        // 先刷新播客列表
        try {
          const result = await PodcastApi.getList({
            page: currentPage,
            limit: DEFAULT_PAGE_SIZE,
          });

          if (result?.data?.code === 200 && result?.data?.data) {
            const { podcasts, total } = result.data?.data;
            setList(podcasts);
            setTotal(total);
            console.log('✅ 播客列表已刷新，发现新内容');
          }
        } catch (error) {
          console.error('刷新播客列表失败:', error);
        }

        // 然后清理已完成的任务（隐藏状态栏）
        clearCompletedTasks();
        console.log('🧹 已清理完成的播客任务');

        // 显示成功提示
        toast.success('🎉 播客生成完成！列表已更新', {
          description: '您的新播客已经可以播放了',
          duration: 4000,
        });
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [podcastTasks, currentPage, clearCompletedTasks]);

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
    // 使用查询字符串更新页码
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`?${params.toString()}`);
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
