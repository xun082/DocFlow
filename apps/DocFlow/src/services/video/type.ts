export interface DownloadVideoForNetWorkParams {
  url: string;
}

export interface DownloadVideoForNetWorkResponse {
  videoPath: string;
  mp3Path: string;
}

export interface AudioToTextParams {
  audioPath: string;
}

export interface AudioToTextResponse {
  transcriptionText: string;
}

export interface TextToMindMapParams {
  transcriptionText: string;
}

interface MindMapNode {
  id: number;
  label: string;
  children?: MindMapNode[];
}

export interface TextToMindMapResponse {
  mind_map: MindMapNode;
}
