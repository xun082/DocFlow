import request, { ErrorHandler } from '../request';
import {
  AudioToTextParams,
  AudioToTextResponse,
  DownloadVideoForNetWorkParams,
  DownloadVideoForNetWorkResponse,
  TextToMindMapParams,
  TextToMindMapResponse,
} from './type';

export const VideoApi = {
  DownloadVideoForNetWork: (data: DownloadVideoForNetWorkParams, errorHandler?: ErrorHandler) =>
    request.post<DownloadVideoForNetWorkResponse>('/api/v1/video/download-convert', {
      errorHandler,
      params: {
        ...data,
      },
      timeout: 60000,
    }),

  AudioToText: (data: AudioToTextParams, errorHandler?: ErrorHandler) =>
    request.post<AudioToTextResponse>('/api/v1/video/transcribe', {
      errorHandler,
      params: {
        ...data,
      },
      timeout: 60000,
    }),

  TextToMindMap: (data: TextToMindMapParams, errorHandler?: ErrorHandler) =>
    request.post<TextToMindMapResponse>('/api/v1/video/generate-mindmap', {
      errorHandler,
      params: {
        ...data,
      },
      timeout: 60000,
    }),
};

export default VideoApi;
