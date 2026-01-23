import { toast } from 'sonner';
import { useState, useCallback } from 'react';

import { templateServerApi, templateClientApi } from '@/services/template';
import type { Template as ApiTemplate, CreateTemplateParams } from '@/services/template/type';

export interface Template {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  tags: string;
  preview?: string;
}

interface UseTemplateOperationsReturn {
  templates: Template[];
  loading: boolean;
  loadTemplates: () => Promise<void>;
  handleDeleteTemplate: (id: string) => void;
  confirmDelete: () => Promise<void>;
  confirmCreate: (data: any) => Promise<void>;
  deleteDialogOpen: boolean;
  setDeleteDialogOpen: (open: boolean) => void;
}

export const useTemplateOperations = (
  selectedCategory: string,
  searchQuery: string,
): UseTemplateOperationsReturn => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTemplateId, setDeleteTemplateId] = useState<string | null>(null);

  const loadTemplates = useCallback(async () => {
    setLoading(true);

    try {
      const params: any = {};

      if (selectedCategory !== 'all') {
        params.category = selectedCategory;
      }

      if (searchQuery) {
        params.name = searchQuery;
      }

      const res = await templateServerApi.getAll(params);

      const apiTemplates = res.data?.data?.list || [];
      const transformedTemplates: Template[] = apiTemplates.map((t: ApiTemplate) => ({
        id: String(t.id),
        name: t.name,
        description: t.description,
        icon: t.icon,
        category: t.category,
        tags: t.tags || '',
        preview: t.content,
      }));
      setTemplates(transformedTemplates);
    } catch (error) {
      console.error('Failed to load templates:', error);
      toast.error('加载模板失败');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchQuery]);

  const handleDeleteTemplate = (id: string) => {
    setDeleteTemplateId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTemplateId) return;

    try {
      await templateClientApi.delete(Number(deleteTemplateId));
      toast.success('模板删除成功');
      await loadTemplates();
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Failed to delete template:', error);
      toast.error('删除模板失败');
    }
  };

  const confirmCreate = async (data: any) => {
    try {
      const createData: CreateTemplateParams = {
        name: data.name,
        description: data.description,
        content: data.preview,
        icon: data.icon,
        category: data.category,
        tags: data.tags,
      };
      await templateClientApi.create(createData);
      toast.success('模板创建成功');
      await loadTemplates();
    } catch (error) {
      console.error('Failed to create template:', error);
      toast.error('创建模板失败');
    }
  };

  return {
    templates,
    loading,
    loadTemplates,
    handleDeleteTemplate,
    confirmDelete,
    confirmCreate,
    deleteDialogOpen,
    setDeleteDialogOpen,
  };
};
