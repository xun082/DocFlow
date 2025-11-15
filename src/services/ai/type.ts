export interface CorrectTextParams {
  text: string;
  diagramType?: string;
}

export interface CorrectTextResponse {
  mermaidCode?: string;
  originalText: string;
  correctedText: string;
  correction: [string, string][];
  hasErrors: boolean;
  errorMessage?: string;
}

export interface ContinueWritingParams {
  documentId: string;
  content: string;
  apiKey?: string; // 修改为可选参数
  model: string;
}

export interface ContinueWritingResponse {
  id: string;
  object: 'chat.completion.chunk';
  created: number;
  model: string;
  choices: Array<{
    index: number;
    delta: {
      content: string;
      reasoning_content: null | string;
      role?: 'assistant' | 'user' | 'system';
    };
    finish_reason: null | 'stop' | 'length' | 'content_filter';
  }>;
  system_fingerprint?: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface GenerateDiagramParams {
  apiKey?: string;
  model?: string;
  prompt: string;
  size: string;
}

export interface QuestionParams {
  question: string;
  apiKey?: string;
  model: string;
  useKnowledgeBase?: boolean; // 是否基于用户的私有知识库进行回答，默认 true
  knowledgeIds?: number[]; // 指定要检索的知识库ID列表，不指定或为空数组则检索所有知识库
}

export interface CreateKnowledgeParams {
  title: string;
  description?: string;
  apiKey?: string;
}

export interface AddKnowledgeFileParams {
  apiKey?: string;
}

export interface AddKnowledgeUrlParams {
  url: string;
  apiKey?: string;
}

export interface GetKnowledgeListParams {
  page?: number;
  limit?: number;
}

export interface KnowledgeOption {
  id: number;
  title: string;
}

export interface KnowledgeOptionListResponse {
  data: KnowledgeOption[];
}

// 知识库文件对象
export interface ApiKnowledgeFile {
  id: number;
  original_filename: string;
  file_extension: string;
  file_size: number;
  file_url: string;
  created_at: string;
}

// 知识库URL对象
export interface ApiKnowledgeUrl {
  id: number;
  url: string;
  created_at: string;
}

export interface KnowledgeDetail {
  id: number;
  title: string;
  description?: string;
  files?: ApiKnowledgeFile[];
  urls?: ApiKnowledgeUrl[];
  created_at: string;
  updated_at: string;
}

export interface TextToImageParams {
  prompt: string;
  apiKey?: string;
  model?: string;
  size?: string;
}

export interface TextToImageResponse {
  imageUrl: string;
}

export interface GeneratePodcastParams {
  file: File;
  interviewer: string;
  candidate_id?: string;
  interviewer_voice_id?: string;
  minimax_key?: string;
  apiKey?: string;
}

export interface GeneratePodcastResponse {
  audioUrl: string;
  jobId?: string;
}

export interface AgentQueryParams {
  question: string;
  location?: string;
  apiKey?: string;
}

export interface QuestionResponse {
  id: string;
  object: 'chat.completion.chunk';
  created: number;
  model: string;
  choices: Array<{
    index: number;
    delta: {
      content: string;
      reasoning_content: null | string;
      role?: 'assistant' | 'user' | 'system';
    };
    finish_reason: null | 'stop' | 'length' | 'content_filter';
  }>;
  system_fingerprint?: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}
