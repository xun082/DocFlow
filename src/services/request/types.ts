import { HTTP_METHODS } from '@/utils/constants/http';

export type Method = (typeof HTTP_METHODS)[keyof typeof HTTP_METHODS];

// 缓存配置类型
export type CacheConfig =
  | { next: { revalidate: number } }
  | { cache: 'no-store' }
  | { cache: 'force-cache' };

// 请求错误类型
export class RequestError extends Error {
  url: string;
  status?: number;
  statusText?: string;
  data?: unknown;

  constructor(message: string, url: string, status?: number, statusText?: string, data?: unknown) {
    super(message);
    this.name = 'RequestError';
    this.url = url;
    this.status = status;
    this.statusText = statusText;
    this.data = data;
  }
}

// 响应数据接口 - 服务器返回的标准格式
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
  timestamp: number;
}

// 统一返回结果类型 - 处理后的格式
export interface RequestResult<T> {
  data: ApiResponse<T> | null;
  error: string | null;
  status?: number;
}

// 请求错误处理器类型
export type ErrorHandler =
  | ((error: unknown) => void)
  | {
      onError?: (error: unknown) => void;
      unauthorized?: () => void;
      forbidden?: () => void;
      serverError?: () => void;
      networkError?: () => void;
      default?: (error: unknown) => void;
    };

// 请求参数类型（支持任意对象、FormData、URLSearchParams）

export type RequestParams = Record<string, any> | FormData | URLSearchParams;

// 基础请求参数
export interface BaseParams {
  cacheTime?: number; // 缓存时间，单位为秒。默认强缓存，0为不缓存
  params?: RequestParams;
  timeout?: number; // 超时时间，单位为毫秒
  headers?: Record<string, string>; // 自定义请求头
  signal?: AbortSignal; // 用于取消请求的信号
}

// 服务端请求参数（简化版，与 BaseParams 相同）
export type ServerParams = BaseParams;

// 客户端请求参数（完整版）
export interface ClientParams extends BaseParams {
  retries?: number; // 重试次数
  retryDelay?: number; // 重试延迟，单位为毫秒
  withCredentials?: boolean; // 跨域请求是否携带 cookie
  errorHandler?: ErrorHandler; // 错误处理函数
}

// 内部请求配置
export interface RequestProps extends ClientParams {
  url: string;
  method: Method;
  mode?: RequestMode;
  token?: string;
}

// 请求队列项类型（仅客户端使用）
export interface QueuedRequest {
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
  requestFn: () => Promise<unknown>;
}

// 请求实例配置
export interface RequestOptions {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}
