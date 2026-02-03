export interface Contact {
  id: string;
  name: string;
  avatar?: string;
  title: string;
  department: string;
  phone: string;
  email: string;
  status: 'online' | 'away' | 'offline';
  isStarred?: boolean;
  isManager?: boolean;
  bio?: string;
  tags?: string[];
  isExternal?: boolean;
}

export interface ContactCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  href: string;
  count?: number;
  badge?: string;
}
