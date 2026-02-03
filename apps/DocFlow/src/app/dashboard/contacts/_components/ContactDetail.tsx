'use client';

import { X, Mail, Phone, Building2, User, Star, MessageCircle, Video } from 'lucide-react';

import { MOCK_CONTACTS } from './mock-data';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ContactDetailProps {
  contactId: string | null;
  onClose: () => void;
}

export default function ContactDetail({ contactId, onClose }: ContactDetailProps) {
  if (!contactId) {
    return null;
  }

  const contact = MOCK_CONTACTS.find((c) => c.id === contactId);

  if (!contact) {
    return null;
  }

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full">
      {/* 头部 */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-900">联系人详情</h3>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* 内容 */}
      <div className="flex-1 overflow-y-auto">
        {/* 用户基本信息 */}
        <div className="p-6 text-center border-b border-gray-200">
          <div className="relative inline-block mb-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={contact.avatar} alt={contact.name} />
              <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white text-2xl">
                {contact.name.slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            {/* 在线状态 */}
            {contact.status === 'online' && (
              <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-center space-x-2">
              <h4 className="text-lg font-semibold text-gray-900">{contact.name}</h4>
              <button className="text-gray-400 hover:text-yellow-500 transition-colors">
                <Star
                  className={`w-5 h-5 ${contact.isStarred ? 'fill-yellow-400 text-yellow-400' : ''}`}
                />
              </button>
            </div>
            {contact.isManager && (
              <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                管理员
              </Badge>
            )}
            <p className="text-sm text-gray-500">
              {contact.department} · {contact.title}
            </p>
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center justify-center space-x-2 mt-4">
            <Button size="sm" variant="outline" className="flex-1">
              <MessageCircle className="w-4 h-4 mr-1.5" />
              消息
            </Button>
            <Button size="sm" variant="outline" className="flex-1">
              <Video className="w-4 h-4 mr-1.5" />
              视频
            </Button>
          </div>
        </div>

        {/* 详细信息 */}
        <div className="p-4 space-y-4">
          {/* 联系方式 */}
          <div>
            <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              联系方式
            </h5>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <Mail className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 mb-0.5">邮箱</p>
                  <p className="text-sm text-gray-900 break-all">{contact.email}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Phone className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 mb-0.5">电话</p>
                  <p className="text-sm text-gray-900">{contact.phone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 组织信息 */}
          <div>
            <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              组织信息
            </h5>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <Building2 className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 mb-0.5">部门</p>
                  <p className="text-sm text-gray-900">{contact.department}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <User className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 mb-0.5">职位</p>
                  <p className="text-sm text-gray-900">{contact.title}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 个人简介 */}
          {contact.bio && (
            <div>
              <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                个人简介
              </h5>
              <p className="text-sm text-gray-700 leading-relaxed">{contact.bio}</p>
            </div>
          )}

          {/* 标签 */}
          {contact.tags && contact.tags.length > 0 && (
            <div>
              <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                标签
              </h5>
              <div className="flex flex-wrap gap-2">
                {contact.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
