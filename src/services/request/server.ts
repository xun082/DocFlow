/**
 * 服务端请求模块
 * 简洁版本，不包含：token 认证、SSE、Sentry、重试机制
 * 适用于 Next.js 服务端组件和 API 路由
 */

import type {
  Method,
  CacheConfig,
  ServerParams,
  ApiResponse,
  RequestResult,
  RequestParams,
} from './types';
import { RequestError } from './types';

import { HTTP_METHODS, HTTP_STATUS_MESSAGES } from '@/utils/constants/http';

interface ServerRequestProps {
  url: string;
  method: Method;
  params?: RequestParams;
  cacheTime?: number;
  headers?: Record<string, string>;
  timeout?: number;
  signal?: AbortSignal;
}

class ServerRequest {
  private baseURL: string;
  private defaultTimeout: number;

  constructor(baseURL: string, options?: { timeout?: number }) {
    this.baseURL = baseURL;
    this.defaultTimeout = options?.timeout || 10000;
  }

  /**
   * 创建超时 Promise
   */
  private createTimeoutPromise(timeout: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new RequestError('请求超时', '', undefined, 'Timeout'));
      }, timeout);
    });
  }

  /**
   * 构建请求配置
   */
  private buildRequest({ url, method, params, cacheTime, headers }: ServerRequestProps) {
    let queryParams = '';
    let requestPayload: string | FormData | URLSearchParams | undefined;

    const requestHeaders: Record<string, string> = { ...headers };

    // 缓存配置
    const config: CacheConfig =
      cacheTime !== undefined
        ? cacheTime > 0
          ? { next: { revalidate: cacheTime } }
          : { cache: 'no-store' }
        : { cache: 'no-store' };

    if (method === HTTP_METHODS.GET || method === HTTP_METHODS.DELETE) {
      if (params && !(params instanceof FormData) && !(params instanceof URLSearchParams)) {
        queryParams = new URLSearchParams(
          Object.entries(params)
            .filter(([, v]) => v !== undefined)
            .map(([k, v]) => [k, String(v)]),
        ).toString();
        url = queryParams ? `${url}?${queryParams}` : url;
      }
    } else {
      if (params) {
        if (params instanceof FormData || params instanceof URLSearchParams) {
          requestPayload = params;
        } else {
          requestHeaders['Content-Type'] = requestHeaders['Content-Type'] || 'application/json';
          requestPayload = JSON.stringify(params);
        }
      }
    }

    return {
      url,
      options: {
        method,
        headers: requestHeaders,
        body: requestPayload,
        ...config,
      },
    };
  }

  /**
   * 处理响应
   */
  private async handleResponse<T>(res: Response, url: string): Promise<T> {
    const status = res.status;
    const statusText = res.statusText;

    if (!res.ok) {
      let errorMessage = HTTP_STATUS_MESSAGES[status] || `HTTP 错误: ${status} ${statusText}`;
      let errorData = null;

      try {
        const contentType = res.headers.get('content-type');

        if (contentType?.includes('application/json')) {
          errorData = await res.json();

          if (errorData.message) {
            errorMessage = errorData.message;
          }
        } else {
          const textData = await res.text();

          if (textData) {
            errorMessage = textData;
          }
        }
      } catch {
        // 使用默认错误消息
      }

      throw new RequestError(errorMessage, url, status, statusText, errorData);
    }

    const contentType = res.headers.get('content-type');

    if (contentType && !contentType.includes('application/json')) {
      return res as unknown as T;
    }

    try {
      const data = await res.json();

      // 检查业务状态码
      if (data?.code !== undefined && data.code !== 0 && (data.code < 200 || data.code >= 300)) {
        throw new RequestError(
          data.message || data.reason || '请求失败',
          url,
          status,
          statusText,
          data,
        );
      }

      return data as T;
    } catch (error) {
      if (error instanceof RequestError) {
        throw error;
      }

      throw new RequestError('解析响应数据失败', url, status, statusText);
    }
  }

  /**
   * 执行请求
   */
  private async execute<T>({
    url,
    method,
    params,
    cacheTime,
    headers,
    timeout = this.defaultTimeout,
    signal,
  }: ServerRequestProps): Promise<ApiResponse<T>> {
    const fullUrl = this.baseURL + url;
    const req = this.buildRequest({
      url: fullUrl,
      method,
      params,
      cacheTime,
      headers,
    });

    const fetchPromise = fetch(req.url, { ...req.options, signal });

    let res: Response;

    if (timeout) {
      res = await Promise.race([fetchPromise, this.createTimeoutPromise(timeout)]);
    } else {
      res = await fetchPromise;
    }

    return this.handleResponse<ApiResponse<T>>(res, fullUrl);
  }

  /**
   * 包装请求，返回统一结果格式
   */
  private async handleRequest<T>(
    requestFn: () => Promise<ApiResponse<T>>,
  ): Promise<RequestResult<T>> {
    try {
      const data = await requestFn();

      return { data, error: null };
    } catch (error) {
      const errorMessage = this.formatError(error);
      const status = error instanceof RequestError ? error.status : undefined;

      return { data: null, error: errorMessage, status };
    }
  }

  /**
   * 格式化错误信息
   */
  private formatError(error: unknown, fallbackMessage = '请求失败，请稍后重试'): string {
    if (error instanceof RequestError) {
      return error.message || fallbackMessage;
    }

    if (
      error instanceof TypeError &&
      (error.message.includes('Failed to fetch') ||
        error.message.includes('Network request failed'))
    ) {
      return '网络连接错误，请检查您的网络';
    }

    if (error instanceof DOMException && error.name === 'AbortError') {
      return '请求已取消';
    }

    return error instanceof Error ? error.message : fallbackMessage;
  }

  /**
   * GET 请求
   */
  get<T>(url: string, params?: ServerParams): Promise<RequestResult<T>> {
    return this.handleRequest<T>(() =>
      this.execute<T>({
        url,
        method: HTTP_METHODS.GET,
        params: params?.params,
        cacheTime: params?.cacheTime,
        headers: params?.headers,
        timeout: params?.timeout,
        signal: params?.signal,
      }),
    );
  }

  /**
   * POST 请求
   */
  post<T>(url: string, params?: ServerParams): Promise<RequestResult<T>> {
    return this.handleRequest<T>(() =>
      this.execute<T>({
        url,
        method: HTTP_METHODS.POST,
        params: params?.params,
        cacheTime: params?.cacheTime,
        headers: params?.headers,
        timeout: params?.timeout,
        signal: params?.signal,
      }),
    );
  }

  /**
   * PUT 请求
   */
  put<T>(url: string, params?: ServerParams): Promise<RequestResult<T>> {
    return this.handleRequest<T>(() =>
      this.execute<T>({
        url,
        method: HTTP_METHODS.PUT,
        params: params?.params,
        cacheTime: params?.cacheTime,
        headers: params?.headers,
        timeout: params?.timeout,
        signal: params?.signal,
      }),
    );
  }

  /**
   * DELETE 请求
   */
  delete<T>(url: string, params?: ServerParams): Promise<RequestResult<T>> {
    return this.handleRequest<T>(() =>
      this.execute<T>({
        url,
        method: HTTP_METHODS.DELETE,
        params: params?.params,
        cacheTime: params?.cacheTime,
        headers: params?.headers,
        timeout: params?.timeout,
        signal: params?.signal,
      }),
    );
  }

  /**
   * PATCH 请求
   */
  patch<T>(url: string, params?: ServerParams): Promise<RequestResult<T>> {
    return this.handleRequest<T>(() =>
      this.execute<T>({
        url,
        method: HTTP_METHODS.PATCH,
        params: params?.params,
        cacheTime: params?.cacheTime,
        headers: params?.headers,
        timeout: params?.timeout,
        signal: params?.signal,
      }),
    );
  }

  /**
   * 创建取消令牌
   */
  createCancelToken(): { signal: AbortSignal; cancel: (reason?: string) => void } {
    const controller = new AbortController();

    return {
      signal: controller.signal,
      cancel: (reason?: string) => controller.abort(reason),
    };
  }
}

// 创建服务端请求实例
const serverRequest = new ServerRequest(process.env.NEXT_PUBLIC_SERVER_URL || '', {
  timeout: 15000,
});

export { ServerRequest, serverRequest };
export default serverRequest;
