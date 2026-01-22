'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Bot,
  Users,
  Calendar,
  Video,
  FileText,
  TrendingUp,
  Clock,
  Plus,
  Eye,
  MousePointer,
  Timer,
  Target,
  ChevronDown,
} from 'lucide-react';

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
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState(1); // 默认1天

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

    return `${sign}${Number(trend).toFixed(2)}%`;
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
      formatter: (value: number) => {
        return `${value}%`;
      },
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
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-gray-50">
      {/* 欢迎区域 */}
      <div className="mb-8 sm:mb-10">
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-200">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">欢迎回来！</h1>
          <p className="text-gray-600 text-sm sm:text-base flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            今天是个美好的工作日，{currentTime}
          </p>
        </div>
      </div>

      {/* 数据概览区域 */}
      {(loading || analyticsData) && (
        <>
          {/* 时间范围选择器 */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">数据概览</h2>
              <div className="relative">
                <select
                  value={selectedTimeRange}
                  onChange={(e) => handleTimeRangeChange(Number(e.target.value))}
                  className="appearance-none bg-white border-2 border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm font-semibold text-gray-700 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-full sm:w-auto transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer"
                >
                  {timeRangeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      最近 {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* 数据统计卡片 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-5 mb-8 sm:mb-10">
            {loading
              ? // 骨架屏
                Array.from({ length: 5 }).map((_, index) => (
                  <div
                    key={index}
                    className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-gray-200 rounded animate-pulse mr-1"></div>
                        <div className="w-10 h-4 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    </div>
                    <div>
                      <div className="w-20 h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
                      <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                ))
              : // 实际数据
                quickStats.map((stat, index) => (
                  <div
                    key={index}
                    className="group bg-white border border-gray-200 rounded-xl p-5 sm:p-6 shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className={`w-12 h-12 sm:w-14 sm:h-14 ${stat.color} rounded-lg flex items-center justify-center text-white`}
                      >
                        {stat.icon}
                      </div>
                      <div
                        className={`flex items-center text-xs sm:text-sm font-medium px-2.5 py-1 rounded-full ${
                          stat.trend && stat.trend > 0
                            ? 'text-green-700 bg-green-50'
                            : stat.trend && stat.trend < 0
                              ? 'text-red-700 bg-red-50'
                              : 'text-gray-600 bg-gray-50'
                        }`}
                      >
                        <TrendingUp
                          className={`w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 ${stat.trend && stat.trend < 0 ? 'rotate-180' : ''}`}
                        />
                        <span className="hidden sm:inline">{stat.trendText || stat.change}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                        {stat.value}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600 font-medium">{stat.name}</p>
                    </div>
                  </div>
                ))}
          </div>
        </>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
        {/* 快速操作 */}
        <div className="xl:col-span-2">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">快速操作</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-8">
            {quickActions.map((action, index) => (
              <button
                key={index}
                className={`group ${action.color} text-white p-6 sm:p-7 rounded-xl transition-all duration-200 text-left shadow-sm hover:shadow-lg hover:-translate-y-1`}
              >
                <div className="mb-4">{action.icon}</div>
                <h3 className="font-bold mb-2 text-base sm:text-lg">{action.name}</h3>
                <p className="text-xs sm:text-sm opacity-90">{action.description}</p>
              </button>
            ))}
          </div>

          {/* 最近活动 */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6 shadow-sm">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-5">最近活动</h3>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="group flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-all duration-200 cursor-pointer"
                >
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-base flex-shrink-0">
                    {activity.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{activity.title}</p>
                    <div className="flex items-center text-xs text-gray-500 mt-1.5">
                      <Clock className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
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
          {/* 今日日程 */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">今日日程</h3>
              <button className="w-9 h-9 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center justify-center">
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="border-l-4 border-blue-600 pl-4 py-2">
                  <p className="font-bold text-gray-900 text-sm mb-1">{event.title}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-600">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {event.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {event.participants} 人参与
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 快捷导航 */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6 shadow-sm">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-5">快捷导航</h3>
            <div className="space-y-2">
              <Link
                href="/dashboard/messages"
                prefetch={false}
                className="flex items-center space-x-3 text-gray-600 hover:text-gray-900 transition-colors p-3 rounded-lg hover:bg-gray-50"
              >
                <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Bot className="w-4 h-4 text-gray-600 flex-shrink-0" />
                </div>
                <span className="text-sm font-semibold">查看消息</span>
              </Link>
              <Link
                href="/dashboard/contacts"
                prefetch={false}
                className="flex items-center space-x-3 text-gray-600 hover:text-gray-900 transition-colors p-3 rounded-lg hover:bg-gray-50"
              >
                <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Users className="w-4 h-4 text-gray-600 flex-shrink-0" />
                </div>
                <span className="text-sm font-semibold">通讯录</span>
              </Link>
              <Link
                href="/docs"
                prefetch={false}
                className="flex items-center space-x-3 text-gray-600 hover:text-gray-900 transition-colors p-3 rounded-lg hover:bg-gray-50"
              >
                <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-gray-600 flex-shrink-0" />
                </div>
                <span className="text-sm font-semibold">文档协作</span>
              </Link>
              <Link
                href="/dashboard/calendar"
                prefetch={false}
                className="flex items-center space-x-3 text-gray-600 hover:text-gray-900 transition-colors p-3 rounded-lg hover:bg-gray-50"
              >
                <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-gray-600 flex-shrink-0" />
                </div>
                <span className="text-sm font-semibold">查看日历</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
