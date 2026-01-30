import { z } from 'zod';

import { OrganizationRole } from '@/services/organization';

/**
 * 创建组织表单验证 Schema
 * 根据后端 DTO，所有字段都是必填的
 */
export const createOrganizationSchema = z.object({
  name: z.string().min(2, '组织名称至少需要2个字符').max(100, '组织名称最多100个字符'),
  description: z.string().min(1, '组织描述不能为空').max(500, '描述最多500个字符'),
  logo_url: z.string().url('Logo必须是有效的URL格式'),
  website: z.string().url('网站地址必须是有效的URL格式'),
});

export type CreateOrganizationFormData = z.infer<typeof createOrganizationSchema>;

/**
 * 更新组织表单验证 Schema
 * 所有字段都是可选的
 */
export const updateOrganizationSchema = z.object({
  name: z.string().min(2, '组织名称至少需要2个字符').max(100, '组织名称最多100个字符').optional(),
  description: z.string().max(500, '描述最多500个字符').optional(),
  logo_url: z.string().url('Logo必须是有效的URL格式').optional().or(z.literal('')),
  website: z.string().url('网站地址必须是有效的URL格式').optional().or(z.literal('')),
});

export type UpdateOrganizationFormData = z.infer<typeof updateOrganizationSchema>;

/**
 * 邀请成员表单验证 Schema
 */
export const inviteMemberSchema = z.object({
  user_id: z.number({ required_error: '请选择要邀请的用户' }).int().positive(),
  role: z.nativeEnum(OrganizationRole),
  message: z
    .string()
    .min(1, '邀请消息不能为空')
    .max(500, '邀请消息最多500个字符')
    .refine((val) => val.trim().length > 0, '邀请消息不能为空'), // 拒绝纯空格
});

export type InviteMemberFormData = z.infer<typeof inviteMemberSchema>;
