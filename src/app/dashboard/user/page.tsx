'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User as UserIcon,
  Mail,
  MapPin,
  Globe,
  Building,
  Camera,
  Edit3,
  Save,
  X,
  Key,
  Github,
  Calendar,
  Check,
  Copy,
  Eye,
  EyeOff,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/Textarea';
import { User } from '@/services/auth/type';
import Spinner from '@/components/ui/Spinner';
import { useUserQuery, useUpdateUserMutation } from '@/hooks/useUserQuery';
import { useAvatarUpload } from '@/hooks/useAvatarUpload';

// 定义表单验证模式
const userProfileSchema = z.object({
  name: z.string().min(1, '姓名不能为空'),
  avatar_url: z.string().optional().nullable(),
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

export default function UserProfile() {
  // 使用 React Query 获取用户数据
  const { data: profile, isLoading, error } = useUserQuery();
  const updateUserMutation = useUpdateUserMutation();
  const avatarUploadMutation = useAvatarUpload();

  const [isEditing, setIsEditing] = useState(false);
  const [apiKeys, setApiKeys] = useState<{ [key: string]: string }>({});
  const [showApiKeys, setShowApiKeys] = useState<{ [key: string]: boolean }>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // 初始化 React Hook Form
  const {
    handleSubmit,
    reset,
    setValue,
    watch,
    control,
    formState: { errors, isDirty },
  } = useForm<UserProfileFormData>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      name: profile?.name || '',
      avatar_url: profile?.avatar_url || '',
      bio: profile?.bio || '',
      location: profile?.location || '',
      website_url: profile?.website_url || '',
      company: profile?.company || '',
    },
  });

  // 监听头像和姓名值
  const avatarUrl = watch('avatar_url');
  const userName = watch('name');

  // API Key 相关函数
  const loadApiKeys = () => {
    try {
      const saved = localStorage.getItem('docflow_api_keys');

      if (saved) {
        setApiKeys(JSON.parse(saved));
      }
    } catch {
      console.error('加载API密钥失败:');
    }
  };

  const saveApiKey = (provider: string, key: string) => {
    const updated = { ...apiKeys, [provider]: key };
    setApiKeys(updated);
    localStorage.setItem('docflow_api_keys', JSON.stringify(updated));
    toast.success(`${provider} API密钥已保存`);
  };

  const copyToClipboard = async (text: string, keyName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(keyName);
      toast.success('已复制到剪贴板');
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      toast.error('复制失败');
    }
  };

  const toggleApiKeyVisibility = (provider: string) => {
    setShowApiKeys((prev) => ({
      ...prev,
      [provider]: !prev[provider],
    }));
  };

  // 只在组件挂载时加载 API 密钥
  useEffect(() => {
    loadApiKeys();
  }, []);

  // 当用户数据更新时同步到表单（比如头像上传后）
  useEffect(() => {
    if (profile) {
      reset({
        name: profile.name || '',
        avatar_url: profile.avatar_url || '',
        bio: profile.bio || '',
        location: profile.location || '',
        website_url: profile.website_url || '',
        company: profile.company || '',
      });
    }
  }, [profile, reset]);

  // 处理头像上传 - 使用优化的 React Query mutation
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 触发头像上传 mutation
    avatarUploadMutation.mutate(file, {
      onSuccess: (imageUrl) => {
        setValue('avatar_url', imageUrl);
        toast.success('头像更新成功');
      },
    });
  };

  // 处理个人信息提交 - 只更新修改的字段
  const onSubmit = async (formData: UserProfileFormData) => {
    try {
      // 构建更新对象，只包含实际修改的字段
      const updateData: Partial<UserProfileFormData> = {};

      if (formData.name !== profile!.name) {
        updateData.name = formData.name;
      }

      if (formData.bio !== profile!.bio) {
        updateData.bio = formData.bio || null;
      }

      if (formData.location !== profile!.location) {
        updateData.location = formData.location || null;
      }

      if (formData.website_url !== profile!.website_url) {
        updateData.website_url = formData.website_url || null;
      }

      if (formData.company !== profile!.company) {
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
    if (profile) {
      reset({
        name: profile.name || '',
        avatar_url: profile.avatar_url || '',
        bio: profile.bio || '',
        location: profile.location || '',
        website_url: profile.website_url || '',
        company: profile.company || '',
      });
    }

    setIsEditing(false);
  };

  // 如果正在首次加载且没有缓存数据，显示简洁的加载状态
  if (isLoading && !profile) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" />
          <p className="text-lg font-medium text-gray-700">个人资料加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* 后台数据刷新指示器 - 只在有缓存数据时显示 */}
      {isLoading && profile && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="fixed top-4 right-4 z-50 bg-blue-500/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2"
        >
          <Spinner size="sm" className="text-white" />
          <span className="text-sm font-medium">同步中...</span>
        </motion.div>
      )}

      {/* 网络错误提示 - 简洁版本 */}
      {error && profile && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-3"
        >
          <div className="text-amber-600">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-amber-800 text-sm font-medium">网络连接不稳定</p>
            <p className="text-amber-700 text-xs">显示的是缓存数据，最新信息可能有延迟</p>
          </div>
        </motion.div>
      )}
      {/* 上半部分：用户信息区域 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/30 overflow-hidden hover:shadow-3xl transition-all duration-300"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* 左侧：头像和不可修改信息 */}
          <div className="relative bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 p-10">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-sm"></div>
            <div className="relative">
              {/* 头像区域 */}
              <div className="flex flex-col items-center mb-8">
                <div className="relative mb-4">
                  <motion.div whileHover={{ scale: 1.05 }} className="relative group">
                    <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-white/30 shadow-2xl bg-white">
                      {avatarUploadMutation.isPending ? (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <Spinner className="border-blue-600" />
                        </div>
                      ) : avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={userName || '用户头像'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-100 text-4xl font-bold text-blue-600">
                          {userName?.[0]?.toUpperCase() || <UserIcon className="w-12 h-12" />}
                        </div>
                      )}
                    </div>
                    {/* 头像上传覆盖层 - 始终可用 */}
                    <motion.label
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      className="absolute inset-0 flex items-center justify-center bg-black/60 text-white rounded-full cursor-pointer transition-all duration-200"
                      htmlFor="avatar-upload"
                    >
                      <div className="text-center">
                        <Camera className="w-6 h-6 mx-auto mb-1" />
                        <span className="text-xs font-medium">更换头像</span>
                      </div>
                    </motion.label>
                    <input
                      type="file"
                      id="avatar-upload"
                      className="hidden"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      disabled={avatarUploadMutation.isPending}
                    />
                  </motion.div>
                </div>
                <h2 className="text-2xl font-bold text-white text-center">
                  {userName || '未设置姓名'}
                </h2>
              </div>

              {/* 不可修改的信息 */}
              <div className="space-y-5">
                <motion.div
                  whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
                  className="flex items-center gap-4 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:border-white/30 transition-all duration-200"
                >
                  <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-white/70 text-xs font-medium mb-1">邮箱</div>
                    <div className="text-white font-semibold">{profile!.email || '未绑定邮箱'}</div>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
                  className="flex items-center gap-4 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:border-white/30 transition-all duration-200"
                >
                  <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                    <UserIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-white/70 text-xs font-medium mb-1">角色</div>
                    <div className="text-white font-semibold">{profile!.role || '用户'}</div>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
                  className="flex items-center gap-4 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:border-white/30 transition-all duration-200"
                >
                  <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                    <Github className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-white/70 text-xs font-medium mb-1">GitHub</div>
                    <div className="text-white font-semibold">
                      {profile!.github_id ? '已绑定' : '未绑定'}
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
                  className="flex items-center gap-4 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:border-white/30 transition-all duration-200"
                >
                  <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-white/70 text-xs font-medium mb-1">注册时间</div>
                    <div className="text-white font-semibold">
                      {profile!.created_at
                        ? new Date(profile!.created_at)
                            .toLocaleDateString('zh-CN', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                            })
                            .replace(/\//g, '-')
                        : '-'}
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>

          {/* 右侧：可编辑的个人信息 */}
          <div className="p-10">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-white" />
                </div>
                个人信息
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
                        disabled={!isDirty}
                        className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all duration-200"
                      >
                        <span className="flex items-center gap-2">
                          <Save className="w-4 h-4" />
                          保存更改
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
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
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
                            {(profile as any)[field.name] || field.placeholder}
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
                        <span className="text-gray-800">{profile!.bio || '一句话介绍自己...'}</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 下半部分：API 密钥管理 */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/30 overflow-hidden hover:shadow-3xl transition-all duration-300"
      >
        <div className="p-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Key className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">API 密钥管理</h3>
              <p className="text-gray-600">管理你的第三方服务API密钥（本地存储）</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {[
              {
                name: 'OpenAI',
                color: 'from-green-500 to-emerald-500',
                description: '配置OpenAI GPT服务密钥',
              },
              {
                name: 'Claude',
                color: 'from-orange-500 to-red-500',
                description: '配置Anthropic Claude服务密钥',
              },
              {
                name: 'Gemini',
                color: 'from-blue-500 to-indigo-500',
                description: '配置Google Gemini服务密钥',
              },
              {
                name: 'Azure OpenAI',
                color: 'from-cyan-500 to-blue-500',
                description: '配置Azure OpenAI服务密钥',
              },
              {
                name: 'Cohere',
                color: 'from-purple-500 to-pink-500',
                description: '配置Cohere AI服务密钥',
              },
              {
                name: 'Hugging Face',
                color: 'from-yellow-500 to-orange-500',
                description: '配置Hugging Face服务密钥',
              },
            ].map((provider) => (
              <motion.div
                key={provider.name}
                whileHover={{ scale: 1.02 }}
                className="p-6 rounded-2xl border-2 border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-gray-50/50"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg bg-gradient-to-br ${provider.color} flex items-center justify-center shadow-lg`}
                    >
                      <Key className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <span className="font-semibold text-gray-800 text-base">{provider.name}</span>
                      <p className="text-xs text-gray-500">{provider.description}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleApiKeyVisibility(provider.name)}
                    className="rounded-lg h-8 w-8 p-0"
                  >
                    {showApiKeys[provider.name] ? (
                      <EyeOff className="w-3 h-3" />
                    ) : (
                      <Eye className="w-3 h-3" />
                    )}
                  </Button>
                </div>

                <div className="space-y-3">
                  <Input
                    type={showApiKeys[provider.name] ? 'text' : 'password'}
                    value={apiKeys[provider.name] || ''}
                    onChange={(e) =>
                      setApiKeys((prev) => ({ ...prev, [provider.name]: e.target.value }))
                    }
                    placeholder={`请输入 ${provider.name} API 密钥`}
                    className="rounded-xl border-2 border-gray-200 focus:border-blue-500 text-sm"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={() => saveApiKey(provider.name, apiKeys[provider.name] || '')}
                      className={`flex-1 bg-gradient-to-r ${provider.color} text-white rounded-xl hover:shadow-lg text-sm h-9`}
                      disabled={!apiKeys[provider.name]?.trim()}
                    >
                      <Save className="w-3 h-3 mr-1" />
                      保存
                    </Button>
                    {apiKeys[provider.name] && (
                      <Button
                        variant="outline"
                        onClick={() => copyToClipboard(apiKeys[provider.name], provider.name)}
                        className="rounded-xl h-9 px-3"
                      >
                        {copiedKey === provider.name ? (
                          <Check className="w-3 h-3 text-green-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* 自定义API服务 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 p-6 rounded-2xl border-2 border-dashed border-gray-200 hover:border-blue-300 transition-all duration-300 bg-gradient-to-br from-blue-50/50 to-indigo-50/50"
          >
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center mx-auto mb-4">
                <Key className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">自定义API服务</h4>
              <p className="text-gray-600 text-sm mb-4">
                需要添加其他AI服务？我们正在开发更多集成选项
              </p>
              <Button
                variant="outline"
                className="rounded-xl border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                onClick={() => toast.info('功能开发中，敬请期待！')}
              >
                <Key className="w-4 h-4 mr-2" />
                申请新服务
              </Button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
