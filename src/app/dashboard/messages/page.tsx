import { Search, Plus } from 'lucide-react';

const mockMessages = [
  {
    id: 1,
    name: '账号安全中心',
    avatar: '🔒',
    lastMessage: '安全登录通知',
    time: '09:04',
    unread: 0,
    type: 'system',
  },
  {
    id: 2,
    name: '开发者小助手',
    avatar: '🤖',
    lastMessage: '【自建应用发布市场】待你审批',
    time: '5月17日',
    unread: 1,
    type: 'bot',
  },
  {
    id: 3,
    name: '审批',
    avatar: '📋',
    lastMessage: '你已成功有新批次负责人',
    time: '',
    unread: 0,
    type: 'workflow',
  },
  {
    id: 4,
    name: '管理员小助手',
    avatar: '👨‍💼',
    lastMessage: '企业级AI应用开发平台-限时免费试用！【豆包大模型能力】',
    time: '2024年12月12日',
    unread: 3,
    type: 'bot',
  },
  {
    id: 5,
    name: '视频会议助手',
    avatar: '📹',
    lastMessage: '会议室明日有安排',
    time: '2024年10月10日',
    unread: 0,
    type: 'bot',
  },
];

export default function MessagesPage() {
  return (
    <div className="flex h-full">
      {/* 左侧消息列表 */}
      <div className="flex w-80 flex-col border-r border-gray-200">
        {/* 头部 */}
        <div className="border-b border-gray-200 p-4">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">消息</h1>
            <button className="rounded-lg p-2 hover:bg-gray-100">
              <Plus className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          {/* 搜索框 */}
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <input
              type="text"
              placeholder="搜索 (⌘+K)"
              className="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* 消息列表 */}
        <div className="flex-1 overflow-y-auto">
          {mockMessages.map((message) => (
            <div
              key={message.id}
              className="flex cursor-pointer items-center space-x-3 border-b border-gray-100 p-3 hover:bg-gray-50"
            >
              <div className="flex-shrink-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-lg">
                  {message.avatar}
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="truncate text-sm font-medium text-gray-900">{message.name}</p>
                  <p className="text-xs text-gray-500">{message.time}</p>
                </div>
                <p className="mt-1 truncate text-sm text-gray-600">{message.lastMessage}</p>
              </div>

              {message.unread > 0 && (
                <div className="flex-shrink-0">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
                    {message.unread}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 右侧聊天区域 */}
      <div className="flex flex-1 items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-200">
            <span className="text-2xl">💬</span>
          </div>
          <h3 className="mb-2 text-lg font-medium text-gray-900">你的每一个好想法，都让AI惊喜</h3>
          <p className="max-w-md text-gray-600">选择一个对话开始聊天，或者创建新的对话</p>
        </div>
      </div>
    </div>
  );
}
