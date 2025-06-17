import { Search, Plus, Building, Phone, Mail } from 'lucide-react';

const mockContacts = [
  {
    id: 1,
    name: '张三',
    avatar: '👨‍💼',
    title: '产品经理',
    department: '产品部',
    phone: '138-0000-0001',
    email: 'zhangsan@company.com',
    status: 'online',
  },
  {
    id: 2,
    name: '李四',
    avatar: '👩‍💻',
    title: '前端工程师',
    department: '技术部',
    phone: '138-0000-0002',
    email: 'lisi@company.com',
    status: 'away',
  },
  {
    id: 3,
    name: '王五',
    avatar: '👨‍🎨',
    title: 'UI设计师',
    department: '设计部',
    phone: '138-0000-0003',
    email: 'wangwu@company.com',
    status: 'offline',
  },
  {
    id: 4,
    name: '赵六',
    avatar: '👩‍💼',
    title: '运营专员',
    department: '运营部',
    phone: '138-0000-0004',
    email: 'zhaoliu@company.com',
    status: 'online',
  },
  {
    id: 5,
    name: '孙七',
    avatar: '👨‍💻',
    title: '后端工程师',
    department: '技术部',
    phone: '138-0000-0005',
    email: 'sunqi@company.com',
    status: 'online',
  },
];

const departments = [
  { name: '全公司', count: 25, icon: '🏢' },
  { name: '技术部', count: 8, icon: '💻' },
  { name: '产品部', count: 5, icon: '📱' },
  { name: '设计部', count: 4, icon: '🎨' },
  { name: '运营部', count: 4, icon: '📊' },
  { name: '销售部', count: 4, icon: '💼' },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'online':
      return 'bg-green-500';
    case 'away':
      return 'bg-yellow-500';
    case 'offline':
      return 'bg-gray-400';
    default:
      return 'bg-gray-400';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'online':
      return '在线';
    case 'away':
      return '离开';
    case 'offline':
      return '离线';
    default:
      return '未知';
  }
};

export default function ContactsPage() {
  return (
    <div className="flex h-full">
      {/* 左侧部门列表 */}
      <div className="w-64 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-900 mb-4">通讯录</h1>

          {/* 搜索框 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索联系人"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* 部门列表 */}
        <div className="flex-1 overflow-y-auto py-2">
          {departments.map((dept, index) => (
            <button
              key={index}
              className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 text-left"
            >
              <span className="text-lg">{dept.icon}</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{dept.name}</p>
                <p className="text-xs text-gray-500">{dept.count} 人</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 右侧联系人列表 */}
      <div className="flex-1 flex flex-col">
        {/* 头部操作栏 */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Building className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">全公司</h2>
              <span className="text-sm text-gray-500">({mockContacts.length} 人)</span>
            </div>
            <button className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Plus className="w-4 h-4" />
              <span>添加联系人</span>
            </button>
          </div>
        </div>

        {/* 联系人列表 */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 p-4">
            {mockContacts.map((contact) => (
              <div
                key={contact.id}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start space-x-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-xl">
                      {contact.avatar}
                    </div>
                    <div
                      className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(contact.status)} rounded-full border-2 border-white`}
                    ></div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">{contact.name}</h3>
                    <p className="text-xs text-gray-600 truncate">{contact.title}</p>
                    <p className="text-xs text-gray-500 truncate">{contact.department}</p>
                    <p className="text-xs text-green-600 mt-1">{getStatusText(contact.status)}</p>
                  </div>
                </div>

                <div className="mt-3 space-y-2">
                  <div className="flex items-center space-x-2 text-xs text-gray-600">
                    <Phone className="w-3 h-3" />
                    <span>{contact.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-600">
                    <Mail className="w-3 h-3" />
                    <span className="truncate">{contact.email}</span>
                  </div>
                </div>

                <div className="mt-3 flex space-x-2">
                  <button className="flex-1 px-3 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100">
                    发消息
                  </button>
                  <button className="flex-1 px-3 py-1 text-xs bg-gray-50 text-gray-600 rounded hover:bg-gray-100">
                    视频通话
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
