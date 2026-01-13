import React, { useRef } from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

import { RenderFile } from './RenderFile';
import PortalOverlay from './PortalOverlay';
import DocumentGroupHeader from './DocumentGroupHeader';

import type { FileItem } from '@/types/file-system';
import { DocumentGroup } from '@/stores/fileStore';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/utils';

export interface GroupedFileTreeProps {
  groups: DocumentGroup[];
  expandedFolders: Record<string, boolean>;
  expandedGroups: Record<string, boolean>;
  selectedFileId: string | null;
  isRenaming: string | null;
  newItemFolder: string | null;
  newItemGroupId: string | null;
  newItemType: 'file' | 'folder' | null;
  projected: any;
  dndState: {
    overId: string | null;
    activeId: string | null;
  };
  newItemName: string;
  onFileSelect: (file: FileItem, e: React.MouseEvent) => void;
  onToggleFolder: (folderId: string, e: React.MouseEvent) => void;
  onToggleGroup: (groupId: string) => void;
  onContextMenu: (e: React.MouseEvent, fileId: string) => void;
  onStartCreateNewItem: (folderId: string, type: 'file' | 'folder', groupId: string) => void;
  onFinishRenaming: (newName: string) => void;
  onFinishCreateNewItem: () => void;
  onCancelCreateNewItem: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onSetNewItemName: (name: string) => void;
  onShare: (file: FileItem) => void;
  onDelete: (file: FileItem) => void;
  onRename: (file: FileItem) => void;
  onDuplicate: (file: FileItem) => void;
  onDownload: (file: FileItem) => void;
}

const GroupedFileTree: React.FC<GroupedFileTreeProps> = (props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const {
    groups,
    expandedGroups,
    newItemFolder,
    newItemGroupId,
    projected,
    newItemType,
    newItemName,
    dndState,
    onToggleGroup,
    onStartCreateNewItem,
    onFinishCreateNewItem,
    onCancelCreateNewItem,
    onKeyDown,
    onSetNewItemName,
  } = props;

  // 渲染顶级新建输入框（分组根级）
  const renderNewRootItem = (groupId: string) => {
    if (newItemFolder !== 'root' || newItemGroupId !== groupId) return null;

    return (
      <div
        data-new-item-container
        className={cn(
          'flex items-center py-2 px-3 text-sm mx-2 my-0.5',
          'bg-gradient-to-r from-green-50 via-emerald-50/80 to-green-50',
          'dark:from-green-900/20 dark:via-emerald-900/20 dark:to-green-900/20',
          'border border-green-200/60 dark:border-green-700/50 rounded-lg',
          'shadow-md shadow-green-200/20 dark:shadow-green-800/20',
          'overflow-hidden',
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-6 h-6 mr-2 flex-shrink-0 flex items-center justify-center">
          <div
            className={cn(
              'w-5 h-5 rounded-md flex items-center justify-center',
              'bg-gradient-to-br from-emerald-400 to-green-500',
              'shadow-md shadow-emerald-500/30',
            )}
          >
            <Icon
              name={newItemType === 'folder' ? 'Folder' : 'FileText'}
              className="h-3.5 w-3.5 text-white drop-shadow-sm"
            />
          </div>
        </div>
        <div className="flex-1 flex items-center space-x-2 min-w-0">
          <input
            ref={inputRef}
            type="text"
            className={cn(
              'flex-1 bg-white/90 dark:bg-slate-700/90 backdrop-blur-sm',
              'border-2 border-green-400/70 dark:border-green-500/70',
              'focus:border-green-500 dark:focus:border-green-400',
              'focus:ring-2 focus:ring-green-500/30 dark:focus:ring-green-400/30',
              'px-3 py-2 text-sm rounded-lg transition-all duration-300',
              'text-slate-900 dark:text-slate-100',
              'shadow-lg shadow-green-200/30 dark:shadow-green-800/20',
              'min-w-0',
            )}
            value={newItemName}
            onChange={(e) => onSetNewItemName(e.target.value)}
            onKeyDown={onKeyDown}
            onClick={(e) => e.stopPropagation()}
            autoFocus
            placeholder={`${newItemType === 'folder' ? '文件夹' : '文件'}名称`}
          />
          <div className="flex items-center space-x-1 flex-shrink-0">
            <button
              className={cn(
                'p-2 rounded-xl transition-all duration-300 transform hover:scale-110',
                'bg-gradient-to-br from-green-500 to-emerald-600',
                'text-white shadow-lg shadow-green-500/30',
                'hover:from-green-600 hover:to-emerald-700',
              )}
              onClick={() => onFinishCreateNewItem()}
              title="确认"
            >
              <Icon name="Check" className="h-3.5 w-3.5" />
            </button>
            <button
              className={cn(
                'p-2 rounded-xl transition-all duration-300 transform hover:scale-110',
                'bg-gradient-to-br from-red-500 to-pink-600',
                'text-white shadow-lg shadow-red-500/30',
                'hover:from-red-600 hover:to-pink-700',
              )}
              onClick={onCancelCreateNewItem}
              title="取消"
            >
              <Icon name="X" className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // 获取所有文件ID用于排序
  const getAllFileIds = () => {
    const ids: string[] = [];
    groups.forEach((group) => {
      const flattenFiles = (files: FileItem[]) => {
        files.forEach((file) => {
          ids.push(file.id);

          if (file.children) {
            flattenFiles(file.children);
          }
        });
      };

      flattenFiles(group.files);
    });

    return ids;
  };

  const allFileIds = getAllFileIds();
  const activeFile = allFileIds.find((id) => id === dndState.activeId);

  // 计算文件总数（包括子文件）
  const countFiles = (files: FileItem[]): number => {
    let count = files.length;
    files.forEach((file) => {
      if (file.children) {
        count += countFiles(file.children);
      }
    });

    return count;
  };

  return (
    <div className="py-2">
      <SortableContext strategy={verticalListSortingStrategy} items={allFileIds}>
        {groups.map((group) => {
          const isExpanded = expandedGroups[group.id];
          const fileCount = countFiles(group.files);

          return (
            <div key={group.id} className="mb-1">
              {/* 分组头部 */}
              <DocumentGroupHeader
                name={group.name}
                type={group.type}
                isExpanded={isExpanded}
                fileCount={fileCount}
                onToggle={() => onToggleGroup(group.id)}
                onCreateFile={
                  group.type !== 'shared'
                    ? () => onStartCreateNewItem('root', 'file', group.id)
                    : undefined
                }
                onCreateFolder={
                  group.type !== 'shared'
                    ? () => onStartCreateNewItem('root', 'folder', group.id)
                    : undefined
                }
              />

              {/* 分组内容 */}
              {isExpanded && (
                <div className="ml-0">
                  {/* 渲染根级新建输入框 */}
                  {renderNewRootItem(group.id)}

                  {/* 渲染文件列表 */}
                  {group.files.length === 0 && newItemGroupId !== group.id ? (
                    <div className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 text-center">
                      {group.type === 'shared' ? '暂无分享文档' : '暂无文档'}
                    </div>
                  ) : (
                    group.files.map((file) => (
                      <RenderFile
                        inputRef={inputRef}
                        {...props}
                        key={file.id}
                        file={file}
                        groupId={group.id}
                        depth={
                          file.id === dndState.activeId && projected ? projected.depth : file.depth
                        }
                        id={file.id}
                      />
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
        {typeof window !== 'undefined' &&
          activeFile &&
          (() => {
            const allFiles: FileItem[] = [];
            groups.forEach((group) => {
              const flattenFiles = (files: FileItem[]) => {
                files.forEach((file) => {
                  allFiles.push(file);

                  if (file.children) {
                    flattenFiles(file.children);
                  }
                });
              };

              flattenFiles(group.files);
            });

            const file = allFiles.find((f) => f.id === activeFile);
            if (!file) return null;

            // PortalOverlay 需要旧版的 FileTreeProps，所以我们需要适配一下
            const adaptedProps = {
              ...props,
              files: allFiles,
              onStartCreateNewItem: (folderId: string, type: 'file' | 'folder') => {
                // 使用默认的 personal 分组
                const personalGroup = groups.find((g) => g.type === 'personal');

                if (personalGroup) {
                  props.onStartCreateNewItem(folderId, type, personalGroup.id);
                }
              },
            };

            return <PortalOverlay activeFile={file} {...adaptedProps} />;
          })()}
      </SortableContext>
    </div>
  );
};

export default GroupedFileTree;
