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

// 面试官角色枚举
export enum Interviewer {
  FrontEnd = 'front_end',
  Hrbp = 'hrbp',
  MarketingManager = 'marketing_manager',
}

// 面试官类型（向后兼容）
export type InterviewerType = 'front_end' | 'hrbp' | 'marketing_manager';

// 音色枚举
export enum Voice {
  FnlpMOSSTTSDV05Alex = 'fnlp/MOSS-TTSD-v0.5:alex',
  FnlpMOSSTTSDV05Anna = 'fnlp/MOSS-TTSD-v0.5:anna',
  FnlpMOSSTTSDV05Bella = 'fnlp/MOSS-TTSD-v0.5:bella',
  FnlpMOSSTTSDV05Benjamin = 'fnlp/MOSS-TTSD-v0.5:benjamin',
  FnlpMOSSTTSDV05Charles = 'fnlp/MOSS-TTSD-v0.5:charles',
  FnlpMOSSTTSDV05Claire = 'fnlp/MOSS-TTSD-v0.5:claire',
  FnlpMOSSTTSDV05David = 'fnlp/MOSS-TTSD-v0.5:david',
  FnlpMOSSTTSDV05Diana = 'fnlp/MOSS-TTSD-v0.5:diana',
}

// 语音 ID 类型（向后兼容）
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
  interviewer: InterviewerType | Interviewer; // 必需
  interviewer_voice?: VoiceId | Voice; // 可选，面试官音色
  candidate_voice?: VoiceId | Voice; // 可选，候选人音色
  temperature?: number; // 可选，AI 生成温度 (0-1，默认 0.8)
}

// 批量删除播客的请求参数
export interface DeletePodcastsParams {
  ids: number[]; // 要删除的播客 ID 数组
}
