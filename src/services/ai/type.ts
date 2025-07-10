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
