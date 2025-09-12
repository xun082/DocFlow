import { useState } from 'react';

import { AiApi } from '@/services/ai';

interface TextToImageRequest {
  prompt: string;
  size?: string;
}

interface TextToImageResponse {
  imageUrl?: string;
  error?: string;
}

interface UseTextToImageProps {
  onSuccess?: (imageUrl: string) => void;
  onError?: (error: string) => void;
}

export const useTextToImage = ({ onSuccess, onError }: UseTextToImageProps = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateImage = async (request: TextToImageRequest): Promise<TextToImageResponse> => {
    setIsLoading(true);
    setError(null);
    setImageUrl(null);

    try {
      const result = await AiApi.TextToImage({
        prompt: request.prompt,
        size: request.size || '1024x1024',
      });

      if (result.error) {
        throw new Error(result.error);
      }

      if (result.data?.code === 200 && result.data?.data) {
        const responseData = result.data.data as { imageUrl: string };
        const imageUrl = responseData.imageUrl;
        setImageUrl(imageUrl);
        onSuccess?.(imageUrl);

        return { imageUrl };
      } else {
        throw new Error(result.data?.message || '未收到图片URL');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '生成图片时发生未知错误';
      setError(errorMessage);
      onError?.(errorMessage);

      return { error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setImageUrl(null);
    setError(null);
    setIsLoading(false);
  };

  return {
    generateImage,
    isLoading,
    imageUrl,
    error,
    reset,
  };
};
