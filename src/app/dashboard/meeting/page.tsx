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
    <div className="mx-auto max-w-4xl p-6">
      {/* 页面头部 */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">视频会议</h1>
        <p className="text-gray-600">管理和参加视频会议</p>
      </div>

      {/* 快速操作 */}
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <button className="flex items-center justify-center space-x-3 rounded-xl bg-blue-600 p-6 text-white transition-colors hover:bg-blue-700">
          <Video className="h-6 w-6" />
          <span className="font-medium">立即开会</span>
        </button>

        <button className="flex items-center justify-center space-x-3 rounded-xl border-2 border-dashed border-gray-300 p-6 text-gray-600 transition-colors hover:border-gray-400 hover:text-gray-700">
          <Plus className="h-6 w-6" />
          <span className="font-medium">预约会议</span>
        </button>

        <button className="flex items-center justify-center space-x-3 rounded-xl border-2 border-dashed border-gray-300 p-6 text-gray-600 transition-colors hover:border-gray-400 hover:text-gray-700">
          <Calendar className="h-6 w-6" />
          <span className="font-medium">加入会议</span>
        </button>
      </div>

      {/* 即将到来的会议 */}
      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">即将到来的会议</h2>
        <div className="space-y-4">
          {upcomingMeetings.map((meeting) => (
            <div
              key={meeting.id}
              className="rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="mb-2 font-semibold text-gray-900">{meeting.title}</h3>
                  <div className="mb-3 flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>
                        {meeting.date} {meeting.time}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{meeting.participants.length} 参与者</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">参与者:</span>
                    <div className="flex -space-x-2">
                      {meeting.participants.slice(0, 3).map((participant, index) => (
                        <div
                          key={index}
                          className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-gray-300 text-xs"
                        >
                          {participant[0]}
                        </div>
                      ))}
                      {meeting.participants.length > 3 && (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-gray-100 text-xs text-gray-600">
                          +{meeting.participants.length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">
                    加入会议
                  </button>
                  <button className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
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
        <h2 className="mb-4 text-xl font-semibold text-gray-900">最近的会议</h2>
        <div className="space-y-4">
          {recentMeetings.map((meeting) => (
            <div key={meeting.id} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="mb-2 font-semibold text-gray-900">{meeting.title}</h3>
                  <div className="mb-3 flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>
                        {meeting.date} {meeting.time}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{meeting.participants.length} 参与者</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">参与者:</span>
                    <div className="flex -space-x-2">
                      {meeting.participants.map((participant, index) => (
                        <div
                          key={index}
                          className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-gray-300 text-xs"
                        >
                          {participant[0]}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <span className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-800">
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
        <div className="py-12 text-center">
          <Video className="mx-auto mb-4 h-16 w-16 text-gray-300" />
          <h3 className="mb-2 text-lg font-medium text-gray-900">没有即将到来的会议</h3>
          <p className="mb-4 text-gray-600">创建一个新的会议开始协作</p>
          <button className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
            创建会议
          </button>
        </div>
      )}
    </div>
  );
}
