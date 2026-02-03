'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Eye, EyeOff, Save, Copy, Bot, Mic } from 'lucide-react';

// 简单的 Check 图标组件
const CheckIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { storage, STORAGE_KEYS } from '@/utils';

export default function ApiKeySettings() {
  const [apiKeys, setApiKeys] = useState<{ [key: string]: string }>({});
  const [showApiKeys, setShowApiKeys] = useState<{ [key: string]: boolean }>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // API Key 相关函数
  const loadApiKeys = () => {
    try {
      const saved = storage.get(STORAGE_KEYS.API_KEYS, {});
      // 过滤掉 undefined 值
      const filteredKeys: { [key: string]: string } = {};

      if (saved) {
        Object.entries(saved).forEach(([key, value]) => {
          if (value !== undefined) {
            filteredKeys[key] = value;
          }
        });
      }

      setApiKeys(filteredKeys);
    } catch (error) {
      console.error('加载API密钥失败:', error);
    }
  };

  const saveApiKey = (provider: string, key: string) => {
    const updated = { ...apiKeys, [provider]: key };
    setApiKeys(updated);
    storage.set(STORAGE_KEYS.API_KEYS, updated);
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

  const apiProviders = [
    {
      name: 'siliconflow',
      description: '硅基流动大模型API服务',
      color: 'from-blue-500 to-indigo-500',
      icon: Bot,
      placeholder: '请输入 SiliconFlow API Key',
    },
    {
      name: 'minimax',
      description: 'Minimax语音识别与合成服务',
      color: 'from-green-500 to-emerald-500',
      icon: Mic,
      placeholder: '请输入 Minimax API Key',
    },
  ];

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">API 密钥管理</h2>
        <p className="text-gray-600">管理你的第三方服务API密钥（本地存储）</p>
      </div>

      {/* API 密钥列表 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {apiProviders.map((provider) => (
          <div
            key={provider.name}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-4">
                <div className={`flex-shrink-0 p-3 rounded-lg bg-gradient-to-br ${provider.color}`}>
                  <provider.icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1 capitalize">{provider.name}</h3>
                  <p className="text-sm text-gray-600">{provider.description}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleApiKeyVisibility(provider.name)}
                className="h-8 w-8 p-0"
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
                placeholder={provider.placeholder}
                className="text-sm"
              />
              <div className="flex gap-2">
                <Button
                  onClick={() => saveApiKey(provider.name, apiKeys[provider.name] || '')}
                  className={`flex-1 bg-gradient-to-r ${provider.color} text-white text-sm h-9 hover:shadow-lg`}
                  disabled={!apiKeys[provider.name]?.trim()}
                >
                  <Save className="w-3 h-3 mr-2" />
                  保存
                </Button>
                {apiKeys[provider.name] && (
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(apiKeys[provider.name], provider.name)}
                    className="h-9 px-3"
                  >
                    {copiedKey === provider.name ? (
                      <CheckIcon className="w-3 h-3 text-green-600" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
