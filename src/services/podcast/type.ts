export interface Podcast {
  id: string;
  title: string;
  duration: number;
  file_size: number;
  audio_url: string;
  content: string;
  user: {
    id: string;
    name: string;
    avatar_url: string;
  };
  created_at: string;
  updated_at: string;
}

export interface ListParams {
  page?: number;
  limit?: number;
}

export interface ListResponse<T> {
  podcasts: T[];
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  limit: number;
  page: number;
}
