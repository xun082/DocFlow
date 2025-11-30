'use client';

import { useState } from 'react';
import { Search, UserPlus, Users } from 'lucide-react';

import AddContactDialog from './AddContactDialog';
import ContactListContainer from './ContactListContainer';
import { MOCK_CONTACTS } from './mock-data';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ContactMemberListProps {
  category: string;
}

export default function ContactMemberList({ category }: ContactMemberListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<string | null>(null);

  const handleAddSuccess = () => {
    console.log('好友申请发送成功');
  };

  // 根据分类筛选联系人
  const filteredContacts = MOCK_CONTACTS.filter((contact) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        contact.name.toLowerCase().includes(query) ||
        contact.department.toLowerCase().includes(query) ||
        contact.email.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }

    switch (category) {
      case 'org-all':
        return !contact.isExternal;
      case 'external':
        return contact.isExternal;
      case 'starred':
        return contact.isStarred;
      default:
        return true;
    }
  });

  const getCategoryTitle = () => {
    switch (category) {
      case 'org-all':
        return '组织内联系人';
      case 'external':
        return '外部联系人';
      case 'starred':
        return '星标联系人';
      case 'groups':
        return '我的群组';
      case 'service':
        return '服务台';
      default:
        return '联系人';
    }
  };

  const getAddButtonText = () => {
    switch (category) {
      case 'external':
        return '添加联系人';
      case 'groups':
        return '创建群组';
      default:
        return '添加企业成员';
    }
  };

  const getDialogType = (): 'internal' | 'external' | 'group' => {
    switch (category) {
      case 'external':
        return 'external';
      case 'groups':
        return 'group';
      default:
        return 'internal';
    }
  };

  const showAddButton = !['starred', 'service'].includes(category);

  // 搜索框组件
  const searchBar = (
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
  );

  // 操作按钮组件
  const actionButton = showAddButton ? (
    <Button size="sm" className="h-8" onClick={() => setAddDialogOpen(true)}>
      <UserPlus className="w-4 h-4 mr-1.5" />
      {getAddButtonText()}
    </Button>
  ) : null;

  return (
    <>
      <ContactListContainer title={getCategoryTitle()} action={actionButton} searchBar={searchBar}>
        {filteredContacts.length > 0 ? (
          <ul className="divide-y divide-gray-100">
            {filteredContacts.map((contact) => {
              const isActive = selectedContact === contact.id;

              return (
                <li key={contact.id}>
                  <button
                    onClick={() => setSelectedContact(contact.id)}
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
      </ContactListContainer>

      {/* 添加联系人对话框 */}
      <AddContactDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        type={getDialogType()}
        onSuccess={handleAddSuccess}
      />
    </>
  );
}
