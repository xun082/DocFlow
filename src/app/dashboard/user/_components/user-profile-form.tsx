'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { User as UserIcon, MapPin, Globe, Building, Edit3, Save, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Textarea from '@/components/ui/Textarea';
import { User } from '@/services/auth/type';
import { useUpdateUserMutation } from '@/hooks/useUserQuery';

// 定义表单验证模式
const userProfileSchema = z.object({
  name: z.string().min(1, '姓名不能为空'),
  bio: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  website_url: z.string().url('请输入有效的网址').or(z.string().length(0)).optional().nullable(),
  company: z.string().optional().nullable(),
});

// 定义表单数据类型
type UserProfileFormData = z.infer<typeof userProfileSchema>;

// 定义表单字段配置
const formFields = [
  { name: 'name', label: '姓名', placeholder: '请输入姓名', required: true },
  { name: 'company', label: '公司', placeholder: '公司名称' },
  { name: 'location', label: '位置', placeholder: '所在城市/地区' },
  { name: 'website_url', label: '个人网站', placeholder: 'https://your.site' },
];

interface UserProfileFormProps {
  user: User;
}

export default function UserProfileForm({ user }: UserProfileFormProps) {
  const updateUserMutation = useUpdateUserMutation();
  const [isEditing, setIsEditing] = useState(false);

  // 初始化 React Hook Form
  const {
    handleSubmit,
    reset,
    control,
    formState: { errors, isDirty },
  } = useForm<UserProfileFormData>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      name: user?.name || '',
      bio: user?.bio || '',
      location: user?.location || '',
      website_url: user?.website_url || '',
      company: user?.company || '',
    },
  });

  // 当用户数据更新时同步到表单
  useEffect(() => {
    if (user) {
      reset({
        name: user.name || '',
        bio: user.bio || '',
        location: user.location || '',
        website_url: user.website_url || '',
        company: user.company || '',
      });
    }
  }, [user, reset]);

  // 处理个人信息提交 - 只更新修改的字段
  const onSubmit = async (formData: UserProfileFormData) => {
    try {
      // 构建更新对象，只包含实际修改的字段
      const updateData: Partial<UserProfileFormData> = {};

      if (formData.name !== user.name) {
        updateData.name = formData.name;
      }

      if (formData.bio !== user.bio) {
        updateData.bio = formData.bio || null;
      }

      if (formData.location !== user.location) {
        updateData.location = formData.location || null;
      }

      if (formData.website_url !== user.website_url) {
        updateData.website_url = formData.website_url || null;
      }

      if (formData.company !== user.company) {
        updateData.company = formData.company || null;
      }

      // 如果没有任何修改，直接退出编辑模式
      if (Object.keys(updateData).length === 0) {
        toast.info('没有检测到任何修改');
        setIsEditing(false);

        return;
      }

      // 使用 React Query mutation 更新数据
      await updateUserMutation.mutateAsync(updateData as Partial<User>);

      reset(formData); // 重置表单状态
      setIsEditing(false); // 退出编辑模式
    } catch (error) {
      console.error('更新个人信息失败:', error);
      toast.error('更新失败');
    }
  };

  // 取消编辑
  const handleCancelEdit = () => {
    if (user) {
      reset({
        name: user.name || '',
        bio: user.bio || '',
        location: user.location || '',
        website_url: user.website_url || '',
        company: user.company || '',
      });
    }

    setIsEditing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/30 overflow-hidden"
    >
      <div className="p-10">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-white" />
            </div>
            个人信息编辑
          </h3>

          {/* 编辑按钮 */}
          <div className="flex items-center gap-3 min-w-[200px] justify-end">
            <AnimatePresence mode="wait">
              {isEditing ? (
                <motion.div
                  key="editing-buttons"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                  className="flex items-center gap-3"
                >
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancelEdit}
                    className="px-4 py-2 rounded-xl border-2 hover:bg-gray-50 transition-all duration-200"
                  >
                    <X className="w-4 h-4 mr-2" />
                    取消
                  </Button>
                  <Button
                    onClick={handleSubmit(onSubmit)}
                    disabled={!isDirty || updateUserMutation.isPending}
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all duration-200"
                  >
                    <span className="flex items-center gap-2">
                      <Save className="w-4 h-4" />
                      {updateUserMutation.isPending ? '保存中...' : '保存更改'}
                    </span>
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="edit-button"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium shadow-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
                  >
                    <Edit3 className="w-4 h-4" />
                    编辑资料
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="relative overflow-hidden">
          <AnimatePresence mode="wait">
            {isEditing ? (
              <motion.form
                key="editing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="space-y-4"
              >
                {formFields.map((field) => (
                  <div key={field.name} className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      {field.name === 'name' && <UserIcon className="w-4 h-4" />}
                      {field.name === 'company' && <Building className="w-4 h-4" />}
                      {field.name === 'location' && <MapPin className="w-4 h-4" />}
                      {field.name === 'website_url' && <Globe className="w-4 h-4" />}
                      {field.label}
                      {field.required && <span className="text-red-500">*</span>}
                    </label>
                    <Controller
                      name={field.name as keyof UserProfileFormData}
                      control={control}
                      render={({ field: controllerField }) => (
                        <Input
                          {...controllerField}
                          value={controllerField.value || ''}
                          placeholder={field.placeholder}
                          className={`rounded-xl border-2 transition-all duration-200 ${
                            errors[field.name as keyof UserProfileFormData]
                              ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                              : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
                          }`}
                        />
                      )}
                    />
                    {errors[field.name as keyof UserProfileFormData] && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-red-500 text-sm font-medium"
                      >
                        {errors[field.name as keyof UserProfileFormData]?.message}
                      </motion.p>
                    )}
                  </div>
                ))}

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <UserIcon className="w-4 h-4" />
                    个人简介
                  </label>
                  <Controller
                    name="bio"
                    control={control}
                    render={({ field }) => (
                      <Textarea
                        {...field}
                        value={field.value || ''}
                        placeholder="一句话介绍自己..."
                        className="min-h-[80px] w-full rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-200 transition-all duration-200 resize-none"
                      />
                    )}
                  />
                </div>
              </motion.form>
            ) : (
              <motion.div
                key="viewing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="space-y-5"
              >
                {formFields.map((field) => (
                  <div key={field.name} className="space-y-2">
                    <label className="text-sm font-semibold text-gray-500 flex items-center gap-2">
                      {field.name === 'name' && <UserIcon className="w-4 h-4" />}
                      {field.name === 'company' && <Building className="w-4 h-4" />}
                      {field.name === 'location' && <MapPin className="w-4 h-4" />}
                      {field.name === 'website_url' && <Globe className="w-4 h-4" />}
                      {field.label}
                    </label>
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                      <span className="text-gray-800">
                        {(user as any)[field.name] || field.placeholder}
                      </span>
                    </div>
                  </div>
                ))}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-500 flex items-center gap-2">
                    <UserIcon className="w-4 h-4" />
                    个人简介
                  </label>
                  <div className="min-h-[80px] p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <span className="text-gray-800">{user?.bio || '一句话介绍自己...'}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
