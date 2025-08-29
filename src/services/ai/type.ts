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
  content: string;
  hasErrors: boolean;
  errorMessage?: string;
}
