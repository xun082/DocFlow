'use client';

import { useState } from 'react';

import ContactCategoryList from './_components/ContactCategoryList';
import ContactDetail from './_components/ContactDetail';

export default function ContactsLayout({ children }: { children: React.ReactNode }) {
  const [selectedContact, setSelectedContact] = useState<string | null>(null);

  return (
    <div className="flex h-full bg-gray-50">
      {/* 左侧分类栏 */}
      <ContactCategoryList />

      {/* 中间内容区域（由子路由渲染） */}
      {children}

      {/* 右侧详情栏 */}
      <ContactDetail contactId={selectedContact} onClose={() => setSelectedContact(null)} />
    </div>
  );
}
