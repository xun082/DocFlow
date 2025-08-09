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
      <div className="flex w-64 flex-col border-r border-gray-200">
        <div className="border-b border-gray-200 p-4">
          <h1 className="mb-4 text-xl font-semibold text-gray-900">通讯录</h1>

          {/* 搜索框 */}
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <input
              type="text"
              placeholder="搜索联系人"
              className="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* 部门列表 */}
        <div className="flex-1 overflow-y-auto py-2">
          {departments.map((dept, index) => (
            <button
              key={index}
              className="flex w-full items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50"
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
      <div className="flex flex-1 flex-col">
        {/* 头部操作栏 */}
        <div className="border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Building className="h-5 w-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">全公司</h2>
              <span className="text-sm text-gray-500">({mockContacts.length} 人)</span>
            </div>
            <button className="flex items-center space-x-2 rounded-lg bg-blue-600 px-3 py-2 text-white hover:bg-blue-700">
              <Plus className="h-4 w-4" />
              <span>添加联系人</span>
            </button>
          </div>
        </div>

        {/* 联系人列表 */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 gap-4 p-4 lg:grid-cols-2 xl:grid-cols-3">
            {mockContacts.map((contact) => (
              <div
                key={contact.id}
                className="cursor-pointer rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md"
              >
                <div className="flex items-start space-x-3">
                  <div className="relative">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 text-xl">
                      {contact.avatar}
                    </div>
                    <div
                      className={`absolute -right-1 -bottom-1 h-4 w-4 ${getStatusColor(contact.status)} rounded-full border-2 border-white`}
                    ></div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-semibold text-gray-900">{contact.name}</h3>
                    <p className="truncate text-xs text-gray-600">{contact.title}</p>
                    <p className="truncate text-xs text-gray-500">{contact.department}</p>
                    <p className="mt-1 text-xs text-green-600">{getStatusText(contact.status)}</p>
                  </div>
                </div>

                <div className="mt-3 space-y-2">
                  <div className="flex items-center space-x-2 text-xs text-gray-600">
                    <Phone className="h-3 w-3" />
                    <span>{contact.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-600">
                    <Mail className="h-3 w-3" />
                    <span className="truncate">{contact.email}</span>
                  </div>
                </div>

                <div className="mt-3 flex space-x-2">
                  <button className="flex-1 rounded bg-blue-50 px-3 py-1 text-xs text-blue-600 hover:bg-blue-100">
                    发消息
                  </button>
                  <button className="flex-1 rounded bg-gray-50 px-3 py-1 text-xs text-gray-600 hover:bg-gray-100">
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
