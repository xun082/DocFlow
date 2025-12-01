'use client';

import { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserPlus } from 'lucide-react';

import { inviteMemberSchema, type InviteMemberFormData } from './schemas';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Textarea from '@/components/ui/Textarea';
import { useToast } from '@/hooks/use-toast';
import organizationService, { OrganizationRole } from '@/services/organization';

interface InviteMemberDialogProps {
  organizationId: number;
  children?: React.ReactNode;
}

export default function InviteMemberDialog({ organizationId, children }: InviteMemberDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const form = useForm<InviteMemberFormData>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: {
      email: '',
      role: OrganizationRole.MEMBER,
      message: '',
    },
  });

  // 获取角色列表
  const { data: rolesData } = useQuery({
    queryKey: ['organization-roles'],
    queryFn: () => organizationService.getRoles(),
  });

  const inviteMutation = useMutation({
    mutationFn: (data: InviteMemberFormData) =>
      organizationService.inviteMember(organizationId, data),
    onSuccess: () => {
      toast({
        title: '邀请成功',
        description: '邀请邮件已发送',
      });
      queryClient.invalidateQueries({ queryKey: ['organization', organizationId, 'members'] });
      form.reset();
      setOpen(false); // 关闭对话框
    },
    onError: (error: Error) => {
      toast({
        title: '邀请失败',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: InviteMemberFormData) => {
    inviteMutation.mutate(data);
  };

  const roles = rolesData?.roles || [];

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
      {children ? (
        <DialogTrigger asChild>{children}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button size="sm" variant="ghost" className="h-6 gap-1 text-xs">
            <UserPlus className="w-3 h-3" />
            邀请
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>邀请成员</DialogTitle>
          <DialogDescription>通过邮箱邀请新成员加入组织</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    邮箱地址 <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="user@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>角色</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="选择角色" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          <div className="flex flex-col items-start">
                            <span className="font-medium">{role.label}</span>
                            <span className="text-xs text-gray-500">{role.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>邀请消息</FormLabel>
                  <FormControl>
                    <Textarea placeholder="欢迎加入我们的组织..." rows={3} {...field} />
                  </FormControl>
                  <FormDescription>最多500个字符</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
                disabled={inviteMutation.isPending}
              >
                取消
              </Button>
              <Button type="submit" disabled={inviteMutation.isPending}>
                {inviteMutation.isPending ? '发送中...' : '发送邀请'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
