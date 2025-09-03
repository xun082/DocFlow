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
  apiKey: string;
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
  apiKey: string;
  model: string;
  prompt: string;
  size: string;
}

export interface QuestionParams {
  // documentId: string;
  question: string;
  apiKey: string;
  model: string;
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
