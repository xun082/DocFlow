'use client';

import { useEffect, useState } from 'react';
import {
  Bot,
  Users,
  Calendar,
  Video,
  FileText,
  TrendingUp,
  Clock,
  Plus,
  Wifi,
  Eye,
  MousePointer,
  Timer,
  Target,
  ChevronDown,
} from 'lucide-react';

import { useNotificationSocket } from '@/hooks/ws/useNotificationSocket';
import { TraceApi } from '@/services/trace';
import { AnalyticsData } from '@/services/trace/types';

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

// 时间范围选项
const timeRangeOptions = [
  { value: 1, label: '1天' },
  { value: 3, label: '3天' },
  { value: 7, label: '7天' },
  { value: 14, label: '14天' },
  { value: 30, label: '1个月' },
];

export default function DashboardPage() {
  const { isConnected, isConnecting, onlineUsers, connect } = useNotificationSocket();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState(1); // 默认1天

  // 自动连接WebSocket
  useEffect(() => {
    if (!isConnected && !isConnecting) {
      connect();
    }
  }, [isConnected, isConnecting, connect]);

  // 获取分析数据
  const fetchAnalytics = async (days: number) => {
    try {
      setLoading(true);

      const response = await TraceApi.getTraceList({ days });

      if (response.data?.data) {
        setAnalyticsData(response.data.data);
      } else {
        setAnalyticsData(null);
      }
    } catch (error) {
      console.error('获取分析数据失败:', error);
      setAnalyticsData(null);
    } finally {
      setLoading(false);
    }
  };

  // 处理时间范围变化
  const handleTimeRangeChange = (days: number) => {
    setSelectedTimeRange(days);
    fetchAnalytics(days);
  };

  useEffect(() => {
    fetchAnalytics(selectedTimeRange);
  }, []);

  const currentTime = new Date().toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // 格式化数值显示
  const formatValue = (value: number) => {
    if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'k';
    }

    return value.toString();
  };

  // 格式化变化值
  const formatChange = (change: number) => {
    const sign = change > 0 ? '+' : '';

    return `${sign}${change}`;
  };

  // 格式化趋势百分比
  const formatTrend = (trend: number) => {
    const sign = trend > 0 ? '+' : '';

    return `${sign}${trend}%`;
  };

  // 格式化平均停留时间（输入为毫秒）
  const formatDuration = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;

    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // 统计数据配置
  const statsConfig = [
    {
      key: 'pageviews',
      name: '页面浏览量',
      icon: <Eye className="w-6 h-6" />,
      color: 'bg-blue-500',
      formatter: (value: number) => formatValue(value),
    },
    {
      key: 'visitors',
      name: '访问者',
      icon: <Users className="w-6 h-6" />,
      color: 'bg-green-500',
      formatter: (value: number) => formatValue(value),
    },
    {
      key: 'visits',
      name: '访问次数',
      icon: <MousePointer className="w-6 h-6" />,
      color: 'bg-purple-500',
      formatter: (value: number) => formatValue(value),
    },
    {
      key: 'avgDuration',
      name: '平均停留时间',
      icon: <Timer className="w-6 h-6" />,
      color: 'bg-orange-500',
      formatter: (value: number) => `${formatDuration(value)} (分:秒)`,
      changeFormatter: (change: number) => `${formatChange(Math.floor(change / 1000))}秒`,
    },
    {
      key: 'bounceRate',
      name: '跳出率',
      icon: <Target className="w-6 h-6" />,
      color: 'bg-red-500',
      formatter: (value: number) => `${value}%`,
    },
  ];

  // 动态生成统计数据
  const quickStats = statsConfig.map((config) => {
    const data = analyticsData?.[config.key as keyof AnalyticsData];
    const hasData = !loading && data;

    return {
      name: config.name,
      icon: config.icon,
      color: config.color,
      value: hasData ? config.formatter(data.current) : '--',
      change: hasData
        ? config.changeFormatter
          ? config.changeFormatter(data.change)
          : formatChange(data.change)
        : '--',
      trend: hasData ? data.trend : undefined,
      trendText: hasData ? formatTrend(data.trend) : '--',
    };
  });

  return (
    <div className="p-6">
      {/* 欢迎区域 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">欢迎回来！</h1>
        <p className="text-gray-600">今天是个美好的工作日，{currentTime}</p>
      </div>

      {/* 数据概览区域 - 只有在有数据或加载中时才显示 */}
      {(loading || analyticsData) && (
        <>
          {/* 时间范围选择器 */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">数据概览</h2>
              <div className="relative">
                <select
                  value={selectedTimeRange}
                  onChange={(e) => handleTimeRangeChange(Number(e.target.value))}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {timeRangeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      最近 {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* 数据统计卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            {loading
              ? // 骨架屏
                Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-gray-200 rounded animate-pulse mr-1"></div>
                        <div className="w-8 h-4 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    </div>
                    <div>
                      <div className="w-16 h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
                      <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                ))
              : // 实际数据
                quickStats.map((stat, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center text-white`}
                      >
                        {stat.icon}
                      </div>
                      <div
                        className={`flex items-center text-sm ${
                          stat.trend && stat.trend > 0
                            ? 'text-green-600'
                            : stat.trend && stat.trend < 0
                              ? 'text-red-600'
                              : 'text-gray-600'
                        }`}
                      >
                        <TrendingUp
                          className={`w-4 h-4 mr-1 ${stat.trend && stat.trend < 0 ? 'rotate-180' : ''}`}
                        />
                        {stat.trendText || stat.change}
                      </div>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
                      <p className="text-sm text-gray-600">{stat.name}</p>
                    </div>
                  </div>
                ))}
          </div>
        </>
      )}

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
                <Bot className="w-4 h-4" />
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
