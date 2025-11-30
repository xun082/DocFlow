'use client';

import { useState } from 'react';
import { Search, UserPlus, Users } from 'lucide-react';

import { MOCK_CONTACTS } from './mock-data';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ContactMemberListProps {
  selectedCategory: string;
  selectedContact: string | null;
  onSelectContact: (contactId: string) => void;
}

export default function ContactMemberList({
  selectedCategory,
  selectedContact,
  onSelectContact,
}: ContactMemberListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // 根据分类筛选联系人
  const filteredContacts = MOCK_CONTACTS.filter((contact) => {
    // 根据搜索筛选
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        contact.name.toLowerCase().includes(query) ||
        contact.department.toLowerCase().includes(query) ||
        contact.email.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }

    // 根据分类筛选
    switch (selectedCategory) {
      case 'org-all':
        return !contact.isExternal;
      case 'external':
        return contact.isExternal;
      case 'starred':
        return contact.isStarred;
      case 'new':
        // 假设最近 7 天创建的是新联系人
        return false; // 这里可以根据实际的创建时间判断
      case 'groups':
        return false; // 群组功能暂未实现
      case 'service':
        return false; // 服务台功能暂未实现
      default:
        return true;
    }
  });

  const getCategoryTitle = () => {
    switch (selectedCategory) {
      case 'org-all':
        return '组织内联系人';
      case 'external':
        return '外部联系人';
      case 'starred':
        return '星标联系人';
      case 'new':
        return '新的联系人';
      case 'groups':
        return '我的群组';
      case 'service':
        return '服务台';
      default:
        return '联系人';
    }
  };

  return (
    <div className="flex-1 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* 头部 */}
      <div className="p-4 border-b border-gray-200 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">{getCategoryTitle()}</h3>
          <Button size="sm" className="h-8">
            <UserPlus className="w-4 h-4 mr-1.5" />
            添加企业成员
          </Button>
        </div>

        {/* 搜索框 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="搜索联系人"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-9"
          />
        </div>
      </div>

      {/* 联系人列表 */}
      <div className="flex-1 overflow-y-auto">
        {filteredContacts.length > 0 ? (
          <ul className="divide-y divide-gray-100">
            {filteredContacts.map((contact) => {
              const isActive = selectedContact === contact.id;

              return (
                <li key={contact.id}>
                  <button
                    onClick={() => onSelectContact(contact.id)}
                    className={`
                      w-full px-4 py-3 flex items-center space-x-3 hover:bg-gray-50
                      transition-colors duration-150
                      ${isActive ? 'bg-blue-50' : ''}
                    `}
                  >
                    {/* 头像 */}
                    <div className="relative flex-shrink-0">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={contact.avatar} alt={contact.name} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white">
                          {contact.name.slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      {/* 在线状态指示器 */}
                      {contact.status === 'online' && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                      )}
                      {contact.status === 'away' && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-yellow-500 border-2 border-white rounded-full" />
                      )}
                    </div>

                    {/* 信息 */}
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900 truncate">{contact.name}</p>
                        {contact.isManager && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700">
                            管理员
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 truncate">
                        {contact.department} · {contact.title}
                      </p>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <Users className="w-16 h-16 mb-3" />
            <p className="text-sm">暂无联系人</p>
          </div>
        )}
      </div>
    </div>
  );
}
