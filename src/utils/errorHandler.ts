// DocFlow/src/utils/errorHandler.ts
import { toast } from 'sonner';

export const errorHandler = {
  onError: () => {
    toast.error('请求失败，请稍后重试');
  },
  unauthorized: () => {
    toast.error('未登录或登录已过期，请重新登录');
  },
  forbidden: () => {
    toast.error('没有权限');
  },
  serverError: () => {
    toast.error('服务器错误，请稍后再试');
  },
  networkError: () => {
    toast.error('网络连接失败，请检查网络');
  },
  default: () => {
    toast.error('未知错误');
  },
};
