import { z } from 'zod';

export const passwordLoginSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(6, '密码长度至少为6位'),
});

export const emailCodeLoginSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  code: z.string().length(6, '验证码必须为6位数字').regex(/^\d+$/, '验证码只能包含数字'),
});

export const registerSchema = z
  .object({
    email: z.string().email('请输入有效的邮箱地址'),
    password: z.string().min(6, '密码长度至少为6位'),
    confirmPassword: z.string().min(6, '密码长度至少为6位'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '两次输入的密码不一致',
    path: ['confirmPassword'],
  });

export type LoginFormData = {
  email: string;
  password?: string;
  code?: string;
  confirmPassword?: string;
};
