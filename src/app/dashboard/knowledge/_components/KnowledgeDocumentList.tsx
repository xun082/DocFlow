'use client';

import { useEffect, useState, useRef, Activity } from 'react';
import {
  FileText,
  Link as LinkIcon,
  RefreshCw,
  ExternalLink,
  Copy,
  Loader2,
  Upload,
  Plus,
  FileIcon,
  Calendar,
  HardDrive,
} from 'lucide-react';
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
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { formatFileSize, formatDateTime, getFileTypeColor } from '@/utils/format';

interface KnowledgeDocumentListProps {
  knowledgeId: number;
}

export default function KnowledgeDocumentList({ knowledgeId }: KnowledgeDocumentListProps) {
  const [detail, setDetail] = useState<KnowledgeDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = async () => {
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
  };

  useEffect(() => {
    fetchDetail();
  }, [knowledgeId]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [addUrlOpen, setAddUrlOpen] = useState(false);
  const [urlValue, setUrlValue] = useState('');
  const [addingUrl, setAddingUrl] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  const handleUploadFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingFile(true);
      toast.info(`正在上传 ${file.name}...`);

      const res = await AiApi.AddKnowledgeFile(knowledgeId, file, {}, (err: unknown) => {
        const message =
          err instanceof Error ? err.message : typeof err === 'string' ? err : '文件上传失败';
        console.error('文件上传失败:', err);
        toast.error(message);
      });

      if (res?.data) {
        toast.success(`文件 ${file.name} 上传成功！`);
        await fetchDetail();
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : typeof err === 'string' ? err : '文件上传失败';
      toast.error(message);
    } finally {
      if (e.target) e.target.value = '';
      setUploadingFile(false);
    }
  };

  const handleAddUrlClick = () => {
    setUrlValue('');
    setAddUrlOpen(true);
  };

  const handleSubmitAddUrl = async () => {
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
          const message =
            err instanceof Error ? err.message : typeof err === 'string' ? err : '添加链接失败';
          console.error('添加链接失败:', err);
          toast.error(message);
        },
      );

      if (res?.data) {
        toast.success('链接已添加成功！');
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
  };

  const copyToClipboard = (text: string, successMsg: string = '已复制到剪贴板') => {
    navigator.clipboard
      .writeText(text)
      .then(() => toast.success(successMsg))
      .catch(() => toast.error('复制失败'));
  };

  return (
    <div className="space-y-6">
      {/* 顶部标题 */}
      <div>
        <h2 className="text-2xl font-bold">知识库文档列表</h2>
        <p className="text-sm text-muted-foreground mt-1">管理和组织您的知识库文档和链接</p>
      </div>

      {/* 统计信息 */}
      {!loading && detail && (
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            <span>{detail?.files?.length ?? 0} 个文件</span>
          </div>
          <div className="flex items-center gap-1">
            <LinkIcon className="h-4 w-4" />
            <span>{detail?.urls?.length ?? 0} 个链接</span>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* 加载状态 */}
      {loading && !detail && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-6 bg-muted animate-pulse rounded w-24" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="h-16 bg-muted animate-pulse rounded" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {detail && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 文件列表 */}
          <Card className="relative">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  文件
                  <Badge variant="secondary" className="ml-2">
                    {detail.files?.length ?? 0}
                  </Badge>
                </div>
                {/* 文件操作按钮 */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchDetail}
                    disabled={loading || uploadingFile}
                    className="cursor-pointer"
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleUploadFileClick}
                    disabled={loading || uploadingFile}
                    className="cursor-pointer"
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="max-h-[600px] overflow-y-auto">
              {uploadingFile && (
                <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-600 flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  正在上传文件...
                </div>
              )}
              {detail.files && detail.files.length > 0 ? (
                <ul className="space-y-3">
                  {detail.files.map((f: any) => {
                    const fileName = f.original_filename || f.fileName || `文件 #${f.id}`;
                    const fileExtension = f.file_extension || '';
                    const fileSize = f.file_size || 0;
                    const createdAt = f.created_at || f.createdAt || '';
                    const fileUrl = f.file_url || f.fileUrl || '';
                    const iconColor = getFileTypeColor(fileExtension);

                    return (
                      <li
                        key={f.id}
                        className="group flex items-start gap-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors p-4"
                      >
                        <div className={`flex-shrink-0 ${iconColor}`}>
                          <FileIcon className="h-8 w-8" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <div className="font-medium truncate" title={fileName}>
                                {fileName}
                              </div>
                              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                {fileExtension && (
                                  <Badge variant="outline" className="font-mono">
                                    {fileExtension.replace('.', '').toUpperCase()}
                                  </Badge>
                                )}
                                {fileSize > 0 && (
                                  <span className="flex items-center gap-1">
                                    <HardDrive className="h-3 w-3" />
                                    {formatFileSize(fileSize)}
                                  </span>
                                )}
                              </div>
                              {createdAt && (
                                <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                                  <Calendar className="h-3 w-3" />
                                  {formatDateTime(createdAt, { showSeconds: false })}
                                </div>
                              )}
                            </div>
                            {/* 操作按钮 - 右上角 */}
                            {fileUrl && (
                              <div className="flex items-center gap-1 flex-shrink-0">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  asChild
                                  className="h-8 w-8 cursor-pointer"
                                  title="查看文件"
                                >
                                  <a href={fileUrl} target="_blank" rel="noreferrer">
                                    <ExternalLink className="h-4 w-4" />
                                  </a>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => copyToClipboard(fileUrl, '文件链接已复制')}
                                  className="h-8 w-8 cursor-pointer"
                                  title="复制链接"
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-sm text-muted-foreground mb-4">暂无文件</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleUploadFileClick}
                    disabled={uploadingFile}
                    className="cursor-pointer"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    上传第一个文件
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 链接列表 */}
          <Card className="relative">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <LinkIcon className="h-5 w-5 mr-2" />
                  链接
                  <Badge variant="secondary" className="ml-2">
                    {detail.urls?.length ?? 0}
                  </Badge>
                </div>
                {/* 链接操作按钮 */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchDetail}
                    disabled={loading || uploadingFile}
                    className="cursor-pointer"
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleAddUrlClick}
                    disabled={loading || uploadingFile}
                    className="cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="max-h-[600px] overflow-y-auto">
              {addingUrl && (
                <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-600 flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  正在添加链接...
                </div>
              )}
              {detail.urls && detail.urls.length > 0 ? (
                <ul className="space-y-3">
                  {detail.urls.map((u: any) => {
                    const url = u.url || '';
                    const createdAt = u.created_at || u.createdAt || '';

                    return (
                      <li
                        key={u.id}
                        className="group flex items-start gap-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors p-4"
                      >
                        <div className="flex-shrink-0 text-blue-500">
                          <LinkIcon className="h-8 w-8" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <a
                                href={url}
                                target="_blank"
                                rel="noreferrer"
                                className="font-medium text-primary hover:underline line-clamp-2 break-all"
                                title={url}
                              >
                                {url}
                              </a>
                              {createdAt && (
                                <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                                  <Calendar className="h-3 w-3" />
                                  {formatDateTime(createdAt, { showSeconds: false })}
                                </div>
                              )}
                            </div>
                            {/* 操作按钮 - 右上角 */}
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <Button
                                variant="ghost"
                                size="icon"
                                asChild
                                className="h-8 w-8 cursor-pointer"
                                title="打开链接"
                              >
                                <a href={url} target="_blank" rel="noreferrer">
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => copyToClipboard(url, '链接已复制')}
                                className="h-8 w-8 cursor-pointer"
                                title="复制链接"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="text-center py-12">
                  <LinkIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-sm text-muted-foreground mb-4">暂无链接</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddUrlClick}
                    className="cursor-pointer"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    添加第一个链接
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* 隐藏的文件上传 input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="*/*"
        className="hidden"
        onChange={handleFileInputChange}
      />

      {/* 添加链接对话框 - 使用 Activity 保持状态 */}
      <Dialog open={addUrlOpen} onOpenChange={setAddUrlOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>添加链接到知识库</DialogTitle>
            <DialogDescription>添加网页、文档或其他在线资源的链接到您的知识库</DialogDescription>
          </DialogHeader>
          <Activity mode={addUrlOpen ? 'visible' : 'hidden'}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="kb-url">链接 URL *</Label>
                <Input
                  id="kb-url"
                  type="url"
                  placeholder="https://example.com/article"
                  value={urlValue}
                  onChange={(e) => setUrlValue(e.target.value)}
                  disabled={addingUrl}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !addingUrl) {
                      handleSubmitAddUrl();
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  请输入完整的 URL，包括 https:// 或 http://
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setAddUrlOpen(false)}
                disabled={addingUrl}
                className="cursor-pointer"
              >
                取消
              </Button>
              <Button
                onClick={handleSubmitAddUrl}
                disabled={addingUrl || !urlValue.trim()}
                className="cursor-pointer disabled:cursor-not-allowed"
              >
                {addingUrl ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    添加中...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    添加链接
                  </>
                )}
              </Button>
            </DialogFooter>
          </Activity>
        </DialogContent>
      </Dialog>
    </div>
  );
}
