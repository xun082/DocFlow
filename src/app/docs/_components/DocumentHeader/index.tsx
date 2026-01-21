'use client';

import { FileText } from 'lucide-react';

import { CollaborationUsers } from './components/collaboration-users';
import { DocumentActions } from './components/document-actions';
import { GithubLink } from './components/github-link';
import type { DocumentHeaderProps } from './types';

import { useEditorStore } from '@/stores/editorStore';

export default function DocumentHeader({
  provider,
  connectedUsers = [],
  currentUser,
  documentId,
  documentName = '未命名文档',
  documentTitle,
  doc,
}: DocumentHeaderProps) {
  const isCollaborationMode = Boolean(provider) && Array.isArray(connectedUsers);
  const { editor } = useEditorStore();

  // 合并所有用户（当前用户 + 连接用户）
  const allUsers = [
    ...connectedUsers,
    ...(currentUser && !connectedUsers.find((u) => u.id === currentUser.id) ? [currentUser] : []),
  ];

  // 获取实际显示的标题
  const displayTitle = documentTitle || documentName || '未命名文档';

  return (
    <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-700 min-h-[60px] relative z-10">
      {/* 左侧：文档标题 */}
      <div className="flex items-center space-x-3 min-w-0 flex-1">
        <div className="flex items-center space-x-2 min-w-0">
          <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
            {displayTitle || (isCollaborationMode ? '协作文档' : '文档编辑器')}
          </h1>
        </div>
      </div>

      {/* 右侧：协作用户列表和操作按钮 */}
      <div className="flex items-center space-x-3 flex-shrink-0">
        {/* 协作用户显示 */}
        {isCollaborationMode && allUsers.length > 0 && (
          <CollaborationUsers users={allUsers} currentUser={currentUser} />
        )}

        {/* 操作菜单 */}
        {editor && (
          <DocumentActions
            editor={editor}
            documentId={documentId}
            documentTitle={displayTitle}
            doc={doc}
            connectedUsers={connectedUsers}
            currentUser={currentUser}
          />
        )}

        {/* GitHub 链接 */}
        <GithubLink />
      </div>
    </div>
  );
}
