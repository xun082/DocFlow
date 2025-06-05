export interface CorrectTextParams {
  text: string;
}

export interface CorrectTextResponse {
  originalText: string;
  correctedText: string;
  correction: [string, string][];
  hasErrors: boolean;
}
