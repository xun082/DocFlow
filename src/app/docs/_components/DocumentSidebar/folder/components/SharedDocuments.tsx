import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

import { Icon } from '@/components/ui/Icon';
import { cn } from '@/utils/utils';
import DocumentApi from '@/services/document';
import { SharedDocumentItem } from '@/services/document/type';

interface SharedDocumentsProps {
  isExpanded: boolean;
  onToggle: () => void;
}

const SharedDocuments: React.FC<SharedDocumentsProps> = ({ isExpanded, onToggle }) => {
  const router = useRouter();
  const [sharedDocs, setSharedDocs] = useState<SharedDocumentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 加载分享文档
  const loadSharedDocuments = useCallback(async () => {
    if (!isExpanded) return; // 只有展开时才加载

    setLoading(true);
    setError(null);

    try {
      const response = await DocumentApi.GetSharedDocuments();

      if (response?.data?.code === 200) {
        setSharedDocs(response.data.data.data || []);
      } else {
        setError('加载失败');
      }
    } catch (err) {
      console.error('Failed to load shared documents:', err);
      setError('加载失败');
    } finally {
      setLoading(false);
    }
  }, [isExpanded]);

  // 当展开状态改变时加载数据
  useEffect(() => {
    loadSharedDocuments();
  }, [loadSharedDocuments]);

  // 处理文档点击
  const handleDocumentClick = useCallback(
    (doc: SharedDocumentItem) => {
      if (doc.type === 'FILE') {
        router.push(`/docs/${doc.id}`);
      }
    },
    [router],
  );

  // 格式化时间
  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 30) return `${days}天前`;

    return date.toLocaleDateString();
  };

  // 获取权限显示文本
  const getPermissionText = (permission: string) => {
    const permissionMap = {
      VIEW: '查看',
      EDIT: '编辑',
      COMMENT: '评论',
      MANAGE: '管理',
      FULL: '完全控制',
    };

    return permissionMap[permission as keyof typeof permissionMap] || permission;
  };

  return (
    <div className="border-t border-gray-200">
      {/* 标题栏 */}
      <div
        className="flex items-center justify-between p-2 cursor-pointer hover:bg-gray-50"
        onClick={onToggle}
      >
        <h4 className="text-sm font-medium flex items-center text-gray-700">
          <Icon name={isExpanded ? 'ChevronDown' : 'ChevronRight'} className="h-4 w-4 mr-1" />
          <Icon name="Share2" className="h-4 w-4 mr-1 text-purple-600" />
          分享文档
          {sharedDocs.length > 0 && (
            <span className="ml-1 text-xs bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded-full">
              {sharedDocs.length}
            </span>
          )}
        </h4>

        {isExpanded && (
          <button
            className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-purple-500 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              loadSharedDocuments();
            }}
            title="刷新"
          >
            <Icon name="RefreshCw" className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* 内容区域 */}
      {isExpanded && (
        <div className="pb-2">
          {loading && (
            <div className="flex items-center justify-center py-4 text-sm text-gray-500">
              <Icon name="Loader" className="h-4 w-4 animate-spin mr-2" />
              加载中...
            </div>
          )}

          {error && <div className="px-4 py-2 text-sm text-red-500 text-center">{error}</div>}

          {!loading && !error && sharedDocs.length === 0 && (
            <div className="px-4 py-4 text-sm text-gray-500 text-center">暂无分享文档</div>
          )}

          {!loading && !error && sharedDocs.length > 0 && (
            <div className="space-y-1">
              {sharedDocs.map((doc) => (
                <div
                  key={doc.id}
                  className={cn(
                    'mx-2 px-2 py-2 rounded-md cursor-pointer hover:bg-purple-50 border border-transparent hover:border-purple-200 transition-all',
                    'group',
                  )}
                  onClick={() => handleDocumentClick(doc)}
                >
                  <div className="flex items-start space-x-2">
                    {/* 文档图标 */}
                    <Icon
                      name={doc.type === 'FOLDER' ? 'Folder' : 'FileText'}
                      className={cn(
                        'h-4 w-4 mt-0.5 flex-shrink-0',
                        doc.type === 'FOLDER' ? 'text-yellow-500' : 'text-purple-500',
                      )}
                    />

                    {/* 文档信息 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h5 className="text-sm font-medium text-gray-900 truncate">
                          {doc.shareInfo.custom_title || doc.title}
                        </h5>
                        <span className="text-xs text-purple-600 bg-purple-100 px-1.5 py-0.5 rounded">
                          {getPermissionText(doc.shareInfo.permission)}
                        </span>
                      </div>

                      {/* 所有者信息 */}
                      <div className="flex items-center mt-1 text-xs text-gray-500">
                        <img
                          src={doc.owner.avatar_url}
                          alt={doc.owner.name}
                          className="h-4 w-4 rounded-full mr-1"
                        />
                        <span className="truncate">{doc.owner.name}</span>
                      </div>

                      {/* 访问信息 */}
                      <div className="flex items-center justify-between mt-1 text-xs text-gray-400">
                        <span>最后访问：{formatTime(doc.shareInfo.last_accessed_at)}</span>
                        <span>访问 {doc.shareInfo.access_count} 次</span>
                      </div>

                      {/* 分享链接信息 */}
                      <div className="flex items-center mt-1 text-xs text-gray-400 space-x-2">
                        {doc.shareInfo.share_link.has_password && (
                          <span className="flex items-center">
                            <Icon name="Lock" className="h-3 w-3 mr-1" />
                            有密码
                          </span>
                        )}
                        {doc.shareInfo.share_link.expires_at && (
                          <span className="flex items-center">
                            <Icon name="Clock" className="h-3 w-3 mr-1" />
                            {formatTime(doc.shareInfo.share_link.expires_at)} 过期
                          </span>
                        )}
                        {doc.shareInfo.is_favorited && (
                          <span className="flex items-center">
                            <Icon name="Star" className="h-3 w-3 mr-1 text-yellow-400" />
                            已收藏
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SharedDocuments;
