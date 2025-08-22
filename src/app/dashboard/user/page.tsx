'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Avatar } from '@/components/ui/avatar';
import { Surface } from '@/components/ui/Surface';
import authApi from '@/services/auth';
import UserApi from '@/services/users';
import { User } from '@/services/auth/type';

export default function UserProfile() {
  const [profile, setProfile] = useState<User | null>(null);
  const [form, setForm] = useState({
    name: '',
    avatar_url: '',
    bio: '',
    location: '',
    website_url: '',
    company: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      try {
        const { data, error } = await authApi.getCurrentUser();

        if (error || !data || !data.data) {
          setProfile(null);

          return;
        }

        const user = data.data;
        setProfile(user);
        setForm({
          name: user.name || '',
          avatar_url: user.avatar_url || '',
          bio: user.bio || '',
          location: user.location || '',
          website_url: user.website_url || '',
          company: user.company || '',
        });
      } catch {
        setProfile(null);
      }
    }

    fetchUser();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setLoading(true);

    try {
      await UserApi.updateUser({
        name: form.name,
        avatar_url: form.avatar_url || null,
        bio: form.bio || null,
        location: form.location || null,
        website_url: form.website_url || null,
        company: form.company || null,
      });
      toast.success('信息已更新');
      setProfile({ ...profile, ...form });
    } catch {
      toast.error('更新失败');
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return <Surface className="p-8 text-center">个人资料加载中...</Surface>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* 页面头部 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">个人信息</h1>
        <p className="text-gray-600">管理你的账户信息和资料</p>
      </div>

      {/* 资料表单 */}
      <form
        className="bg-white border border-gray-100 rounded-2xl shadow-xl p-10 mb-8 flex flex-col items-center gap-8"
        onSubmit={handleSubmit}
      >
        <div className="flex flex-col items-center gap-2">
          <div className="relative group">
            <Avatar>
              {form.avatar_url ? (
                <img
                  src={form.avatar_url}
                  alt={form.name}
                  className="w-28 h-28 rounded-full object-center object-cover border-4 border-blue-100 shadow"
                  style={{ aspectRatio: '1/1' }}
                />
              ) : (
                <span className="text-4xl font-bold text-blue-600 bg-blue-50 rounded-full w-28 h-28 flex items-center justify-center">
                  {form.name?.[0] || '?'}
                </span>
              )}
            </Avatar>
            <label
              className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
              htmlFor="avatar-upload"
            ></label>
            <input
              type="file"
              id="avatar-upload"
              className="hidden"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;

                try {
                  const { data, error } = await UserApi.uploadImage(file);

                  if (error || !data?.data?.fileUrl) {
                    toast.error('上传头像失败');

                    return;
                  }

                  const imageUrl = data.data.fileUrl;

                  setLoading(true);

                  try {
                    await UserApi.updateUser({
                      ...form,
                      avatar_url: imageUrl,
                    });

                    setForm((prev) => ({
                      ...prev,
                      avatar_url: imageUrl,
                    }));

                    setProfile((prev) =>
                      prev
                        ? {
                            ...prev,
                            avatar_url: imageUrl,
                          }
                        : null,
                    );

                    toast.success('头像更新成功');
                  } catch {
                    toast.error('更新失败');
                  } finally {
                    setLoading(false);
                  }
                } catch {
                  toast.error('上传头像失败');
                }
              }}
            />
          </div>
          <div className="mt-2 text-gray-500 text-sm">{profile.email || '未绑定邮箱'}</div>
        </div>
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">姓名</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              placeholder="请输入姓名"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">公司</label>
            <input
              name="company"
              value={form.company}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              placeholder="公司名称"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">位置</label>
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              placeholder="所在城市/地区"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">个人网站</label>
            <input
              name="website_url"
              value={form.website_url}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              placeholder="https://your.site"
            />
          </div>
        </div>
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">简介</label>
          <textarea
            name="bio"
            value={form.bio}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            rows={3}
            placeholder="一句话介绍自己..."
          />
        </div>
        <button
          type="submit"
          className="w-40 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold shadow"
          disabled={loading}
        >
          {loading ? '保存中...' : '来个Star☆'}
        </button>
      </form>

      {/* 只读信息展示 */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="font-medium text-gray-700">角色：</span>
            <span className="text-gray-600">{profile.role}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">GitHub：</span>
            <span className="text-gray-600">{profile.github_id || '暂无'}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">在线状态：</span>
            {profile.is_active ? (
              <span className="text-green-600">在线</span>
            ) : (
              <span className="text-gray-600">离线</span>
            )}
          </div>
          <div>
            <span className="font-medium text-gray-700">创建时间：</span>
            <span className="text-gray-600">{profile.created_at}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
