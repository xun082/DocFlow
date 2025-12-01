'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';

import { createOrganizationSchema, type CreateOrganizationFormData } from './schemas';
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
import organizationService from '@/services/organization';

export default function CreateOrganizationDialog() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const form = useForm<CreateOrganizationFormData>({
    resolver: zodResolver(createOrganizationSchema),
    defaultValues: {
      name: '',
      description: '',
      logo_url: '',
      website: '',
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateOrganizationFormData) => organizationService.createOrganization(data),
    onSuccess: async () => {
      toast({
        title: '创建成功',
        description: '组织已成功创建',
      });
      // 刷新组织列表
      await queryClient.invalidateQueries({ queryKey: ['organizations'] });
      form.reset();
      setOpen(false); // 关闭对话框
    },
    onError: (error: Error) => {
      toast({
        title: '创建失败',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: CreateOrganizationFormData) => {
    createMutation.mutate(data);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);

        if (!isOpen) {
          form.reset();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          创建组织
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>创建新组织</DialogTitle>
          <DialogDescription>创建一个新的组织，你将成为组织的所有者</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    组织名称 <span className="text-red-500">*</span>
                  </FormLabel>
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
                  <FormLabel>
                    组织描述 <span className="text-red-500">*</span>
                  </FormLabel>
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
                  <FormLabel>
                    组织 Logo <span className="text-red-500">*</span>
                  </FormLabel>
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
                  <FormLabel>
                    网站 <span className="text-red-500">*</span>
                  </FormLabel>
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
                disabled={createMutation.isPending}
              >
                取消
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? '创建中...' : '创建'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
