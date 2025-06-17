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
      <div className="w-80 border-r border-gray-200 flex flex-col">
        {/* 头部 */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-gray-900">消息</h1>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Plus className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* 搜索框 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索 (⌘+K)"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* 消息列表 */}
        <div className="flex-1 overflow-y-auto">
          {mockMessages.map((message) => (
            <div
              key={message.id}
              className="flex items-center space-x-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
            >
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-lg">
                  {message.avatar}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 truncate">{message.name}</p>
                  <p className="text-xs text-gray-500">{message.time}</p>
                </div>
                <p className="text-sm text-gray-600 truncate mt-1">{message.lastMessage}</p>
              </div>

              {message.unread > 0 && (
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-red-500 rounded-full">
                    {message.unread}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 右侧聊天区域 */}
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-2xl">💬</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">你的每一个好想法，都让AI惊喜</h3>
          <p className="text-gray-600 max-w-md">选择一个对话开始聊天，或者创建新的对话</p>
        </div>
      </div>
    </div>
  );
}
