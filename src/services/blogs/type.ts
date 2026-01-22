export interface BlogPost {
  id: number;
  title: string;
  summary: string;
  content: string;
  category: string;
  created_at: string;
  updated_at: string;
  user_id: number;
  user_name: string;
  tags: string;
  cover_image?: string;
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
  cover_image?: string;
}
