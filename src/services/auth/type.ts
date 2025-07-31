export interface User {
  id: number;
  name: string;
  avatar_url: string;
  bio?: string | null;
  company?: string | null;
  created_at: string;
  email?: string | null;
  github_id?: string | null;
  is_active: boolean;
  last_login_at: string;
  location?: string | null;
  role: string;
  updated_at: string;
  website_url?: string | null;
  preferences?: any | null;
}
