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

// 语音 ID 类型（根据 API 文档）
export type VoiceId =
  | 'fnlp/MOSS-TTSD-v0.5:alex'
  | 'fnlp/MOSS-TTSD-v0.5:anna'
  | 'fnlp/MOSS-TTSD-v0.5:bella'
  | 'fnlp/MOSS-TTSD-v0.5:benjamin'
  | 'fnlp/MOSS-TTSD-v0.5:charles'
  | 'fnlp/MOSS-TTSD-v0.5:claire'
  | 'fnlp/MOSS-TTSD-v0.5:david'
  | 'fnlp/MOSS-TTSD-v0.5:diana';

// 生成播客的请求参数
export interface GeneratePodcastParams {
  file: File; // 必需
  interviewer: InterviewerType; // 必需
  interviewer_voice?: VoiceId; // 可选，面试官音色
  candidate_voice?: VoiceId; // 可选，候选人音色
  speech_speed?: number; // 可选，语音播放速度 (0.5-2.0，默认 1.0)
  sample_rate?: number; // 可选，音频采样率 (Hz，默认 32000)
  temperature?: number; // 可选，AI 生成温度 (0-1，默认 0.8)
}

// 批量删除播客的请求参数
export interface DeletePodcastsParams {
  ids: number[]; // 要删除的播客 ID 数组
}
