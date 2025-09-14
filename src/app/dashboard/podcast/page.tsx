'use client';

import { useEffect, useState } from 'react';
import { Play } from 'lucide-react';

// import { formatBytes } from '@/utils/file';
import { Button } from '@/components/ui/button';
// import { Pagination } from '@/components/ui/pagination';
import PodcastApi from '@/services/podcast';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Podcast } from '@/services/podcast';

const PodcastPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [list, setList] = useState<Podcast[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await PodcastApi.getList({
          page: currentPage,
          limit,
        });

        if (result?.data?.code === 200 && result?.data?.data) {
          const { podcasts, total } = result.data?.data;
          setList(podcasts);
          setTotal(total);
          setCurrentPage(currentPage + 1);
          console.log('total', total);
        }
      } catch (error) {
        console.error('加载播客列表失败:', error);
      }
    };

    fetchData();
  }, [currentPage, limit]);

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div>{total}</div>
      {/* 播客列表区域 */}
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
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">
                      {podcast.content?.split('\n')[0]?.substring(0, 40)}
                    </h3>
                    <span className="text-muted-foreground text-sm">
                      {/* {formatDistanceToNow(new Date(podcast.created_at), { addSuffix: true })} */}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {podcast.content?.replace(/\n/g, ' ')}
                  </p>
                  <div className="flex items-center gap-4 mt-4">
                    <Button variant="ghost" size="sm" className="space-x-2">
                      <Play className="h-4 w-4" />
                      <span>播放</span>
                    </Button>
                    <div className="flex items-center text-sm text-muted-foreground">
                      {podcast.user?.name}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* 分页组件 */}
      {/* <Pagination
        current={currentPage}
        total={total}
        pageSize={pageSize}
        onChange={setCurrentPage}
        className="mt-6"
      /> */}
    </div>
  );
};

export default PodcastPage;
