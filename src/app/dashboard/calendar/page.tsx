import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

const mockEvents = [
  {
    id: 1,
    title: '产品评审会议',
    time: '09:00 - 10:30',
    type: 'meeting',
    color: 'bg-blue-500',
  },
  {
    id: 2,
    title: '技术分享',
    time: '14:00 - 15:00',
    type: 'presentation',
    color: 'bg-green-500',
  },
  {
    id: 3,
    title: '一对一沟通',
    time: '16:00 - 16:30',
    type: 'meeting',
    color: 'bg-purple-500',
  },
];

export default function CalendarPage() {
  const today = new Date();
  const currentMonth = today.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' });

  return (
    <div className="flex h-full">
      {/* 左侧侧边栏 */}
      <div className="w-80 border-r border-gray-200 flex flex-col">
        <div className="px-4 py-3 border-b border-gray-200">
          <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Plus className="w-4 h-4" />
            <span>创建日程</span>
          </button>
        </div>

        {/* 小日历 */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">{currentMonth}</h3>
            <div className="flex space-x-1">
              <button className="p-1 hover:bg-gray-100 rounded">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="p-1 hover:bg-gray-100 rounded">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 简化的小日历 */}
          <div className="grid grid-cols-7 gap-1 text-xs text-center">
            {['日', '一', '二', '三', '四', '五', '六'].map((day) => (
              <div key={day} className="font-medium text-gray-500 p-2">
                {day}
              </div>
            ))}
            {Array.from({ length: 35 }, (_, i) => {
              const date = i - 5; // 简化处理

              return (
                <button
                  key={i}
                  className={`p-2 hover:bg-gray-100 rounded ${
                    date === today.getDate() ? 'bg-blue-600 text-white' : ''
                  } ${date <= 0 || date > 31 ? 'text-gray-300' : 'text-gray-900'}`}
                >
                  {date > 0 && date <= 31 ? date : ''}
                </button>
              );
            })}
          </div>
        </div>

        {/* 今日日程 */}
        <div className="flex-1 p-4">
          <h3 className="font-semibold text-gray-900 mb-4">今日日程</h3>
          <div className="space-y-3">
            {mockEvents.map((event) => (
              <div key={event.id} className="flex items-start space-x-3">
                <div className={`w-3 h-3 rounded-full ${event.color} mt-1 flex-shrink-0`}></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{event.title}</p>
                  <p className="text-xs text-gray-600">{event.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 主日历视图 */}
      <div className="flex-1 flex flex-col">
        {/* 头部 */}
        <div className="px-4 py-[14px] border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-semibold text-gray-900">日历</h1>
              <div className="flex items-center space-x-2">
                <button className="p-2 hover:bg-gray-100 rounded">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="font-medium text-gray-900 min-w-[120px] text-center">
                  {currentMonth}
                </span>
                <button className="p-2 hover:bg-gray-100 rounded">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                今天
              </button>
              <div className="flex border border-gray-300 rounded overflow-hidden">
                <button className="px-3 py-1 text-sm bg-blue-600 text-white">月</button>
                <button className="px-3 py-1 text-sm hover:bg-gray-50">周</button>
                <button className="px-3 py-1 text-sm hover:bg-gray-50">日</button>
              </div>
            </div>
          </div>
        </div>

        {/* 日历网格 */}
        <div className="flex-1 p-4">
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            {/* 星期头部 */}
            <div className="grid grid-cols-7 border-b border-gray-200">
              {['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'].map((day) => (
                <div
                  key={day}
                  className="p-4 text-center font-medium text-gray-700 border-r border-gray-200 last:border-r-0"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* 日期网格 */}
            <div className="grid grid-cols-7" style={{ height: '600px' }}>
              {Array.from({ length: 35 }, (_, i) => {
                const date = i - 5; // 简化处理
                const isToday = date === today.getDate();

                return (
                  <div
                    key={i}
                    className="border-r border-b border-gray-200 last:border-r-0 p-2 hover:bg-gray-50 cursor-pointer"
                  >
                    <div
                      className={`text-sm ${
                        date <= 0 || date > 31
                          ? 'text-gray-300'
                          : isToday
                            ? 'bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center'
                            : 'text-gray-900'
                      }`}
                    >
                      {date > 0 && date <= 31 ? date : ''}
                    </div>

                    {/* 示例事件 */}
                    {date === today.getDate() && (
                      <div className="mt-1 space-y-1">
                        <div className="text-xs bg-blue-100 text-blue-800 p-1 rounded truncate">
                          产品评审
                        </div>
                        <div className="text-xs bg-green-100 text-green-800 p-1 rounded truncate">
                          技术分享
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
