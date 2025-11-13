'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BookOpen } from 'lucide-react';

import { KnowledgeCard } from './KnowledgeCard';
import { KnowledgeListSkeleton } from './KnowledgeListSkeleton';

import { KnowledgeApi } from '@/services/knowledge';
import { GetKnowledgeParams, ApiKnowledgeItem } from '@/services/knowledge/types';
import { Button } from '@/components/ui/button';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

interface KnowledgeListProps {
  onCreateClick: () => void;
  refreshTrigger?: number;
}

export function KnowledgeList({ onCreateClick, refreshTrigger }: KnowledgeListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [knowledgeList, setKnowledgeList] = useState<ApiKnowledgeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const pageSize = 9; // 每页显示9个，3x3网格
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  // 获取知识库列表
  const fetchKnowledgeList = async (page: number = 1) => {
    try {
      setLoading(true);

      const params: GetKnowledgeParams = {
        page,
        limit: pageSize,
      };

      const response = await KnowledgeApi.getKnowledgeList(params, (error) => {
        console.error('获取知识库列表失败:', error);
      });

      if (response?.data?.data) {
        const responseData = response.data.data;
        const knowledgeItems = responseData.data;
        const pagination = responseData.pagination;

        // 使用新的分页结构
        setKnowledgeList(knowledgeItems);
        setTotalCount(pagination.total);
        setTotalPages(pagination.totalPages);
      }
    } catch (error) {
      console.error('获取知识库列表失败:', error);
      setKnowledgeList([]);
    } finally {
      setLoading(false);
    }
  };

  // 初始加载和刷新触发
  useEffect(() => {
    fetchKnowledgeList(currentPage);
  }, [currentPage, refreshTrigger]);

  // 页面变化处理 - 使用查询字符串
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`?${params.toString()}`);
  };

  // 生成分页链接
  const generatePaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // 如果总页数小于等于最大显示页数，显示所有页
      for (let i = 1; i <= totalPages; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              href="#"
              isActive={currentPage === i}
              onClick={(e) => {
                e.preventDefault();
                handlePageChange(i);
              }}
            >
              {i}
            </PaginationLink>
          </PaginationItem>,
        );
      }
    } else {
      // 复杂分页逻辑
      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, currentPage + 2);

      // 第一页
      if (startPage > 1) {
        items.push(
          <PaginationItem key={1}>
            <PaginationLink
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handlePageChange(1);
              }}
            >
              1
            </PaginationLink>
          </PaginationItem>,
        );

        if (startPage > 2) {
          items.push(
            <PaginationItem key="ellipsis-start">
              <PaginationEllipsis />
            </PaginationItem>,
          );
        }
      }

      // 中间页面
      for (let i = startPage; i <= endPage; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              href="#"
              isActive={currentPage === i}
              onClick={(e) => {
                e.preventDefault();
                handlePageChange(i);
              }}
            >
              {i}
            </PaginationLink>
          </PaginationItem>,
        );
      }

      // 最后一页
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          items.push(
            <PaginationItem key="ellipsis-end">
              <PaginationEllipsis />
            </PaginationItem>,
          );
        }

        items.push(
          <PaginationItem key={totalPages}>
            <PaginationLink
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handlePageChange(totalPages);
              }}
            >
              {totalPages}
            </PaginationLink>
          </PaginationItem>,
        );
      }
    }

    return items;
  };

  return (
    <div className="space-y-6">
      {/* 统计信息 */}
      {!loading && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>共 {totalCount} 个知识库</span>
          <span>
            第 {currentPage} 页，共 {totalPages} 页
          </span>
        </div>
      )}

      {/* 加载状态 */}
      {loading && <KnowledgeListSkeleton />}

      {/* 知识库列表 */}
      {!loading && knowledgeList.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {knowledgeList.map((item) => (
            <KnowledgeCard
              key={item.id}
              knowledge={item}
              onClick={() => {
                console.log('点击知识库:', item.title);
              }}
              onDeleted={() => {
                // 删除成功后重新获取当前页列表
                fetchKnowledgeList(currentPage);
              }}
            />
          ))}
        </div>
      )}

      {/* 分页组件 */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();

                    if (currentPage > 1) {
                      handlePageChange(currentPage - 1);
                    }
                  }}
                  className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>

              {generatePaginationItems()}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();

                    if (currentPage < totalPages) {
                      handlePageChange(currentPage + 1);
                    }
                  }}
                  className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* 空状态 */}
      {!loading && knowledgeList.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">暂无知识库</h3>
          <p className="text-muted-foreground mb-4">开始创建您的第一个知识库</p>
          <Button onClick={onCreateClick}>创建知识库</Button>
        </div>
      )}
    </div>
  );
}
