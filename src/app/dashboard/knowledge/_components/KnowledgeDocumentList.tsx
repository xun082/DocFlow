'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { FileText, Link as LinkIcon, RefreshCw, MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';

import { AiApi } from '@/services/ai';
import type { KnowledgeDetail } from '@/services/ai/type';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface KnowledgeDocumentListProps {
  knowledgeId: number;
}

export default function KnowledgeDocumentList({ knowledgeId }: KnowledgeDocumentListProps) {
  const [detail, setDetail] = useState<KnowledgeDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await AiApi.GetKnowledgeById(knowledgeId, (err) => {
        console.error('获取知识库详情失败:', err);
      });

      if (res?.data) {
        setDetail(res.data?.data ?? null);
      } else {
        setDetail(null);
      }
    } catch (e) {
      console.error(e);
      setError('加载知识库详情失败');
      toast.error('加载知识库详情失败');
    } finally {
      setLoading(false);
    }
  }, [knowledgeId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [addUrlOpen, setAddUrlOpen] = useState(false);
  const [urlValue, setUrlValue] = useState('');
  const [addingUrl, setAddingUrl] = useState(false);

  const handleUploadFileClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileInputChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        setLoading(true);

        const res = await AiApi.AddKnowledgeFile(knowledgeId, file, {}, (err: unknown) => {
          // 统一处理未知错误类型，提取友好提示
          const message =
            err instanceof Error ? err.message : typeof err === 'string' ? err : '添加链接失败';
          console.error('添加链接失败:', err);
          toast.error(message);
        });

        if (res?.data) {
          toast.success('文件已上传');
          await fetchDetail();
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : typeof err === 'string' ? err : '添加链接失败';
        toast.error(message);
      } finally {
        if (e.target) e.target.value = '';
        setLoading(false);
      }
    },
    [knowledgeId, fetchDetail],
  );

  const handleAddUrlClick = useCallback(() => {
    setUrlValue('');
    setAddUrlOpen(true);
  }, []);

  const handleSubmitAddUrl = useCallback(async () => {
    if (!urlValue.trim()) {
      toast.error('链接不能为空');

      return;
    }

    try {
      setAddingUrl(true);

      const res = await AiApi.AddKnowledgeUrl(
        knowledgeId,
        { url: urlValue.trim() },
        (err: unknown) => {
          // 统一处理未知错误类型，提取友好提示
          const message =
            err instanceof Error ? err.message : typeof err === 'string' ? err : '添加链接失败';
          console.error('添加链接失败:', err);
          toast.error(message);
        },
      );

      if (res?.data) {
        toast.success('链接已添加');
        setAddUrlOpen(false);
        setUrlValue('');
        await fetchDetail();
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : typeof err === 'string' ? err : '添加链接失败';
      toast.error(message);
    } finally {
      setAddingUrl(false);
    }
  }, [knowledgeId, urlValue, fetchDetail]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">知识库文档列表</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchDetail} disabled={loading}>
            <RefreshCw className="h-4 w-4 mr-2" /> 刷新
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuLabel>操作</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleUploadFileClick} disabled={loading}>
                <FileText className="h-4 w-4 mr-2" /> 上传文件
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleAddUrlClick} disabled={loading}>
                <LinkIcon className="h-4 w-4 mr-2" /> 添加链接
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled>
                文件 {detail?.files?.length ?? 0} · 链接 {detail?.urls?.length ?? 0}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {error && <div className="text-sm text-red-500">{error}</div>}

      {detail && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" /> 文件
                <span className="ml-2 text-sm text-muted-foreground">
                  {detail.files?.length ?? 0}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {detail.files && detail.files.length > 0 ? (
                <ul className="space-y-3">
                  {detail.files.map((f) => (
                    <li
                      key={f.id}
                      className="flex items-center justify-between rounded-md border px-3 py-2"
                    >
                      <div className="min-w-0">
                        <div className="truncate font-medium">文档ID：{f.id}</div>
                        <div className="text-xs text-muted-foreground">
                          创建时间：{f.created_at}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-sm text-muted-foreground">暂无文件</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <LinkIcon className="h-5 w-5 mr-2" /> 链接
                <span className="ml-2 text-sm text-muted-foreground">
                  {detail.urls?.length ?? 0}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {detail.urls && detail.urls.length > 0 ? (
                <ul className="space-y-3">
                  {detail.urls.map((u) => (
                    <li
                      key={u.id}
                      className="flex items-center justify-between rounded-md border px-3 py-2"
                    >
                      <div className="flex gap-1 items-center min-w-0">
                        <span className="text-sm">链接URL：</span>
                        <a
                          href={u.url}
                          target="_blank"
                          rel="noreferrer"
                          className="truncate block text-sm text-primary hover:underline"
                        >
                          {u.url}
                        </a>
                        <div className="text-xs text-muted-foreground">{u.createdAt}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-sm text-muted-foreground">暂无链接</div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="*/*"
        className="hidden"
        onChange={handleFileInputChange}
      />
      <Dialog open={addUrlOpen} onOpenChange={setAddUrlOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>添加链接到知识库</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="kb-url">链接 URL</Label>
              <Input
                id="kb-url"
                placeholder="https://example.com/article"
                value={urlValue}
                onChange={(e) => setUrlValue(e.target.value)}
                disabled={addingUrl}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddUrlOpen(false)} disabled={addingUrl}>
              取消
            </Button>
            <Button onClick={handleSubmitAddUrl} disabled={addingUrl}>
              {addingUrl ? '添加中...' : '添加'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
