export interface Podcast {
  jobId: string;
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

// 异步的podCast
export interface AsyncPodcast {
  jobId: string;
  message: string;
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
