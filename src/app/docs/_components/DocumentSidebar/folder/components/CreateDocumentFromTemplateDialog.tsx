'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const formSchema = z.object({
  fileName: z.string().min(1, '文件名不能为空'),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateDocumentFromTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (fileName: string) => void;
  defaultFileName: string;
}

export function CreateDocumentFromTemplateDialog({
  open,
  onOpenChange,
  onConfirm,
  defaultFileName,
}: CreateDocumentFromTemplateDialogProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fileName: defaultFileName,
    },
  });

  const handleSubmit = (data: FormValues) => {
    onConfirm(data.fileName);
    onOpenChange(false);
    form.reset();
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>从模板创建文档</AlertDialogTitle>
          <AlertDialogDescription>输入文件名以从模板创建新文档</AlertDialogDescription>
        </AlertDialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="fileName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>文件名</FormLabel>
                  <FormControl>
                    <Input placeholder="输入文件名" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => onOpenChange(false)}>取消</AlertDialogCancel>
              <Button type="submit">创建</Button>
            </AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
