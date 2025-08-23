import { Metadata } from 'next';

import UserProfileClient from './UserProfileClient';

export const metadata: Metadata = {
  title: '个人资料',
  description: '管理你的个人信息和资料',
};

export default function UserProfile() {
  return <UserProfileClient />;
}
