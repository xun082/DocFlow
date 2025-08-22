export interface User {
  id: number;
  name: string;
  avatar_url: string;
  bio?: string | null;
  company?: string | null;
  created_at: string;
  email?: string | null;
  github_id: string;
  is_active: boolean;
  last_login_at: string;
  location?: string;
  role: string;
  updated_at: string;
  website_url?: string;
}

export interface ImageUploadResponse {
  fileUrl: string;
  fileHash: string;
  processedFileName: string;
  originalMimeType: string;
  processedMimeType: string;
  imageKitFileId: string;
}

export interface SearchUsersResponse {
  users: User[];
  total: number;
  timestamp: number;
}

export interface UpdateUserDto {
  name: string;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  website_url: string | null;
  company: string | null;
}
