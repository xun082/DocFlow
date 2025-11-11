import * as Sentry from '@sentry/nextjs';
import { createSseStream } from '@azure/core-sse';

import { getCookie, saveAuthData, clearAuthData } from '@/utils/cookie';
import { HTTP_METHODS, HTTP_CREDENTIALS, HTTP_STATUS_MESSAGES } from '@/utils/http';
import type { TokenRefreshResponse } from '@/types/auth';

type Method = (typeof HTTP_METHODS)[keyof typeof HTTP_METHODS];

// 在开发环境禁止 Sentry 上报和 breadcrumb 记录
const isProduction = process.env.NODE_ENV === 'production';

function addSentryBreadcrumb(breadcrumb: Parameters<typeof Sentry.addBreadcrumb>[0]) {
  if (!isProduction) return;
  Sentry.addBreadcrumb(breadcrumb);
}

function captureSentryException(
  error: unknown,
  options?: Parameters<typeof Sentry.captureException>[1],
) {
  if (!isProduction) return;
  Sentry.captureException(error, options as any);
}

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

// 请求队列项类型
interface QueuedRequest {
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
  requestFn: () => Promise<any>;
}

class Request {
  baseURL: string;
  defaultTimeout: number;
  defaultRetries: number;
  defaultRetryDelay: number;
  // 刷新尝试限制，避免潜在循环
  private maxRefreshAttempts = 2;
  private currentRefreshAttempts = 0;

  // Token 刷新相关
  private isRefreshing = false;
  private refreshTokenPromise: Promise<string> | null = null;
  private failedQueue: QueuedRequest[] = [];

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
   * 刷新访问令牌
   * 直接调用刷新 API，不经过常规的请求拦截器，避免循环依赖
   */
  private async refreshAccessToken(): Promise<string> {
    const refreshToken = getCookie('refresh_token');

    if (!refreshToken) {
      throw new RequestError('未找到刷新令牌，请重新登录', '', 401, 'Unauthorized');
    }

    try {
      const refreshUrl = this.baseURL + '/api/v1/auth/refresh';

      // 添加 Sentry breadcrumb
      addSentryBreadcrumb({
        category: 'auth',
        message: 'Refreshing access token',
        level: 'info',
      });

      // 直接使用 fetch，不经过拦截器，避免无限循环
      // 使用 refresh_token 作为请求参数（兼容后端）
      const csrfToken = typeof window !== 'undefined' ? getCookie('csrf_token') : undefined;
      const response = await fetch(refreshUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}),
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!response.ok) {
        // 刷新失败，清除所有认证信息
        clearAuthData();

        // 如果在浏览器环境，重定向到登录页
        if (typeof window !== 'undefined') {
          window.location.href = '/auth';
        }

        throw new RequestError(
          '刷新令牌失败，请重新登录',
          refreshUrl,
          response.status,
          response.statusText,
        );
      }

      const result = await response.json();

      // 检查业务状态码
      if (
        result.code !== undefined &&
        result.code !== 0 &&
        (result.code < 200 || result.code >= 300)
      ) {
        clearAuthData();

        if (typeof window !== 'undefined') {
          window.location.href = '/auth';
        }

        // 将业务失败规范化为未授权，确保后续流程不再尝试刷新并引导重新登录
        throw new RequestError(result.message, refreshUrl, 401, 'Unauthorized', result);
      }

      const tokenData: TokenRefreshResponse = result.data;

      // 保存新的 token 到 cookie（单位：秒）
      saveAuthData({
        token: tokenData.token,
        refresh_token: tokenData.refresh_token,
        expires_in: tokenData.expires_in,
        refresh_expires_in: tokenData.refresh_expires_in,
      });

      addSentryBreadcrumb({
        category: 'auth',
        message: 'Token refreshed successfully',
        level: 'info',
      });

      return tokenData.token;
    } catch (error) {
      // 刷新失败，清除所有认证信息
      clearAuthData();

      addSentryBreadcrumb({
        category: 'auth',
        message: 'Token refresh failed',
        level: 'error',
      });

      // 在浏览器环境，重定向到登录页
      if (typeof window !== 'undefined') {
        window.location.href = '/auth';
      }

      throw error;
    }
  }

  /**
   * 处理token刷新和请求队列
   */
  private async handleTokenRefresh(): Promise<string> {
    // 如果已经在刷新，返回现有的promise
    if (this.isRefreshing && this.refreshTokenPromise) {
      return this.refreshTokenPromise;
    }

    // 超过最大刷新次数时直接失败，避免循环
    if (this.currentRefreshAttempts >= this.maxRefreshAttempts) {
      throw new RequestError('刷新令牌次数过多，请重新登录', '', 401, 'Unauthorized');
    }

    // 标记正在刷新
    this.isRefreshing = true;
    this.currentRefreshAttempts += 1;

    // 创建刷新promise
    this.refreshTokenPromise = this.refreshAccessToken()
      .then((newToken) => {
        // 刷新成功，处理队列中的请求
        this.isRefreshing = false;
        this.refreshTokenPromise = null;
        this.currentRefreshAttempts = 0;

        // 重试队列中的所有请求
        this.processQueue(null);

        return newToken;
      })
      .catch((error) => {
        // 刷新失败，拒绝队列中的所有请求
        this.isRefreshing = false;
        this.refreshTokenPromise = null;

        this.processQueue(error);

        throw error;
      });

    return this.refreshTokenPromise;
  }

  /**
   * 处理请求队列
   * @param error 错误信息（如果刷新失败）
   */
  private processQueue(error: Error | null) {
    this.failedQueue.forEach((queuedRequest) => {
      if (error) {
        queuedRequest.reject(error);
      } else {
        // 使用新token重试请求
        queuedRequest.requestFn().then(queuedRequest.resolve).catch(queuedRequest.reject);
      }
    });

    // 清空队列
    this.failedQueue = [];
  }

  /**
   * 将请求添加到队列
   */
  private addRequestToQueue(requestFn: () => Promise<any>): Promise<any> {
    return new Promise((resolve, reject) => {
      this.failedQueue.push({
        resolve,
        reject,
        requestFn,
      });
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
   * 执行请求重试（带token刷新支持）
   */
  async executeWithRetry<T>(
    requestFn: () => Promise<T>,
    retries: number,
    retryDelay: number,
    isRetryAfterRefresh: boolean = false,
  ): Promise<T> {
    try {
      return await requestFn();
    } catch (error) {
      // 处理401错误 - token过期
      if (error instanceof RequestError && error.status === 401 && !isRetryAfterRefresh) {
        // 只在客户端环境尝试刷新token
        if (typeof window !== 'undefined') {
          // 如果没有 refresh_token，直接抛出，避免无意义刷新
          if (!getCookie('refresh_token')) {
            throw error;
          }

          try {
            // 如果正在刷新，将请求加入队列
            if (this.isRefreshing) {
              return this.addRequestToQueue(requestFn);
            }

            // 刷新token
            await this.handleTokenRefresh();

            // 使用新token重试请求（标记为刷新后的重试，避免无限循环）
            return this.executeWithRetry(requestFn, 0, 0, true);
          } catch {
            // 刷新失败，清除认证数据并重定向到登录页（仅在浏览器环境）
            if (typeof window !== 'undefined') {
              clearAuthData();
              window.location.href = '/auth';
            }

            // 抛出原始401错误
            throw error;
          }
        } else {
          // 服务端环境，直接抛出错误
          throw error;
        }
      }

      // 其他错误的重试逻辑
      if (retries > 0 && !(error instanceof RequestError && error.status === 401)) {
        await new Promise((resolve) => setTimeout(resolve, retryDelay));

        return this.executeWithRetry(requestFn, retries - 1, retryDelay, isRetryAfterRefresh);
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
      // 上报到 Sentry（排除一些不需要上报的状态码）
      const shouldReportToSentry = error.status !== 401 && error.status !== 404;

      if (shouldReportToSentry) {
        captureSentryException(error, {
          tags: {
            errorType: 'RequestError',
            statusCode: error.status,
            url: error.url,
          },
          contexts: {
            request: {
              url: error.url,
              status: error.status,
              statusText: error.statusText,
            },
            response: {
              data: error.data,
            },
          },
          level: error.status && error.status >= 500 ? 'error' : 'warning',
        });
      }

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
      // 上报网络错误到 Sentry
      captureSentryException(error, {
        tags: {
          errorType: 'NetworkError',
        },
        level: 'error',
      });

      if (handlers?.networkError) {
        handlers.networkError();
      }

      return '网络连接错误，请检查您的网络';
    }

    // 处理取消请求（不上报到 Sentry，这是正常行为）
    if (error instanceof DOMException && error.name === 'AbortError') {
      return '请求已取消';
    }

    // 处理其他类型错误
    captureSentryException(error, {
      tags: {
        errorType: 'UnknownError',
      },
      level: 'error',
    });

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

    // 添加 Sentry breadcrumb 记录请求信息
    addSentryBreadcrumb({
      category: 'http',
      message: `${method} ${fullUrl}`,
      level: 'info',
      data: {
        url: fullUrl,
        method,
        params: params.params,
        timeout,
        retries,
      },
    });

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

    // 创建可重试的请求函数
    const makeRequest = async (): Promise<T> => {
      const fetchPromise = fetch(req.url, { ...req.options, signal });

      let res: Response;

      if (timeout) {
        const timeoutPromise = this.createTimeoutPromise(timeout);
        res = await Promise.race([fetchPromise, timeoutPromise]);
      } else {
        res = await fetchPromise;
      }

      // 添加成功响应的 breadcrumb
      addSentryBreadcrumb({
        category: 'http',
        message: `${method} ${fullUrl} - ${res.status}`,
        level: 'info',
        data: {
          url: fullUrl,
          method,
          status: res.status,
          statusText: res.statusText,
        },
      });

      return this.interceptorsResponse<T>(res, fullUrl);
    };

    const requestFn = async () => {
      try {
        return await makeRequest();
      } catch (error) {
        // 添加失败响应的 breadcrumb
        addSentryBreadcrumb({
          category: 'http',
          message: `${method} ${fullUrl} - Failed`,
          level: 'error',
          data: {
            url: fullUrl,
            method,
            error: error instanceof Error ? error.message : 'Unknown error',
          },
        });

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
    let activeController = controller; // 支持重连时替换 controller
    const fullUrl = this.baseURL + url;

    // 添加 SSE 请求的 breadcrumb
    addSentryBreadcrumb({
      category: 'sse',
      message: `SSE Connection: ${fullUrl}`,
      level: 'info',
      data: {
        url: fullUrl,
        method: 'POST',
      },
    });

    try {
      const req = this.interceptorsRequest({
        url: fullUrl,
        method: 'POST',
        params: params.params,
        headers: params.headers,
        withCredentials: params.withCredentials,
        errorHandler: params?.errorHandler,
      });

      let response = await fetch(req.url, {
        ...req.options,
        signal: activeController.signal,
      });

      // 使用响应拦截器进行统一的错误处理和状态检查
      // 注意：对于SSE，我们不需要解析响应体，只需要检查状态
      if (!response.ok) {
        // 如果因为 401 失败，尝试刷新 token 后重连（仅在浏览器环境）
        if (
          response.status === 401 &&
          typeof window !== 'undefined' &&
          getCookie('refresh_token')
        ) {
          try {
            if (this.isRefreshing) {
              // 等待刷新结束即可，避免重复刷新
              await this.refreshTokenPromise;
            } else {
              await this.handleTokenRefresh();
            }

            // 刷新后需要重新构建请求（以带上新的 Authorization）
            const retryReq = this.interceptorsRequest({
              url: fullUrl,
              method: 'POST',
              params: params.params,
              headers: params.headers,
              withCredentials: params.withCredentials,
              errorHandler: params?.errorHandler,
            });

            // 重连使用新的 AbortController，避免使用已中止的 signal
            activeController = new AbortController();

            response = await fetch(retryReq.url, {
              ...retryReq.options,
              signal: activeController.signal,
            });

            if (response.ok) {
              addSentryBreadcrumb({
                category: 'sse',
                message: `SSE Reconnected after refresh: ${fullUrl}`,
                level: 'info',
              });

              callback(response);

              return () => activeController.abort();
            }
          } catch {
            // 刷新或重连失败，清除认证数据并重定向到登录页（仅在浏览器环境）
            if (typeof window !== 'undefined') {
              clearAuthData();
              window.location.href = '/auth';
            }
            // 继续走原有错误分支
          }
        }

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

        const sseError = new RequestError(
          errorMessage,
          fullUrl,
          response.status,
          response.statusText,
          errorData,
        );

        // 上报 SSE 错误到 Sentry
        captureSentryException(sseError, {
          tags: {
            errorType: 'SSEError',
            statusCode: response.status,
            url: fullUrl,
          },
          contexts: {
            sse: {
              url: fullUrl,
              status: response.status,
              statusText: response.statusText,
            },
          },
          level: 'error',
        });

        throw sseError;
      }

      // SSE 连接成功
      addSentryBreadcrumb({
        category: 'sse',
        message: `SSE Connected: ${fullUrl}`,
        level: 'info',
        data: {
          url: fullUrl,
          status: response.status,
        },
      });

      // 使用 @azure/core-sse 创建解析流（供调用方读取或验证管道）
      try {
        if (response.body) {
          createSseStream(response.body);
        }
      } catch (e) {
        addSentryBreadcrumb({
          category: 'sse',
          message: `SSE parser init failed: ${fullUrl}`,
          level: 'warning',
          data: { error: e instanceof Error ? e.message : 'Unknown' },
        });
      }

      callback(response);

      return () => activeController.abort();
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        console.log('流读取被中止:', error);
        // 中止是预期行为，不需要额外处理和上报到 Sentry
      } else {
        // 添加 SSE 错误 breadcrumb
        addSentryBreadcrumb({
          category: 'sse',
          message: `SSE Error: ${fullUrl}`,
          level: 'error',
          data: {
            url: fullUrl,
            error: error instanceof Error ? error.message : 'Unknown error',
          },
        });

        // 如果不是 RequestError（已经在上面上报过），则上报到 Sentry
        if (!(error instanceof RequestError)) {
          captureSentryException(error, {
            tags: {
              errorType: 'SSEConnectionError',
              url: fullUrl,
            },
            contexts: {
              sse: {
                url: fullUrl,
              },
            },
            level: 'error',
          });
        }

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
   * 使用 @azure/core-sse 解析事件流并逐条回调
   */
  async sseStream(
    url: string,
    params: Params,
    onMessage: (data: string) => void,
  ): Promise<() => void> {
    const controller = new AbortController();
    let activeController = controller; // 支持重连时替换 controller
    const fullUrl = this.baseURL + url;

    addSentryBreadcrumb({
      category: 'sse',
      message: `SSE Stream Connection: ${fullUrl}`,
      level: 'info',
    });

    const connect = async (): Promise<Response> => {
      const req = this.interceptorsRequest({
        url: fullUrl,
        method: 'POST',
        params: params.params,
        headers: params.headers,
        withCredentials: params.withCredentials,
        errorHandler: params?.errorHandler,
      });

      return fetch(req.url, { ...req.options, signal: activeController.signal });
    };

    const open = async (): Promise<void> => {
      let response = await connect();

      if (!response.ok) {
        if (
          response.status === 401 &&
          typeof window !== 'undefined' &&
          getCookie('refresh_token')
        ) {
          try {
            if (this.isRefreshing) {
              await this.refreshTokenPromise;
            } else {
              await this.handleTokenRefresh();
            }

            // 重连前替换为新的 controller，避免使用已中止的 signal
            activeController = new AbortController();
            response = await connect();
          } catch {
            // 刷新或重连失败，清除认证数据并重定向到登录页（仅在浏览器环境）
            if (typeof window !== 'undefined') {
              clearAuthData();
              window.location.href = '/auth';
            }
          }
        }
      }

      if (!response.ok) {
        throw new RequestError('SSE连接失败', fullUrl, response.status, response.statusText);
      }

      if (!response.body) {
        throw new RequestError('SSE响应无主体', fullUrl, response.status, response.statusText);
      }

      const stream = createSseStream(response.body);
      const reader = stream.getReader();

      const pump = async () => {
        try {
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            if (typeof value === 'string') onMessage(value);
          }
        } catch (err) {
          if (!(err instanceof DOMException && err.name === 'AbortError')) {
            throw err;
          }
        }
      };

      pump().catch((err) => {
        captureSentryException(err, {
          tags: { errorType: 'SSEStreamError', url: fullUrl },
          level: 'error',
        });
      });
    };

    open().catch((err) => {
      captureSentryException(err, {
        tags: { errorType: 'SSEOpenError', url: fullUrl },
        level: 'error',
      });
    });

    return () => activeController.abort();
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
