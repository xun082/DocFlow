'use client';

import { useEffect, useState } from 'react';
import { Play } from 'lucide-react';
// import { formatBytes } from '@/utils/file';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
// import { Pagination } from '@/components/ui/pagination';
import PodcastApi from '@/services/podcast';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Podcast } from '@/services/podcast';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

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
        console.log('result', result);

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
  }, [currentPage, limit]);

  const changePage = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      {total}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
        <div className="p-6 text-center">
          <h3 className="text-lg font-semibold text-blue-800 mb-4">上传文件转为AI博客</h3>
          <p className="text-blue-600 text-sm mb-6">将文件转换为结构化音频文件，提升内容传播效率</p>
          <div className="flex justify-center">
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => {
                const fileInput = document.createElement('input');
                fileInput.type = 'file';
                fileInput.accept = '.pdf,.md,.doc,.docx';

                fileInput.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];

                  if (file) {
                    const formData = new FormData();
                    formData.append('file', file);
                    formData.append('interviewer', 'front_end');
                    formData.append('candidate_id', 'hunyin_6');
                    formData.append('interviewer_voice_id', 'Chinese (Mandarin)_News_Anchor');

                    PodcastApi.uploadFile(formData).then((res) => {
                      if (res?.data?.code === 200) {
                        toast.success('上传成功');
                        console.log('上传成功', res);
                        // alert(`文件 "${file.name}" 已上传转为博客`);
                      }
                    });
                  }
                };

                fileInput.click();
              }}
            >
              选择文件
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
                    <span className="text-muted-foreground text-sm">
                      {/* {formatDistanceToNow(new Date(podcast.created_at), { addSuffix: true })} */}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {podcast.content?.replace(/\n/g, ' ')}
                  </p>
                </div>
                <div className="flex flex-col">
                  <Button variant="ghost" size="sm" className="space-x-2">
                    <Play className="h-4 w-4" onClick={() => changePage(1)} />
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
          {Array.from({ length: Math.ceil(total / limit) }, (_, i) => i + 1).map((page) => (
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
                if (currentPage < Math.ceil(total / limit)) changePage(currentPage + 1);
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default PodcastPage;
