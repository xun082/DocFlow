export interface BlogPost {
  id: number;
  title: string;
  content: string;
  category: string;
  created_at: string;
  updated_at: string;
  userId: number;
  userName: string;
  tags: string;
}

export interface GetAllBlogsParams {
  category?: string;
  title?: string;
}

export interface CreateBlogParams {
  title: string;
  content: string;
  category?: string;
  tags?: string;
  user_id: number;
  user_name: string;
  cover_image?: string;
}
