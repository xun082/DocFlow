import { User, Bell, Shield, Palette, Globe } from 'lucide-react';

const settingsCategories = [
  {
    id: 'profile',
    name: '个人资料',
    icon: <User className="w-5 h-5" />,
    description: '管理你的个人信息和头像',
  },
  {
    id: 'notifications',
    name: '通知设置',
    icon: <Bell className="w-5 h-5" />,
    description: '控制消息和通知的接收方式',
  },
  {
    id: 'privacy',
    name: '隐私与安全',
    icon: <Shield className="w-5 h-5" />,
    description: '管理你的隐私和安全设置',
  },
  {
    id: 'appearance',
    name: '外观设置',
    icon: <Palette className="w-5 h-5" />,
    description: '自定义主题和界面外观',
  },
  {
    id: 'language',
    name: '语言与地区',
    icon: <Globe className="w-5 h-5" />,
    description: '设置语言、时区和地区偏好',
  },
];

export default function SettingsPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* 页面头部 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">设置</h1>
        <p className="text-gray-600">管理你的账户设置和偏好</p>
      </div>

      {/* 设置分类 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {settingsCategories.map((category) => (
          <button
            key={category.id}
            className="flex items-start space-x-4 p-6 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow text-left"
          >
            <div className="flex-shrink-0 p-2 bg-gray-100 rounded-lg">{category.icon}</div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
              <p className="text-sm text-gray-600">{category.description}</p>
            </div>
          </button>
        ))}
      </div>

      {/* 快速设置 */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">快速设置</h2>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">桌面通知</h3>
                <p className="text-sm text-gray-600">接收来自DocFlow的桌面通知</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">暗色主题</h3>
                <p className="text-sm text-gray-600">使用暗色主题界面</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">自动登录</h3>
                <p className="text-sm text-gray-600">保持登录状态，下次自动登录</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
