'use client';

import { useCallback, useEffect, useState } from 'react';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { debounce } from 'lodash-es';

import { TemplateFormDialog } from './folder/components/TemplateFormDialog';
import { DeleteConfirmDialog } from './folder/components/DeleteConfirmDialog';
import { CreateDocumentFromTemplateDialog } from './folder/components/CreateDocumentFromTemplateDialog';

import { Icon } from '@/components/ui/Icon';
import { cn } from '@/utils';
import { DocumentApi } from '@/services/document';
import { storage, STORAGE_KEYS } from '@/utils/storage/local-storage';
import { TemplateApi } from '@/services/template';
import {
  TemplateResponse as Template,
  TemplateCategory,
  QueryTemplate,
} from '@/services/template/type';

const categories = [
  { id: 'all', name: '全部', icon: 'Grid3X3' },
  { id: 'TECH', name: '技术', icon: 'Code' },
  { id: 'BUSINESS', name: '商务', icon: 'Users' },
  { id: 'PROJECT', name: '项目', icon: 'Calendar' },
  { id: 'EDUCATION', name: '教育', icon: 'BookOpen' },
  { id: 'PRODUCT', name: '产品', icon: 'Package' },
  { id: 'DESIGN', name: '设计', icon: 'Palette' },
];

const TemplatesTab = () => {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [createFromTemplateDialogOpen, setCreateFromTemplateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTemplateId, setDeleteTemplateId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);

  const fetchTemplates = useCallback(
    debounce((category: string, query: string) => {
      const params: QueryTemplate = {};

      if (category !== 'all') {
        params.category = category as TemplateCategory;
      }

      if (query) {
        params.name = query;
      }

      TemplateApi.GetTemplates(params).then((res) => {
        if (res.data?.code === 200) {
          setTemplates(res.data?.data.list || []);
        } else {
          toast.error('获取模板列表失败');
        }
      });
    }, 300),
    [],
  );

  useEffect(() => {
    fetchTemplates(selectedCategory, searchQuery);
  }, [selectedCategory, searchQuery, fetchTemplates]);

  const handleCreateDocument = (template: Template) => {
    setSelectedTemplate(template);
    setCreateFromTemplateDialogOpen(true);
  };

  const handleConfirmCreateFromTemplate = async (fileName: string) => {
    if (!selectedTemplate || isCreating) return;

    setIsCreating(true);

    try {
      const templateContent = selectedTemplate.content;

      if (!templateContent) {
        toast.error('模板内容加载失败');

        return;
      }

      // 创建空文档
      const document = await DocumentApi.CreateDocument({
        title: fileName,
        type: 'FILE',
        content: {
          type: 'doc',
          content: [{ type: 'paragraph' }],
        },
      });

      if (document.data?.code === 200) {
        const documentId = document.data?.data?.id;
        const docIdString = String(documentId);

        // 将模板内容存储到 localStorage，供文档页面使用
        const existingContents = storage.get(STORAGE_KEYS.TEMPLATE_CONTENT) || {};
        const newContents = {
          ...existingContents,
          [docIdString]: templateContent,
        };

        storage.set(STORAGE_KEYS.TEMPLATE_CONTENT, newContents);

        toast.success('文档创建成功，正在跳转...');

        // 延迟跳转，确保 localStorage 写入完成
        setTimeout(() => {
          router.push(`/docs/${docIdString}`);
        }, 100);
      } else {
        toast.error('文档创建失败');
      }
    } catch {
      toast.error('文档创建失败，请重试');
    } finally {
      setIsCreating(false);
      setCreateFromTemplateDialogOpen(false);
    }
  };

  const handleDeleteTemplate = (id: number) => {
    setDeleteTemplateId(id);
    setDeleteDialogOpen(true);
  };

  const handleOpenEditDialog = (template: Template) => {
    setEditingTemplate(template);
    setIsFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTemplateId) return;

    try {
      await TemplateApi.DeleteTemplate(deleteTemplateId);
      toast.success('模板删除成功');
      fetchTemplates(selectedCategory, searchQuery); // 重新获取列表
    } catch {
      toast.error('模板删除失败');
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const handleOpenCreateDialog = () => {
    setEditingTemplate(null);
    setIsFormOpen(true);
  };

  const handleConfirmTemplateForm = async (formValues: any) => {
    try {
      if (editingTemplate) {
        // 编辑模式
        const res = await TemplateApi.UpdateTemplate(editingTemplate.id, formValues);

        if (res.data?.code === 200) {
          toast.success('模板更新成功');
        } else {
          toast.error('模板更新失败');
        }
      } else {
        // 创建模式
        const res = await TemplateApi.CreateTemplate(formValues);

        if (res.data?.code === 200) {
          toast.success('模板创建成功');
        } else {
          toast.error('模板创建失败');
        }
      }

      fetchTemplates(selectedCategory, searchQuery);
    } catch {
      toast.error(editingTemplate ? '模板更新失败' : '模板创建失败');
    } finally {
      setIsFormOpen(false);
      setEditingTemplate(null);
    }
  };

  return (
    <div className="p-4 space-y-4 flex flex-col flex-1 h-full">
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={cn(
            'w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600',
            'focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20',
            'rounded-lg py-2 pl-9 pr-3 text-sm transition-colors',
            'placeholder:text-gray-400 dark:placeholder:text-gray-500',
            'text-gray-900 dark:text-gray-100',
          )}
          placeholder="搜索模板..."
        />
        <Icon
          name="Search"
          className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500"
        />
      </div>

      <div className="space-y-2">
        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          分类
        </div>
        <div className="flex flex-wrap gap-1">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={cn(
                'flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md text-xs transition-colors',
                selectedCategory === category.id
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600',
              )}
            >
              <Icon name={category.icon as any} className="h-3 w-3" />
              <span>{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
          模板 ({templates.length})
        </div>

        <div className="flex-1 overflow-y-auto">
          {templates.length === 0 ? (
            <div className="text-center py-8 text-sm text-gray-500 dark:text-gray-400">
              {searchQuery ? '未找到匹配的模板' : '该分类下暂无模板'}
            </div>
          ) : (
            <div className="space-y-2">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className={cn(
                    'group p-3 rounded-lg border border-gray-200 dark:border-gray-600',
                    'bg-white dark:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-500',
                    'hover:shadow-sm transition-all duration-200 cursor-pointer',
                  )}
                  onClick={() => handleCreateDocument(template)}
                >
                  <div className="flex items-start space-x-3">
                    <div
                      className={cn(
                        'flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center',
                        'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
                        'group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors',
                      )}
                    >
                      <Icon
                        name={categories.find((cat) => cat.id === template.category)?.icon as any}
                        className="h-4 w-4"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                          {template.name}
                        </h4>
                        <div className="flex items-center gap-4">
                          <Pencil
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEditDialog(template);
                            }}
                            className="h-4 w-4 text-gray-400 dark:text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          />
                          {/* 不是系统模板时才显示删除和创建按钮 */}
                          {!template.isSystem ? (
                            <>
                              <Trash2
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteTemplate(template.id);
                                }}
                                className="h-4 w-4 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                              />
                              <Plus
                                className="h-4 w-4 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCreateDocument(template);
                                }}
                              />
                            </>
                          ) : null}
                        </div>
                      </div>

                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                        {template.description}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {template.tags.split(',').map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                          >
                            {tag}
                          </span>
                        ))}
                        {template.tags.split(',').length > 3 && (
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            +{template.tags.split(',').length - 3}
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
      </div>

      <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
        <button
          className={cn(
            'w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg',
            'border-2 border-dashed border-gray-300 dark:border-gray-600',
            'text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400',
            'hover:border-blue-300 dark:hover:border-blue-500 transition-colors',
            'text-sm font-medium',
          )}
          onClick={handleOpenCreateDialog}
        >
          <Icon name="Plus" className="h-4 w-4" />
          <span>创建自定义模板</span>
        </button>
      </div>

      <TemplateFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onConfirm={handleConfirmTemplateForm}
        template={editingTemplate}
      />

      <CreateDocumentFromTemplateDialog
        open={createFromTemplateDialogOpen}
        onOpenChange={setCreateFromTemplateDialogOpen}
        onConfirm={handleConfirmCreateFromTemplate}
        defaultFileName={
          selectedTemplate
            ? `${new Date().toISOString().split('T')[0]} ${selectedTemplate.name}`
            : ''
        }
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="确认删除模板"
        description="删除后无法恢复，确定要删除这个模板吗？"
      />
    </div>
  );
};

export default TemplatesTab;
