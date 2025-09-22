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

// 面试官类型枚举
export type InterviewerType = 'front_end' | 'hrbp' | 'marketing_manager';

// 生成播客的请求参数
export interface GeneratePodcastParams {
  file: File;
  interviewer: InterviewerType;
  candidate_id: string;
  interviewer_voice_id: string;
  minimax_key: string; // 必传参数
}
