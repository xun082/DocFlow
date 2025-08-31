'use client';

import { useEffect } from 'react';
import {
  MessageCircle,
  Users,
  Calendar,
  Video,
  FileText,
  TrendingUp,
  Clock,
  Plus,
  Wifi,
} from 'lucide-react';

import { useNotificationSocket } from '@/hooks/ws/useNotificationSocket';

// 静态数据
const staticStats = [
  {
    name: '未读消息',
    value: '12',
    icon: <MessageCircle className="w-6 h-6" />,
    color: 'bg-blue-500',
    change: '+2',
  },
  {
    name: '今日会议',
    value: '4',
    icon: <Video className="w-6 h-6" />,
    color: 'bg-purple-500',
    change: '+1',
  },
  {
    name: '活跃文档',
    value: '18',
    icon: <FileText className="w-6 h-6" />,
    color: 'bg-orange-500',
    change: '+5',
  },
];

const quickActions = [
  {
    name: '发起会议',
    description: '立即开始视频会议',
    icon: <Video className="w-8 h-8" />,
    color: 'bg-blue-600 hover:bg-blue-700',
  },
  {
    name: '创建文档',
    description: '新建协作文档',
    icon: <FileText className="w-8 h-8" />,
    color: 'bg-green-600 hover:bg-green-700',
  },
  {
    name: '安排日程',
    description: '添加新的日程安排',
    icon: <Calendar className="w-8 h-8" />,
    color: 'bg-purple-600 hover:bg-purple-700',
  },
];

const recentActivities = [
  {
    id: 1,
    type: 'message',
    title: '张三 发送了新消息',
    time: '5分钟前',
    avatar: '👨‍💼',
  },
  {
    id: 2,
    type: 'document',
    title: '产品需求文档 已更新',
    time: '1小时前',
    avatar: '📄',
  },
  {
    id: 3,
    type: 'meeting',
    title: '产品评审会议 已结束',
    time: '2小时前',
    avatar: '📹',
  },
  {
    id: 4,
    type: 'user',
    title: '李四 加入了团队',
    time: '昨天',
    avatar: '👩‍💻',
  },
];

const upcomingEvents = [
  {
    id: 1,
    title: '技术分享会',
    time: '14:00 - 15:00',
    participants: 8,
  },
  {
    id: 2,
    title: '产品路演',
    time: '16:00 - 17:00',
    participants: 12,
  },
];

export default function DashboardPage() {
  const { isConnected, isConnecting, onlineUsers, connect } = useNotificationSocket();

  // 自动连接WebSocket
  useEffect(() => {
    if (!isConnected && !isConnecting) {
      connect();
    }
  }, [isConnected, isConnecting, connect]);

  const currentTime = new Date().toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // 动态生成统计数据，包含实时在线用户数
  const quickStats = [
    ...staticStats,
    {
      name: '在线用户',
      value: isConnected ? onlineUsers.length.toString() : '--',
      icon: <Wifi className="w-6 h-6" />,
      color: isConnected ? 'bg-green-500' : 'bg-gray-400',
      change: isConnected ? `${onlineUsers.length > 0 ? '+' : ''}${onlineUsers.length}` : '--',
      status: isConnected ? 'connected' : 'disconnected',
    },
  ];

  return (
    <div className="p-6">
      {/* 欢迎区域 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">欢迎回来！</h1>
        <p className="text-gray-600">今天是个美好的工作日，{currentTime}</p>
      </div>

      {/* 数据统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {quickStats.map((stat, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 relative">
            <div className="flex items-center justify-between mb-4">
              <div
                className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center text-white relative`}
              >
                {stat.icon}
                {/* 在线状态指示器 */}
                {stat.name === '在线用户' && (
                  <div
                    className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${
                      isConnected ? 'bg-green-400 animate-pulse' : 'bg-gray-400'
                    }`}
                  ></div>
                )}
              </div>
              <div
                className={`flex items-center text-sm ${
                  stat.name === '在线用户' && !isConnected ? 'text-gray-400' : 'text-green-600'
                }`}
              >
                <TrendingUp className="w-4 h-4 mr-1" />
                {stat.change}
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
              <p className="text-sm text-gray-600 flex items-center">
                {stat.name}
                {stat.name === '在线用户' && (
                  <span
                    className={`ml-2 text-xs px-2 py-1 rounded-full ${
                      isConnected ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {isConnected ? '实时' : '离线'}
                  </span>
                )}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 快速操作 */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">快速操作</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {quickActions.map((action, index) => (
              <button
                key={index}
                className={`${action.color} text-white p-6 rounded-lg transition-colors text-left`}
              >
                <div className="mb-3">{action.icon}</div>
                <h3 className="font-semibold mb-1">{action.name}</h3>
                <p className="text-sm opacity-90">{action.description}</p>
              </button>
            ))}
          </div>

          {/* 最近活动 */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">最近活动</h3>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm">
                    {activity.avatar}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                      <Clock className="w-3 h-3 mr-1" />
                      {activity.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 侧边栏 */}
        <div className="space-y-6">
          {/* 在线用户 */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Wifi
                  className={`w-4 h-4 mr-2 ${isConnected ? 'text-green-500' : 'text-gray-400'}`}
                />
                在线用户
              </h3>
              <span
                className={`text-sm px-2 py-1 rounded-full ${
                  isConnected ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
                }`}
              >
                {isConnected ? onlineUsers.length : 0}
              </span>
            </div>

            {isConnected ? (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {onlineUsers.length > 0 ? (
                  onlineUsers.slice(0, 5).map((user: any, index: number) => (
                    <div
                      key={user.id || index}
                      className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50"
                    >
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {user.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                      </div>
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">暂无其他在线用户</p>
                )}
                {onlineUsers.length > 5 && (
                  <div className="text-center pt-2">
                    <span className="text-xs text-gray-500">
                      还有 {onlineUsers.length - 5} 人在线
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Wifi className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">WebSocket 未连接</p>
                <p className="text-xs text-gray-400 mt-1">无法获取实时用户信息</p>
              </div>
            )}
          </div>

          {/* 今日日程 */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">今日日程</h3>
              <button className="text-blue-600 hover:text-blue-700">
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="border-l-4 border-blue-500 pl-3">
                  <p className="font-medium text-gray-900 text-sm">{event.title}</p>
                  <p className="text-xs text-gray-600">{event.time}</p>
                  <p className="text-xs text-gray-500">{event.participants} 人参与</p>
                </div>
              ))}
            </div>
          </div>

          {/* 快捷导航 */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">快捷导航</h3>
            <div className="space-y-3">
              <a
                href="/dashboard/messages"
                className="flex items-center space-x-3 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="text-sm">查看消息</span>
              </a>
              <a
                href="/dashboard/contacts"
                className="flex items-center space-x-3 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <Users className="w-4 h-4" />
                <span className="text-sm">通讯录</span>
              </a>
              <a
                href="/docs"
                className="flex items-center space-x-3 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <FileText className="w-4 h-4" />
                <span className="text-sm">文档协作</span>
              </a>
              <a
                href="/dashboard/calendar"
                className="flex items-center space-x-3 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <Calendar className="w-4 h-4" />
                <span className="text-sm">查看日历</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
