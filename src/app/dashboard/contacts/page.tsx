'use client';

import { useState } from 'react';

import ContactCategoryList from './_components/ContactCategoryList';
import ContactDetail from './_components/ContactDetail';
import ContactMemberList from './_components/ContactMemberList';

export default function ContactsPage() {
  const [selectedCategory, setSelectedCategory] = useState('org-all');
  const [selectedContact, setSelectedContact] = useState<string | null>(null);

  return (
    <div className="flex h-full bg-gray-50">
      {/* 左侧分类栏 */}
      <ContactCategoryList
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* 中间成员列表 */}
      <ContactMemberList
        selectedCategory={selectedCategory}
        selectedContact={selectedContact}
        onSelectContact={setSelectedContact}
      />

      {/* 右侧详情栏 */}
      <ContactDetail contactId={selectedContact} onClose={() => setSelectedContact(null)} />
    </div>
  );
}
