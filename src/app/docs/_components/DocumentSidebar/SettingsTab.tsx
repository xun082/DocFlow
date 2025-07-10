import { useState } from 'react';

import { Icon } from '@/components/ui/Icon';
import { cn } from '@/utils/utils';

const SettingsTab = () => {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [autoSave, setAutoSave] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [wordWrap, setWordWrap] = useState(true);

  const settingSections = [
    {
      title: '外观设置',
      icon: 'Palette',
      items: [
        {
          label: '主题模式',
          description: '选择应用的显示主题',
          type: 'select' as const,
          value: theme,
          options: [
            { value: 'light', label: '浅色模式' },
            { value: 'dark', label: '深色模式' },
            { value: 'system', label: '跟随系统' },
          ],
          onChange: (value: string) => setTheme(value as any),
        },
        {
          label: '自动换行',
          description: '在编辑器中自动换行显示长文本',
          type: 'toggle' as const,
          value: wordWrap,
          onChange: setWordWrap,
        },
      ],
    },
    {
      title: '编辑器设置',
      icon: 'Edit',
      items: [
        {
          label: '自动保存',
          description: '文档内容自动保存到云端',
          type: 'toggle' as const,
          value: autoSave,
          onChange: setAutoSave,
        },
        {
          label: '通知提醒',
          description: '接收文档更新和协作通知',
          type: 'toggle' as const,
          value: notifications,
          onChange: setNotifications,
        },
      ],
    },
  ];

  return (
    <div className="p-4 space-y-6">
      {settingSections.map((section) => (
        <div key={section.title} className="space-y-4">
          {/* 分组标题 */}
          <div className="flex items-center space-x-2 pb-2 border-b border-gray-200 dark:border-gray-600">
            <Icon name={section.icon as any} className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              {section.title}
            </h3>
          </div>

          {/* 设置项 */}
          <div className="space-y-3">
            {section.items.map((item) => (
              <div key={item.label} className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {item.label}
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {item.description}
                    </p>
                  </div>

                  {/* 控件 */}
                  <div className="ml-4">
                    {item.type === 'toggle' && (
                      <button
                        onClick={() => item.onChange(!item.value)}
                        className={cn(
                          'relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                          item.value ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600',
                        )}
                        role="switch"
                        aria-checked={item.value}
                      >
                        <span
                          className={cn(
                            'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                            item.value ? 'translate-x-4' : 'translate-x-0',
                          )}
                        />
                      </button>
                    )}

                    {item.type === 'select' && (
                      <select
                        value={item.value}
                        onChange={(e) => item.onChange(e.target.value)}
                        className={cn(
                          'text-sm border border-gray-200 dark:border-gray-600 rounded-md px-3 py-1.5',
                          'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100',
                          'focus:border-blue-500 dark:focus:border-blue-400 focus:ring-1 focus:ring-blue-500',
                        )}
                      >
                        {item.options?.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* 其他设置 */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 pb-2 border-b border-gray-200 dark:border-gray-600">
          <Icon name="Settings" className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">其他设置</h3>
        </div>

        <div className="space-y-2">
          {[
            { label: '清除缓存', icon: 'Trash2', action: 'clear-cache' },
            { label: '导出设置', icon: 'Download', action: 'export-settings' },
            { label: '重置设置', icon: 'RotateCcw', action: 'reset-settings' },
            { label: '快捷键设置', icon: 'Keyboard', action: 'shortcuts' },
          ].map((item) => (
            <button
              key={item.action}
              className={cn(
                'w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left',
                'hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors',
                'text-sm text-gray-700 dark:text-gray-300',
              )}
              onClick={() => {
                // TODO: 实现具体的设置操作
                console.log(`执行操作: ${item.action}`);
              }}
            >
              <Icon name={item.icon as any} className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 版本信息 */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
        <div className="text-center space-y-1">
          <div className="text-xs text-gray-500 dark:text-gray-400">DocFlow v1.0.0</div>
          <div className="text-xs text-gray-400 dark:text-gray-500">© 2024 DocFlow Team</div>
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;
