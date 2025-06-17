import { Video, Plus, Clock, Users, Calendar } from 'lucide-react';

const upcomingMeetings = [
  {
    id: 1,
    title: '每周产品评审',
    time: '14:00 - 15:00',
    date: '今天',
    participants: ['张三', '李四', '王五'],
    status: 'upcoming',
  },
  {
    id: 2,
    title: '技术架构讨论',
    time: '16:00 - 17:00',
    date: '明天',
    participants: ['李四', '孙七', '周八'],
    status: 'scheduled',
  },
];

const recentMeetings = [
  {
    id: 3,
    title: 'UI设计评审',
    time: '10:00 - 11:00',
    date: '昨天',
    participants: ['王五', '张三'],
    status: 'completed',
  },
];

export default function MeetingPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* 页面头部 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">视频会议</h1>
        <p className="text-gray-600">管理和参加视频会议</p>
      </div>

      {/* 快速操作 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <button className="flex items-center justify-center space-x-3 p-6 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
          <Video className="w-6 h-6" />
          <span className="font-medium">立即开会</span>
        </button>

        <button className="flex items-center justify-center space-x-3 p-6 border-2 border-dashed border-gray-300 text-gray-600 rounded-xl hover:border-gray-400 hover:text-gray-700 transition-colors">
          <Plus className="w-6 h-6" />
          <span className="font-medium">预约会议</span>
        </button>

        <button className="flex items-center justify-center space-x-3 p-6 border-2 border-dashed border-gray-300 text-gray-600 rounded-xl hover:border-gray-400 hover:text-gray-700 transition-colors">
          <Calendar className="w-6 h-6" />
          <span className="font-medium">加入会议</span>
        </button>
      </div>

      {/* 即将到来的会议 */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">即将到来的会议</h2>
        <div className="space-y-4">
          {upcomingMeetings.map((meeting) => (
            <div
              key={meeting.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">{meeting.title}</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>
                        {meeting.date} {meeting.time}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{meeting.participants.length} 参与者</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">参与者:</span>
                    <div className="flex -space-x-2">
                      {meeting.participants.slice(0, 3).map((participant, index) => (
                        <div
                          key={index}
                          className="w-6 h-6 bg-gray-300 rounded-full border-2 border-white flex items-center justify-center text-xs"
                        >
                          {participant[0]}
                        </div>
                      ))}
                      {meeting.participants.length > 3 && (
                        <div className="w-6 h-6 bg-gray-100 rounded-full border-2 border-white flex items-center justify-center text-xs text-gray-600">
                          +{meeting.participants.length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                    加入会议
                  </button>
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm">
                    详情
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 最近的会议 */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">最近的会议</h2>
        <div className="space-y-4">
          {recentMeetings.map((meeting) => (
            <div key={meeting.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">{meeting.title}</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>
                        {meeting.date} {meeting.time}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{meeting.participants.length} 参与者</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">参与者:</span>
                    <div className="flex -space-x-2">
                      {meeting.participants.map((participant, index) => (
                        <div
                          key={index}
                          className="w-6 h-6 bg-gray-300 rounded-full border-2 border-white flex items-center justify-center text-xs"
                        >
                          {participant[0]}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    已完成
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 空状态提示 */}
      {upcomingMeetings.length === 0 && (
        <div className="text-center py-12">
          <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">没有即将到来的会议</h3>
          <p className="text-gray-600 mb-4">创建一个新的会议开始协作</p>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            创建会议
          </button>
        </div>
      )}
    </div>
  );
}
