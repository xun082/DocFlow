'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Settings } from 'lucide-react';

import { updateOrganizationSchema, type UpdateOrganizationFormData } from './schemas';
import ImageUpload from './ImageUpload';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import Textarea from '@/components/ui/Textarea';
import { useToast } from '@/hooks/use-toast';
import organizationService, { type Organization } from '@/services/organization';

interface EditOrganizationDialogProps {
  organization: Organization;
}

export default function EditOrganizationDialog({ organization }: EditOrganizationDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const form = useForm<UpdateOrganizationFormData>({
    resolver: zodResolver(updateOrganizationSchema),
    defaultValues: {
      name: organization.name,
      description: organization.description,
      logo_url: organization.logo_url,
      website: organization.website,
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateOrganizationFormData) =>
      organizationService.updateOrganization(organization.id, data),
    onSuccess: async () => {
      toast({
        title: '更新成功',
        description: '组织信息已更新',
      });
      // 立即刷新当前组织的详情数据
      await queryClient.invalidateQueries({ queryKey: ['organization', organization.id] });
      // 刷新组织列表
      await queryClient.invalidateQueries({ queryKey: ['organizations'] });
      // 确保数据刷新后再关闭对话框
      setOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: '更新失败',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: UpdateOrganizationFormData) => {
    updateMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="w-4 h-4 mr-2" />
          编辑
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>编辑组织信息</DialogTitle>
          <DialogDescription>更新组织的基本信息</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>组织名称</FormLabel>
                  <FormControl>
                    <Input placeholder="TechCorp Inc." {...field} />
                  </FormControl>
                  <FormDescription>2-100个字符</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>组织描述</FormLabel>
                  <FormControl>
                    <Textarea placeholder="介绍一下你的组织..." rows={3} {...field} />
                  </FormControl>
                  <FormDescription>最多500个字符</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="logo_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>组织 Logo</FormLabel>
                  <FormControl>
                    <ImageUpload value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>网站</FormLabel>
                  <FormControl>
                    <Input type="url" placeholder="https://example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
                disabled={updateMutation.isPending}
              >
                取消
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? '更新中...' : '保存'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
