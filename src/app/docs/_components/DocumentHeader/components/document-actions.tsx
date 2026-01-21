'use client';

import { useState } from 'react';
import { MoreHorizontal } from 'lucide-react';
import juice from 'juice';
import { toast } from 'sonner';

import ShareDialog from '../../DocumentSidebar/folder/ShareDialog';
import BlogDialog from '../../DocumentSidebar/folder/BlogDialog';
import HistoryPanel from '../../HistoryPanel';
import { useBlogPublish } from '../hooks/use-blog-publish';
import type { DocumentActionsProps, ExportAction } from '../types';

import type { FileItem } from '@/types/file-system';
import { useCommentStore } from '@/stores/commentStore';
import {
  cleanElementAttributes,
  extraCss,
  processImages,
  processLinks,
  handleExportPDF,
  handleExportDOCX,
} from '@/utils';
import {
  Menu as PopoverMenu,
  Item as PopoverItem,
  CategoryTitle as PopoverCategoryTitle,
} from '@/components/ui/PopoverMenu';

// PDF 图标组件
function PdfIcon() {
  return (
    <svg
      viewBox="0 0 1024 1024"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
    >
      <path
        d="M582.4 864H170.666667c-6.4 0-10.666667-4.266667-10.666667-10.666667V170.666667c0-6.4 4.266667-10.666667 10.666667-10.666667h309.333333V320c0 40.533333 34.133333 74.666667 74.666667 74.666667h160v38.4c0 17.066667 14.933333 32 32 32s32-14.933333 32-32V298.666667c0-8.533333-4.266667-17.066667-8.533334-23.466667l-170.666666-170.666667c-6.4-6.4-14.933333-8.533333-23.466667-8.533333H170.666667C130.133333 96 96 130.133333 96 170.666667v682.666666c0 40.533333 34.133333 74.666667 74.666667 74.666667h411.733333c17.066667 0 32-14.933333 32-32s-14.933333-32-32-32z m132.266667-550.4v17.066667H554.666667c-6.4 0-10.666667-4.266667-10.666667-10.666667V160h19.2l151.466667 153.6z"
        fill="currentColor"
      />
      <path
        d="M332.8 533.333333c-12.8 0-19.2 2.133333-25.6 6.4-6.4 4.266667-8.533333 12.8-8.533333 23.466667v206.933333c0 6.4 2.133333 12.8 6.4 19.2 4.266667 4.266667 10.666667 8.533333 21.333333 8.533334s17.066667-4.266667 21.333333-8.533334c4.266667-4.266667 6.4-10.666667 6.4-19.2v-64h32c57.6 0 89.6-29.866667 89.6-87.466666 0-27.733333-8.533333-51.2-23.466666-64-14.933333-14.933333-36.266667-21.333333-66.133334-21.333334h-53.333333z m87.466667 85.333334c0 12.8-2.133333 23.466667-8.533334 27.733333-4.266667 4.266667-14.933333 8.533333-27.733333 8.533333h-32v-70.4H384c12.8 0 21.333333 2.133333 27.733333 8.533334 6.4 4.266667 8.533333 12.8 8.533334 25.6zM667.733333 571.733333c-8.533333-12.8-21.333333-21.333333-34.133333-29.866666-14.933333-4.266667-32-8.533333-51.2-8.533334h-61.866667c-8.533333 0-17.066667 0-23.466666 8.533334-2.133333 4.266667-4.266667 10.666667-4.266667 19.2V768c0 8.533333 2.133333 14.933333 4.266667 19.2 6.4 8.533333 14.933333 8.533333 23.466666 8.533333h64c19.2 0 34.133333-4.266667 49.066667-10.666666 12.8-6.4 25.6-17.066667 34.133333-29.866667 8.533333-12.8 14.933333-25.6 19.2-42.666667 4.266667-14.933333 6.4-32 6.4-49.066666 0-17.066667-2.133333-34.133333-6.4-49.066667-4.266667-14.933333-10.666667-29.866667-19.2-42.666667z m-42.666666 153.6c-8.533333 12.8-21.333333 19.2-38.4 19.2h-38.4v-160H576c21.333333 0 38.4 6.4 46.933333 19.2 10.666667 12.8 14.933333 34.133333 14.933334 59.733334 2.133333 27.733333-4.266667 46.933333-12.8 61.866666zM851.2 533.333333h-106.666667c-8.533333 0-17.066667 2.133333-21.333333 6.4-6.4 4.266667-8.533333 12.8-8.533333 21.333334v209.066666c0 6.4 2.133333 12.8 6.4 17.066667 4.266667 6.4 10.666667 8.533333 21.333333 8.533333 8.533333 0 17.066667-2.133333 21.333333-8.533333 2.133333-4.266667 6.4-8.533333 6.4-19.2v-85.333333h72.533334c12.8 0 23.466667-6.4 25.6-17.066667 2.133333-8.533333 2.133333-14.933333 0-17.066667-2.133333-4.266667-6.4-17.066667-25.6-17.066666H768v-49.066667h81.066667c8.533333 0 14.933333-2.133333 19.2-4.266667 4.266667-2.133333 8.533333-8.533333 8.533333-21.333333 2.133333-12.8-8.533333-23.466667-25.6-23.466667z"
        fill="currentColor"
      />
    </svg>
  );
}

export function DocumentActions({
  editor,
  documentId,
  documentTitle,
  doc,
  connectedUsers,
  currentUser,
}: DocumentActionsProps) {
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareDialogFile, setShareDialogFile] = useState<FileItem | null>(null);
  const [blogDialogOpen, setBlogDialogOpen] = useState(false);

  const { isPanelOpen, togglePanel, comments } = useCommentStore();
  const { handleBlogSubmit, isSubmitting } = useBlogPublish(editor, documentTitle);

  // 处理分享按钮点击
  const handleShare = () => {
    if (documentId) {
      const fileItem: FileItem = {
        id: documentId,
        name: documentTitle,
        type: 'file',
        depth: 0,
      };
      setShareDialogFile(fileItem);
      setShareDialogOpen(true);
    }
  };

  // 处理复制按钮点击
  const handleCopy = async () => {
    try {
      const htmlContent = editor.getHTML();

      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlContent;

      cleanElementAttributes(tempDiv);
      processImages(tempDiv);
      processLinks(tempDiv);

      const unsupportedElements = tempDiv.querySelectorAll(
        'script, style, iframe, object, embed, video, audio, canvas, svg, noscript',
      );
      unsupportedElements.forEach((el) => el.remove());

      const processedHTML = tempDiv.innerHTML;

      const inlinedHTML = juice(processedHTML, {
        removeStyleTags: true,
        preserveImportant: true,
        applyWidthAttributes: true,
        applyHeightAttributes: true,
        applyAttributesTableElements: true,
        extraCss: extraCss,
      });

      const fullHTML = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body>${inlinedHTML}</body></html>`;
      const textContent = tempDiv.innerText || tempDiv.textContent || '';

      const clipboardItem = new ClipboardItem({
        'text/html': new Blob([fullHTML], { type: 'text/html' }),
        'text/plain': new Blob([textContent], { type: 'text/plain' }),
      });

      await navigator.clipboard.write([clipboardItem]);
      toast.success('文档已复制到剪贴板');
    } catch (error) {
      console.error('复制失败:', error);
      toast.error('复制失败');
    }
  };

  const handleSelectAction = (value: ExportAction) => {
    switch (value) {
      case 'copy':
        handleCopy();
        break;
      case 'pdf':
        handleExportPDF(documentTitle);
        break;
      case 'docx':
        handleExportDOCX(documentTitle, editor);
        break;
      case 'blog':
        setBlogDialogOpen(true);
        break;
    }
  };

  const onBlogSubmit = async (data: {
    title?: string;
    summary?: string;
    category?: string;
    tags: string[];
    coverImage?: string;
  }) => {
    const success = await handleBlogSubmit(data);

    if (success) {
      setBlogDialogOpen(false);
    }
  };

  return (
    <>
      <PopoverMenu
        trigger={
          <button
            type="button"
            className="flex items-center space-x-2 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200 border border-gray-200 dark:border-gray-700 cursor-pointer"
          >
            <MoreHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline text-sm font-medium">操作</span>
          </button>
        }
        customTrigger
      >
        <PopoverCategoryTitle>协作与分享</PopoverCategoryTitle>
        <PopoverItem
          label={
            <div className="flex w-full items-center justify-between">
              <span>{isPanelOpen ? '关闭评论' : '打开评论'}</span>
              {comments.length > 0 && (
                <span className="ml-2 inline-flex min-w-[1.5rem] items-center justify-center rounded-full bg-blue-500 px-1.5 py-0.5 text-xs font-semibold text-white">
                  {comments.length}
                </span>
              )}
            </div>
          }
          icon="MessageSquare"
          onClick={togglePanel}
        />
        {documentId && <PopoverItem label="分享" icon="Share" onClick={handleShare} />}

        <PopoverCategoryTitle>文档操作</PopoverCategoryTitle>
        {documentId && doc && (
          <HistoryPanel
            documentId={documentId}
            doc={doc}
            connectedUsers={connectedUsers}
            currentUser={currentUser}
          />
        )}
        <PopoverItem label="复制到公众号" icon="Copy" onClick={() => handleSelectAction('copy')} />
        <PopoverItem
          label="导出PDF"
          iconComponent={<PdfIcon />}
          onClick={() => handleSelectAction('pdf')}
        />
        <PopoverItem label="导出Word" icon="FileText" onClick={() => handleSelectAction('docx')} />
        <PopoverItem
          label="发布到博客"
          icon="GlobeLock"
          onClick={() => handleSelectAction('blog')}
          disabled={isSubmitting}
        />
      </PopoverMenu>

      {/* 分享对话框 */}
      {shareDialogFile && (
        <ShareDialog
          file={shareDialogFile}
          isOpen={shareDialogOpen}
          onClose={() => {
            setShareDialogOpen(false);
            setShareDialogFile(null);
          }}
        />
      )}

      {/* 博客发布对话框 */}
      <BlogDialog
        isOpen={blogDialogOpen}
        onClose={() => setBlogDialogOpen(false)}
        onSubmit={onBlogSubmit}
        initialTitle={documentTitle}
      />
    </>
  );
}
