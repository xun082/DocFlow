import { useState } from 'react';
import { MessageSquare, FileText, MoreHorizontal } from 'lucide-react';
import juice from 'juice';
import { toast } from 'sonner';

import ShareDialog from '../DocumentSidebar/folder/ShareDialog';
import BlogDialog from '../DocumentSidebar/folder/BlogDialog';
import HistoryPanel from '../HistoryPanel';

import type { FileItem } from '@/types/file-system';
import { Icon } from '@/components/ui/Icon';
import { useCommentStore } from '@/stores/commentStore';
import { useEditorStore } from '@/stores/editorStore';
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
import { blogsApi } from '@/services/blogs';

// 类型定义
interface CollaborationUser {
  id: string;
  name: string;
  color: string;
  avatar: string;
}

type ExportAction = 'copy' | 'pdf' | 'docx' | 'blog';

// 协作用户头像组件
function UserAvatar({
  user,
  currentUser,
  index,
  total,
}: {
  user: CollaborationUser;
  currentUser?: CollaborationUser | null;
  index: number;
  total: number;
}) {
  return (
    <div className="relative group" style={{ zIndex: 50 + (total - index) }}>
      <div
        className="relative w-8 h-8 rounded-full border-2 shadow-sm hover:scale-110 transition-all duration-200 cursor-pointer bg-white dark:bg-gray-800"
        style={{
          borderColor: user.color || '#3B82F6',
          borderWidth: user.id === currentUser?.id ? '2.5px' : '2px',
        }}
      >
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.name}
            className="w-full h-full object-cover rounded-full"
            onError={(e) => {
              const target = e.currentTarget;
              target.style.display = 'none';

              const fallback = target.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = 'flex';
            }}
          />
        ) : null}

        <div
          className={`absolute inset-0 flex items-center justify-center text-white font-semibold text-xs rounded-full ${
            user.avatar ? 'hidden' : 'flex'
          }`}
          style={{ backgroundColor: user.color || '#3B82F6' }}
        >
          {user.name.charAt(0).toUpperCase()}
        </div>

        <div
          className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-gray-800 shadow-sm"
          style={{ backgroundColor: user.color || '#10B981' }}
        />
      </div>

      {/* 桌面端悬停提示 */}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-[9999] hidden lg:block">
        <div className="flex items-center space-x-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: user.color || '#10B981' }}
          />
          <span className="font-medium">{user.name}</span>
          {user.id === currentUser?.id && <span className="text-green-400 text-xs">(您)</span>}
        </div>
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2">
          <div className="w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900" />
        </div>
      </div>
    </div>
  );
}

interface DocumentHeaderProps {
  provider?: any;
  connectedUsers?: CollaborationUser[];
  currentUser?: CollaborationUser | null;
  // 分享相关属性
  documentId?: string;
  documentName?: string;
  documentTitle?: string; // 添加实际的文档标题字段
  doc?: any; // Yjs 文档实例
}

export default function DocumentHeader({
  provider,
  connectedUsers = [],
  currentUser,
  documentId,
  documentName = '未命名文档',
  documentTitle,
  doc,
}: DocumentHeaderProps) {
  // 判断是否为协作模式
  const isCollaborationMode = provider && Array.isArray(connectedUsers);

  // 合并所有用户（当前用户 + 连接用户）
  const allUsers = [
    ...connectedUsers,
    ...(currentUser && !connectedUsers.find((u) => u.id === currentUser.id) ? [currentUser] : []),
  ];

  // 分享对话框状态
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareDialogFile, setShareDialogFile] = useState<FileItem | null>(null);

  // 博客发布对话框状态
  const [blogDialogOpen, setBlogDialogOpen] = useState(false);

  // 处理博客提交
  const handleBlogSubmit = (data: any) => {
    const htmlContent = editor?.getHTML();
    if (!htmlContent) return;

    blogsApi
      .createBlog({
        title: data.title || displayTitle,
        summary: data.summary || '',
        content: htmlContent,
        category: data.category || 'OTHER',
        tags: data.tags.join(','),
        cover_image: data.coverImage || 'https://example.com/cover.jpg',
      })
      .then(() => {
        toast.success('博客发布成功');
      })
      .catch((error) => {
        toast.error('博客发布失败');
        console.error('发布博客失败:', error);
      });
  };

  const handleSelectAction = (value: ExportAction) => {
    if (value === 'copy') {
      handleCopy();
    } else if (value === 'pdf') {
      handleExportPDF(displayTitle);
    } else if (value === 'docx') {
      handleExportDOCX(displayTitle, editor!);
    } else if (value === 'blog') {
      // 打开博客发布对话框
      const htmlContent = editor?.getHTML();
      console.log('htmlContent', htmlContent);
      setBlogDialogOpen(true);
    }
  };

  // 评论面板状态
  const { isPanelOpen, togglePanel, comments } = useCommentStore();

  // 获取编辑器实例
  const { editor } = useEditorStore();

  // 获取实际显示的标题 - 优先使用documentTitle（真实文档名），其次是documentName，最后是默认值
  const displayTitle = documentTitle || documentName || '未命名文档';

  // 处理分享按钮点击
  const handleShare = () => {
    if (documentId) {
      const fileItem: FileItem = {
        id: documentId,
        name: displayTitle, // 使用实际标题而不是documentName
        type: 'file',
        depth: 0,
      };
      setShareDialogFile(fileItem);
      setShareDialogOpen(true);
    }
  };

  // 处理复制按钮点击
  const handleCopy = async () => {
    if (!editor) return;

    try {
      const htmlContent = editor.getHTML();

      // 创建一个临时div来处理HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlContent;
      // 清理元素属性
      cleanElementAttributes(tempDiv);
      processImages(tempDiv);
      processLinks(tempDiv);

      // 移除微信公众号不支持的元素
      const unsupportedElements = tempDiv.querySelectorAll(
        'script, style, iframe, object, embed, video, audio, canvas, svg, noscript',
      );
      unsupportedElements.forEach((el) => el.remove());

      // 获取处理后的HTML
      const processedHTML = tempDiv.innerHTML;

      // 使用 juice 将 CSS 转换为内联样式
      const inlinedHTML = juice(processedHTML, {
        removeStyleTags: true,
        preserveImportant: true,
        applyWidthAttributes: true,
        applyHeightAttributes: true,
        applyAttributesTableElements: true,
        extraCss: extraCss,
      });

      // 创建完整的HTML文档
      const fullHTML = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body>${inlinedHTML}</body></html>`;

      // 提取纯文本作为备选
      const textContent = tempDiv.innerText || tempDiv.textContent || '';

      // 使用 ClipboardItem 复制富文本格式
      const clipboardItem = new ClipboardItem({
        'text/html': new Blob([fullHTML], { type: 'text/html' }),
        'text/plain': new Blob([textContent], { type: 'text/plain' }),
      });

      await navigator.clipboard.write([clipboardItem]);
      toast.success('文档已复制到剪贴板');
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  return (
    <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-700 min-h-[60px] relative z-10">
      {/* 左侧：文档标题 */}
      <div className="flex items-center space-x-3 min-w-0 flex-1">
        {/* 文档标题 */}
        <div className="flex items-center space-x-2 min-w-0">
          <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
            {displayTitle || (isCollaborationMode ? '协作文档' : '文档编辑器')}
          </h1>
        </div>
      </div>

      {/* 右侧：协作用户列表和操作按钮 */}
      <div className="flex items-center space-x-3 flex-shrink-0">
        {/* 统一的协作用户显示 */}
        {isCollaborationMode && allUsers.length > 0 && (
          <>
            <div className="flex items-center space-x-3 px-3 py-1.5 bg-green-50/80 dark:bg-green-950/30 rounded-lg border border-green-200/50 dark:border-green-800/50">
              {/* 桌面端显示完整信息 */}
              <div className="hidden lg:flex items-center">
                <span className="text-sm font-medium text-green-700 dark:text-green-300">
                  在线协作
                </span>
              </div>

              {/* 用户头像列表 */}
              <div className="flex items-center -space-x-1">
                {allUsers.slice(0, 5).map((user, index) => (
                  <UserAvatar
                    key={user.id}
                    user={user}
                    currentUser={currentUser}
                    index={index}
                    total={allUsers.length}
                  />
                ))}

                {/* 更多用户计数 */}
                {allUsers.length > 5 && (
                  <div className="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 border-2 border-white dark:border-gray-600 rounded-full flex items-center justify-center text-xs font-semibold text-gray-600 dark:text-gray-300 shadow-sm ml-1 hover:scale-105 transition-transform duration-200">
                    +{allUsers.length - 5}
                  </div>
                )}
              </div>

              {/* 用户数量文字说明 */}
              <div className="text-sm font-medium text-green-600 dark:text-green-400">
                <span className="hidden sm:inline">{allUsers.length}位用户在线</span>
                <span className="sm:hidden">{allUsers.length}人</span>
              </div>
            </div>

            {/* 分隔线 */}
            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700"></div>
          </>
        )}

        {/* 评论按钮 */}
        <button
          type="button"
          onClick={togglePanel}
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 border ${
            isPanelOpen
              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700'
          }`}
          aria-label="评论"
        >
          <MessageSquare className="w-4 h-4" />
          <span className="hidden sm:inline text-sm font-medium">评论</span>
          {comments.length > 0 && (
            <span className="px-1.5 py-0.5 text-xs font-semibold rounded-full bg-blue-500 text-white min-w-[20px] text-center">
              {comments.length}
            </span>
          )}
        </button>

        {/* 分享按钮 */}
        {documentId && (
          <button
            type="button"
            onClick={handleShare}
            className="flex items-center space-x-2 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200 border border-gray-200 dark:border-gray-700"
            aria-label="分享文档"
          >
            <Icon name="Share" className="w-4 h-4" />
            <span className="hidden sm:inline text-sm font-medium">分享</span>
          </button>
        )}

        {/* 操作菜单 */}
        {editor && (
          <PopoverMenu
            trigger={
              <button
                type="button"
                className="flex items-center space-x-2 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200 border border-gray-200 dark:border-gray-700"
              >
                <MoreHorizontal className="w-4 h-4" />
                <span className="hidden sm:inline text-sm font-medium">操作</span>
              </button>
            }
            customTrigger
          >
            <PopoverCategoryTitle>文档操作</PopoverCategoryTitle>
            {documentId && doc && (
              <HistoryPanel
                documentId={documentId}
                doc={doc}
                connectedUsers={connectedUsers}
                currentUser={currentUser}
              />
            )}
            <PopoverItem
              label="复制到公众号"
              icon="Copy"
              onClick={() => handleSelectAction('copy')}
            />
            <PopoverItem
              label="导出PDF"
              iconComponent={
                <svg
                  viewBox="0 0 1024 1024"
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  p-id="5061"
                  width="16"
                  height="16"
                >
                  <path
                    d="M582.4 864H170.666667c-6.4 0-10.666667-4.266667-10.666667-10.666667V170.666667c0-6.4 4.266667-10.666667 10.666667-10.666667h309.333333V320c0 40.533333 34.133333 74.666667 74.666667 74.666667h160v38.4c0 17.066667 14.933333 32 32 32s32-14.933333 32-32V298.666667c0-8.533333-4.266667-17.066667-8.533334-23.466667l-170.666666-170.666667c-6.4-6.4-14.933333-8.533333-23.466667-8.533333H170.666667C130.133333 96 96 130.133333 96 170.666667v682.666666c0 40.533333 34.133333 74.666667 74.666667 74.666667h411.733333c17.066667 0 32-14.933333 32-32s-14.933333-32-32-32z m132.266667-550.4v17.066667H554.666667c-6.4 0-10.666667-4.266667-10.666667-10.666667V160h19.2l151.466667 153.6z"
                    fill="#000000"
                    p-id="5062"
                  ></path>
                  <path
                    d="M332.8 533.333333c-12.8 0-19.2 2.133333-25.6 6.4-6.4 4.266667-8.533333 12.8-8.533333 23.466667v206.933333c0 6.4 2.133333 12.8 6.4 19.2 4.266667 4.266667 10.666667 8.533333 21.333333 8.533334s17.066667-4.266667 21.333333-8.533334c4.266667-4.266667 6.4-10.666667 6.4-19.2v-64h32c57.6 0 89.6-29.866667 89.6-87.466666 0-27.733333-8.533333-51.2-23.466666-64-14.933333-14.933333-36.266667-21.333333-66.133334-21.333334h-53.333333z m87.466667 85.333334c0 12.8-2.133333 23.466667-8.533334 27.733333-4.266667 4.266667-14.933333 8.533333-27.733333 8.533333h-32v-70.4H384c12.8 0 21.333333 2.133333 27.733333 8.533334 6.4 4.266667 8.533333 12.8 8.533334 25.6zM667.733333 571.733333c-8.533333-12.8-21.333333-21.333333-34.133333-29.866666-14.933333-4.266667-32-8.533333-51.2-8.533334h-61.866667c-8.533333 0-17.066667 0-23.466666 8.533334-2.133333 4.266667-4.266667 10.666667-4.266667 19.2V768c0 8.533333 2.133333 14.933333 4.266667 19.2 6.4 8.533333 14.933333 8.533333 23.466666 8.533333h64c19.2 0 34.133333-4.266667 49.066667-10.666666 12.8-6.4 25.6-17.066667 34.133333-29.866667 8.533333-12.8 14.933333-25.6 19.2-42.666667 4.266667-14.933333 6.4-32 6.4-49.066666 0-17.066667-2.133333-34.133333-6.4-49.066667-4.266667-14.933333-10.666667-29.866667-19.2-42.666667z m-42.666666 153.6c-8.533333 12.8-21.333333 19.2-38.4 19.2h-38.4v-160H576c21.333333 0 38.4 6.4 46.933333 19.2 10.666667 12.8 14.933333 34.133333 14.933334 59.733334 2.133333 27.733333-4.266667 46.933333-12.8 61.866666zM851.2 533.333333h-106.666667c-8.533333 0-17.066667 2.133333-21.333333 6.4-6.4 4.266667-8.533333 12.8-8.533333 21.333334v209.066666c0 6.4 2.133333 12.8 6.4 17.066667 4.266667 6.4 10.666667 8.533333 21.333333 8.533333 8.533333 0 17.066667-2.133333 21.333333-8.533333 2.133333-4.266667 6.4-8.533333 6.4-19.2v-85.333333h72.533334c12.8 0 23.466667-6.4 25.6-17.066667 2.133333-8.533333 2.133333-14.933333 0-17.066667-2.133333-4.266667-6.4-17.066667-25.6-17.066666H768v-49.066667h81.066667c8.533333 0 14.933333-2.133333 19.2-4.266667 4.266667-2.133333 8.533333-8.533333 8.533333-21.333333 2.133333-12.8-8.533333-23.466667-25.6-23.466667z"
                    fill="#000000"
                    p-id="5063"
                  ></path>
                </svg>
              }
              onClick={() => handleSelectAction('pdf')}
            />
            <PopoverItem
              label="导出Word"
              icon="FileText"
              onClick={() => handleSelectAction('docx')}
            />
            <PopoverItem
              label="发布到博客"
              icon="GlobeLock"
              onClick={() => handleSelectAction('blog')}
            />
          </PopoverMenu>
        )}

        {/* GitHub 链接 */}
        <a
          href="https://github.com/xun082/DocFlow"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200 border border-gray-200 dark:border-gray-700"
          aria-label="查看 GitHub 仓库"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.30.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
        </a>
      </div>

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
        onSubmit={handleBlogSubmit}
        initialTitle={displayTitle}
      />
    </div>
  );
}
