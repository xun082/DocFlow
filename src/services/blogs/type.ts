export interface BlogPost {
  id: number;
  title: string;
  summary: string;
  content: string;
  category: string;
  createdAt: string;
  updatedAt: string;
  userId: number;
  tags: string;
  coverImage?: string;
  user: {
    id: number;
    email: string;
    name: string;
    github_id: string | null;
    avatar_url?: string;
    bio: string | null;
    location: string | null;
    websiteUrl: string | null;
    company: string | null;
    role: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    lastLoginAt: string;
    preferences: any;
  };
}

export interface BlogListResponse {
  list: BlogPost[];
  total: number;
}

export interface GetAllBlogsParams {
  category?: string;
  title?: string;
}

export interface CreateBlogParams {
  title: string;
  summary: string;
  content: string;
  category?: string;
  tags?: string;
  coverImage?: string;
}
