import request from '../request';
import type { ImageMeta } from './type';

export const ImageApi = {
  GetImageMetadata: (fileHash: string) => request.get<ImageMeta>(`/api/v1/image/${fileHash}`),
};
