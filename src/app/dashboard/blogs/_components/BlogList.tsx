'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FileText } from 'lucide-react';

import { BlogCard, BlogItem } from './BlogCard';
import { BlogListSkeleton } from './BlogListSkeleton';

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

const MOCK_BLOGS: BlogItem[] = [
  {
    id: '1',
    title: 'Next.js 14 新特性详解',
    excerpt: '探索 Next.js 14 带来的革命性功能，包括服务器组件、改进的路由系统和性能优化。',
    coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=450&fit=crop',
    author: { name: '张三', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zhang' },
    createdAt: '2024-01-15',
    views: 1234,
    likes: 89,
    tags: ['Next.js', 'React', '前端'],
  },
  {
    id: '2',
    title: 'TypeScript 最佳实践指南',
    excerpt: '学习如何使用 TypeScript 编写更安全、更可维护的代码，包含实际项目中的最佳实践。',
    coverImage: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&h=450&fit=crop',
    author: { name: '李四', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Li' },
    createdAt: '2024-01-12',
    views: 2567,
    likes: 156,
    tags: ['TypeScript', 'JavaScript'],
  },
  {
    id: '3',
    title: 'React Hooks 深入理解',
    excerpt: '全面解析 React Hooks 的工作原理，掌握 useState、useEffect、useMemo 等高级用法。',
    coverImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=450&fit=crop',
    author: { name: '王五', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Wang' },
    createdAt: '2024-01-10',
    views: 3456,
    likes: 234,
    tags: ['React', 'Hooks', '前端'],
  },
  {
    id: '4',
    title: 'Tailwind CSS 实用技巧',
    excerpt: '分享 Tailwind CSS 的高级技巧，让你的样式开发更加高效和规范。',
    coverImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=450&fit=crop',
    author: { name: '赵六', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zhao' },
    createdAt: '2024-01-08',
    views: 1890,
    likes: 123,
    tags: ['Tailwind', 'CSS', '设计'],
  },
  {
    id: '5',
    title: 'Node.js 性能优化指南',
    excerpt: '深入了解 Node.js 性能优化的核心技术，包括内存管理、异步编程和集群部署。',
    coverImage: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&h=450&fit=crop',
    author: { name: '钱七', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Qian' },
    createdAt: '2024-01-05',
    views: 2345,
    likes: 178,
    tags: ['Node.js', '后端', '性能'],
  },
  {
    id: '6',
    title: 'GraphQL 与 RESTful API 对比',
    excerpt: '分析 GraphQL 和 RESTful API 的优缺点，帮助你做出正确的技术选择。',
    coverImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=450&fit=crop',
    author: { name: '孙八', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sun' },
    createdAt: '2024-01-03',
    views: 1567,
    likes: 95,
    tags: ['GraphQL', 'API', '后端'],
  },
  {
    id: '7',
    title: 'Docker 容器化部署实践',
    excerpt: '从零开始学习 Docker，掌握容器化部署的最佳实践和常见问题解决方案。',
    coverImage: 'https://images.unsplash.com/photo-1605745341112-85968b19335b?w=800&h=450&fit=crop',
    author: { name: '周九', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zhou' },
    createdAt: '2024-01-01',
    views: 2789,
    likes: 201,
    tags: ['Docker', 'DevOps', '部署'],
  },
  {
    id: '8',
    title: '微服务架构设计原则',
    excerpt: '探讨微服务架构的核心设计原则，学习如何构建可扩展的分布式系统。',
    coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=450&fit=crop',
    author: { name: '吴十', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Wu' },
    createdAt: '2023-12-28',
    views: 3456,
    likes: 267,
    tags: ['微服务', '架构', '后端'],
  },
  {
    id: '9',
    title: '前端测试策略与实践',
    excerpt: '全面的，涵盖单元测试前端测试指南、集成测试和 E2E 测试的最佳实践。',
    coverImage: 'https://images.unsplash.com/photo-1551340843-4b496c6e3d15?w=800&h=450&fit=crop',
    author: { name: '郑十一', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zheng' },
    createdAt: '2023-12-25',
    views: 1234,
    likes: 89,
    tags: ['测试', 'Jest', '前端'],
  },
];

interface BlogListProps {
  refreshTrigger?: number;
}

export function BlogList({ refreshTrigger }: BlogListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [blogList, setBlogList] = useState<BlogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const pageSize = 9;
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const fetchBlogList = useCallback(
    (page: number = 1) => {
      try {
        setLoading(true);

        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        const paginatedBlogs = MOCK_BLOGS.slice(start, end);

        setBlogList(paginatedBlogs);
        setTotalCount(MOCK_BLOGS.length);
        setTotalPages(Math.ceil(MOCK_BLOGS.length / pageSize));
      } catch (error) {
        console.error('获取博客列表失败:', error);
        setBlogList([]);
      } finally {
        setLoading(false);
      }
    },
    [pageSize],
  );

  useEffect(() => {
    fetchBlogList(currentPage);
  }, [currentPage, refreshTrigger, fetchBlogList]);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`?${params.toString()}`);
  };

  const generatePaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
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
      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, currentPage + 2);

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
      {!loading && totalCount > 0 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>共 {totalCount} 篇博客</span>
          <span>
            第 {currentPage} 页，共 {totalPages} 页
          </span>
        </div>
      )}

      {loading && <BlogListSkeleton />}

      {!loading && blogList.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogList.map((blog) => (
            <BlogCard key={blog.id} blog={blog} />
          ))}
        </div>
      )}

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

      {!loading && blogList.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">暂无博客</h3>
          <p className="text-muted-foreground mb-4">开始创建您的第一篇博客</p>
          <Button className="cursor-pointer">创建博客</Button>
        </div>
      )}
    </div>
  );
}
