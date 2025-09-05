import { getCookie } from '@/utils/cookie';
import { HTTP_METHODS, HTTP_CREDENTIALS, HTTP_STATUS_MESSAGES } from '@/utils/http';

type Method = (typeof HTTP_METHODS)[keyof typeof HTTP_METHODS];

interface Params {
  cacheTime?: number; // 缓存时间，单位为秒。默认强缓存，0为不缓存
  params?: Record<string, any>;
  timeout?: number; // 超时时间，单位为毫秒
  retries?: number; // 重试次数
  retryDelay?: number; // 重试延迟，单位为毫秒
  headers?: Record<string, string>; // 自定义请求头
  withCredentials?: boolean; // 跨域请求是否携带 cookie
  signal?: AbortSignal; // 用于取消请求的信号
  errorHandler?: ErrorHandler; // 错误处理函数
}

interface Props extends Params {
  url: string;
  method: Method;
  mode?: RequestMode;
  token?: string;
}

type Config = { next: { revalidate: number } } | { cache: 'no-store' } | { cache: 'force-cache' };

// 请求错误类型
export class RequestError extends Error {
  url: string;
  status?: number;
  statusText?: string;
  data?: any;

  constructor(message: string, url: string, status?: number, statusText?: string, data?: any) {
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

// 统一返回结果类型 - 我们自己处理后的格式
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

class Request {
  baseURL: string;
  defaultTimeout: number;
  defaultRetries: number;
  defaultRetryDelay: number;

  constructor(
    baseURL: string,
    options?: {
      timeout?: number;
      retries?: number;
      retryDelay?: number;
    },
  ) {
    this.baseURL = baseURL;
    this.defaultTimeout = options?.timeout || 10000; // 默认超时 10 秒
    this.defaultRetries = options?.retries || 0; // 默认不重试
    this.defaultRetryDelay = options?.retryDelay || 1000; // 默认重试延迟 1 秒
  }

  /**
   * 创建超时 Promise
   */
  createTimeoutPromise(timeout: number): Promise<never> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        reject(new RequestError('请求超时', '', undefined, 'Timeout'));
      }, timeout);
    });
  }

  /**
   * 请求拦截器
   */
  interceptorsRequest({
    url,
    method,
    params,
    cacheTime,
    mode,
    token,
    headers: customHeaders,
    withCredentials,
  }: Props) {
    let queryParams = ''; // url参数
    let requestPayload: any = undefined; // 请求体数据

    // 请求头
    const headers: Record<string, string> = {
      ...customHeaders,
    };

    // 如果没有提供token，则尝试从cookie中获取（仅在客户端环境）
    const authToken = token || (typeof window !== 'undefined' ? getCookie('auth_token') : null);

    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const config: Config =
      cacheTime !== undefined
        ? cacheTime > 0
          ? { next: { revalidate: cacheTime } }
          : { cache: 'no-store' }
        : { cache: 'force-cache' };

    if (method === HTTP_METHODS.GET || method === HTTP_METHODS.DELETE) {
      // fetch 对 GET 请求等，不支持将参数传在 body 上，只能拼接 url
      if (params) {
        queryParams = new URLSearchParams(
          Object.entries(params)
            .filter(([, v]) => v !== undefined)
            .map(([k, v]) => [k, String(v)]),
        ).toString();
        url = queryParams ? `${url}?${queryParams}` : url;
      }
    } else {
      // 处理不同类型的请求体
      if (params) {
        if (params instanceof FormData || params instanceof URLSearchParams) {
          requestPayload = params;
        } else {
          headers['Content-Type'] = headers['Content-Type'] || 'application/json';
          requestPayload = JSON.stringify(params);
        }
      }
    }

    return {
      url,
      options: {
        method,
        headers,
        mode,
        credentials: withCredentials ? HTTP_CREDENTIALS.INCLUDE : HTTP_CREDENTIALS.SAME_ORIGIN,
        body: requestPayload,
        ...config,
      },
    };
  }

  /**
   * 响应拦截器
   */
  async interceptorsResponse<T>(res: Response, url: string): Promise<T> {
    console.log('响应拦截器', res);

    const status = res.status;
    const statusText = res.statusText;

    // 首先检查 HTTP 状态码，无论响应类型如何
    if (!res.ok) {
      // 尝试获取错误信息
      let errorMessage = HTTP_STATUS_MESSAGES[status] || `HTTP 错误: ${status} ${statusText}`;
      let errorData = null;

      try {
        const contentType = res.headers.get('content-type');

        if (contentType && contentType.includes('application/json')) {
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
        // 如果无法解析错误信息，使用默认消息
      }

      throw new RequestError(errorMessage, url, status, statusText, errorData);
    }

    // 处理成功响应的不同类型
    const contentType = res.headers.get('content-type');

    if (contentType && !contentType.includes('application/json')) {
      // 对于成功的非 JSON 响应，直接返回原始响应
      return res as unknown as T;
    }

    try {
      const data = await res.json();

      // 处理正常 HTTP 状态但含业务错误的情况
      if (res.ok) {
        // 检查业务状态码
        if (
          data &&
          data.code !== undefined &&
          data.code !== 0 &&
          (data.code < 200 || data.code >= 300)
        ) {
          throw new RequestError(
            data.message || data.reason || '请求失败',
            url,
            status,
            statusText,
            data,
          );
        }

        return data as T;
      } else {
        // 处理其他 HTTP 错误
        throw new RequestError(
          data.message || HTTP_STATUS_MESSAGES[status] || '接口错误',
          url,
          status,
          statusText,
          data,
        );
      }
    } catch (error) {
      if (error instanceof RequestError) {
        throw error;
      }

      throw new RequestError('解析响应数据失败', url, status, statusText);
    }
  }

  /**
   * 执行请求重试
   */
  async executeWithRetry<T>(
    requestFn: () => Promise<T>,
    retries: number,
    retryDelay: number,
  ): Promise<T> {
    try {
      return await requestFn();
    } catch (error) {
      if (retries > 0 && !(error instanceof RequestError && error.status === 401)) {
        // 不重试 401 错误
        await new Promise((resolve) => setTimeout(resolve, retryDelay));

        return this.executeWithRetry(requestFn, retries - 1, retryDelay);
      }

      throw error;
    }
  }

  /**
   * 统一错误处理函数
   */
  handleRequestError(
    error: unknown,
    fallbackMessage = '请求失败，请稍后重试',
    handlers?: {
      [key: number]: (error: RequestError) => void;
      default?: (error: unknown) => void;
      unauthorized?: () => void;
      forbidden?: () => void;
      serverError?: () => void;
      networkError?: () => void;
    },
  ): string {
    // 处理 RequestError
    if (error instanceof RequestError) {
      // 执行特定状态码的处理函数
      if (handlers && error.status) {
        // 特定状态码的处理
        if (handlers[error.status]) {
          handlers[error.status](error);
        } else if (error.status === 401 && handlers.unauthorized) {
          handlers.unauthorized();
        } else if (error.status === 403 && handlers.forbidden) {
          handlers.forbidden();
        } else if (error.status >= 500 && handlers.serverError) {
          handlers.serverError();
        } else if (handlers.default) {
          handlers.default(error);
        }
      } else if (handlers?.default) {
        handlers.default(error);
      }

      // 返回格式化的错误消息
      return error.message || fallbackMessage;
    }

    // 处理网络错误
    if (
      error instanceof TypeError &&
      (error.message.includes('Failed to fetch') ||
        error.message.includes('Network request failed'))
    ) {
      if (handlers?.networkError) {
        handlers.networkError();
      }

      return '网络连接错误，请检查您的网络';
    }

    // 处理取消请求
    if (error instanceof DOMException && error.name === 'AbortError') {
      return '请求已取消';
    }

    // 处理其他类型错误
    if (handlers?.default) {
      handlers.default(error);
    }

    // 返回通用错误消息
    return error instanceof Error ? error.message : fallbackMessage;
  }

  /**
   * 内部请求包装函数，处理异常并返回统一结果格式
   */
  async handleRequest<T>(
    requestFn: () => Promise<ApiResponse<T>>,
    errorHandler?: ErrorHandler,
  ): Promise<RequestResult<T>> {
    try {
      const data = await requestFn();

      return { data, error: null };
    } catch (error) {
      const handlers =
        typeof errorHandler === 'function' ? { default: errorHandler } : errorHandler;

      const errorMessage = this.handleRequestError(error, undefined, {
        ...(handlers as any),
        default: handlers?.default || handlers?.onError,
      });

      if (typeof errorHandler === 'function') {
        errorHandler(error);
      } else if (errorHandler?.onError) {
        errorHandler.onError(error);
      }
      // 移除默认的 console.error，让调用方决定如何处理错误

      // 提供错误状态码，方便调用者进行更细粒度的处理
      const status = error instanceof RequestError ? error.status : undefined;

      return { data: null, error: errorMessage, status };
    }
  }

  async httpFactory<T>({
    url = '',
    params = {},
    method,
    mode,
    token,
    timeout = this.defaultTimeout,
    retries = this.defaultRetries,
    retryDelay = this.defaultRetryDelay,
    signal,
    ...rest
  }: Props): Promise<T> {
    const fullUrl = this.baseURL + url;

    const req = this.interceptorsRequest({
      url: fullUrl,
      method,
      params: params.params,
      cacheTime: params.cacheTime,
      mode,
      token,
      headers: rest.headers,
      withCredentials: rest.withCredentials,
    });

    const requestFn = async () => {
      try {
        const fetchPromise = fetch(req.url, { ...req.options, signal });

        let res: Response;

        if (timeout) {
          const timeoutPromise = this.createTimeoutPromise(timeout);
          res = await Promise.race([fetchPromise, timeoutPromise]);
        } else {
          res = await fetchPromise;
        }

        return this.interceptorsResponse<T>(res, fullUrl);
      } catch (error) {
        // 确保所有错误都被正确抛出，不在这里输出到控制台
        throw error;
      }
    };

    return this.executeWithRetry(requestFn, retries, retryDelay);
  }

  /**
   * 基础请求方法 - 内部使用，不再直接暴露给外部
   */
  private async internalRequest<T>(
    method: Method,
    url: string,
    params?: Params,
    mode?: RequestMode,
    token?: string,
  ): Promise<ApiResponse<T>> {
    return this.httpFactory<ApiResponse<T>>({
      url,
      params,
      method,
      mode,
      token,
      timeout: params?.timeout,
      retries: params?.retries,
      retryDelay: params?.retryDelay,
      signal: params?.signal,
      headers: params?.headers,
      withCredentials: params?.withCredentials,
    });
  }

  /**
   * 以下方法是带错误处理的公共方法，直接返回统一的结果格式
   */
  get<T>(
    url: string,
    params?: Params,
    mode?: RequestMode,
    token?: string,
  ): Promise<RequestResult<T>> {
    return this.handleRequest<T>(
      () => this.internalRequest<T>('GET', url, params, mode, token),
      params?.errorHandler,
    );
  }

  post<T>(
    url: string,
    params?: Params,
    mode?: RequestMode,
    token?: string,
  ): Promise<RequestResult<T>> {
    return this.handleRequest<T>(
      () => this.internalRequest<T>('POST', url, params, mode, token),
      params?.errorHandler,
    );
  }

  put<T>(
    url: string,
    params?: Params,
    mode?: RequestMode,
    token?: string,
  ): Promise<RequestResult<T>> {
    return this.handleRequest<T>(
      () => this.internalRequest<T>('PUT', url, params, mode, token),
      params?.errorHandler,
    );
  }

  delete<T>(
    url: string,
    params?: Params,
    mode?: RequestMode,
    token?: string,
  ): Promise<RequestResult<T>> {
    return this.handleRequest<T>(
      () => this.internalRequest<T>('DELETE', url, params, mode, token),
      params?.errorHandler,
    );
  }

  patch<T>(
    url: string,
    params?: Params,
    mode?: RequestMode,
    token?: string,
  ): Promise<RequestResult<T>> {
    return this.handleRequest<T>(
      () => this.internalRequest<T>('PATCH', url, params, mode, token),
      params?.errorHandler,
    );
  }

  async sse(
    url: string,
    params: Params,
    callback: (response: Response) => void,
  ): Promise<(() => void) | undefined> {
    const controller = new AbortController();
    const fullUrl = this.baseURL + url;

    try {
      const req = this.interceptorsRequest({
        url: fullUrl,
        method: 'POST',
        params: params.params,
        headers: params.headers,
        withCredentials: params.withCredentials,
        errorHandler: params?.errorHandler,
      });

      const response = await fetch(req.url, {
        ...req.options,
        signal: controller.signal,
      });

      // 使用响应拦截器进行统一的错误处理和状态检查
      // 注意：对于SSE，我们不需要解析响应体，只需要检查状态
      if (!response.ok) {
        console.log('SSE响应拦截器 - 错误状态:', response.status, response.statusText);

        // 尝试获取错误信息
        let errorMessage = HTTP_STATUS_MESSAGES[response.status] || 'SSE连接失败';
        let errorData = null;

        try {
          const contentType = response.headers.get('content-type');

          if (contentType && contentType.includes('application/json')) {
            // 克隆响应以避免消费原始流
            const clonedResponse = response.clone();
            errorData = await clonedResponse.json();

            if (errorData.message) {
              errorMessage = errorData.message;
            }
          }
        } catch {
          // 如果无法解析错误信息，使用默认消息
        }

        throw new RequestError(
          errorMessage,
          fullUrl,
          response.status,
          response.statusText,
          errorData,
        );
      }

      callback(response);

      return () => controller.abort();
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        console.log('流读取被中止:', error);
        // 中止是预期行为，不需要额外处理
      } else {
        // 其他错误需要重新抛出
        if (typeof params?.errorHandler === 'function') {
          params.errorHandler(error);
        } else if (params?.errorHandler?.onError) {
          params.errorHandler.onError(error);
        }

        console.error('流读取过程中出错:', error);
        throw error;
      }

      // 重新抛出错误，让调用方能够捕获和处理
      throw error;
    }
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

// 创建默认请求实例
const request = new Request(process.env.NEXT_PUBLIC_SERVER_URL || '', {
  timeout: 15000, // 默认 15 秒超时
  retries: 1, // 默认重试 1 次
  retryDelay: 1000, // 默认重试延迟 1 秒
});

export default request;
