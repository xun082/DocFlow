import { User, Bell, Shield, Palette, Globe } from 'lucide-react';

const settingsCategories = [
  {
    id: 'profile',
    name: '个人资料',
    icon: <User className="h-5 w-5" />,
    description: '管理你的个人信息和头像',
  },
  {
    id: 'notifications',
    name: '通知设置',
    icon: <Bell className="h-5 w-5" />,
    description: '控制消息和通知的接收方式',
  },
  {
    id: 'privacy',
    name: '隐私与安全',
    icon: <Shield className="h-5 w-5" />,
    description: '管理你的隐私和安全设置',
  },
  {
    id: 'appearance',
    name: '外观设置',
    icon: <Palette className="h-5 w-5" />,
    description: '自定义主题和界面外观',
  },
  {
    id: 'language',
    name: '语言与地区',
    icon: <Globe className="h-5 w-5" />,
    description: '设置语言、时区和地区偏好',
  },
];

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-4xl p-6">
      {/* 页面头部 */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">设置</h1>
        <p className="text-gray-600">管理你的账户设置和偏好</p>
      </div>

      {/* 设置分类 */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {settingsCategories.map((category) => (
          <button
            key={category.id}
            className="flex items-start space-x-4 rounded-lg border border-gray-200 bg-white p-6 text-left transition-shadow hover:shadow-md"
          >
            <div className="flex-shrink-0 rounded-lg bg-gray-100 p-2">{category.icon}</div>
            <div className="flex-1">
              <h3 className="mb-1 font-semibold text-gray-900">{category.name}</h3>
              <p className="text-sm text-gray-600">{category.description}</p>
            </div>
          </button>
        ))}
      </div>

      {/* 快速设置 */}
      <div className="mt-8">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">快速设置</h2>
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">桌面通知</h3>
                <p className="text-sm text-gray-600">接收来自DocFlow的桌面通知</p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input type="checkbox" className="peer sr-only" defaultChecked />
                <div className="peer h-6 w-11 rounded-full bg-gray-200 peer-checked:bg-blue-600 peer-focus:ring-4 peer-focus:ring-blue-300 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">暗色主题</h3>
                <p className="text-sm text-gray-600">使用暗色主题界面</p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input type="checkbox" className="peer sr-only" />
                <div className="peer h-6 w-11 rounded-full bg-gray-200 peer-checked:bg-blue-600 peer-focus:ring-4 peer-focus:ring-blue-300 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">自动登录</h3>
                <p className="text-sm text-gray-600">保持登录状态，下次自动登录</p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input type="checkbox" className="peer sr-only" defaultChecked />
                <div className="peer h-6 w-11 rounded-full bg-gray-200 peer-checked:bg-blue-600 peer-focus:ring-4 peer-focus:ring-blue-300 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
