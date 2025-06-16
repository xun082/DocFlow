import request from '@/services/request';

// 定义图片上传返回的 data 结构
interface UploadImageData {
  fileUrl: string;
  fileHash: string;
  processedFileName: string;
  originalMimeType: string;
  processedMimeType: string;
  imageKitFileId: string;
}

export class API {
  /**
   * 上传图片或GIF
   * @param file 要上传的图片文件
   * @param token 授权token（可选）
   * @returns 图片URL字符串
   */
  public static uploadImage = async (file: File, token?: string): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const headers: Record<string, string> = {};

    if (token) {
      headers['Authorization'] = token;
    }

    const { data, error } = await request.post<UploadImageData>('/api/v1/upload/avatar', {
      params: formData,
      headers,
    });
    //console.log(data);

    if (error || !data?.data?.fileUrl) {
      throw new Error(error || '图片上传失败');
    }

    return data.data.fileUrl;
  };
}

export default API;
