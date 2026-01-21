/**
 * 客户端请求模块
 * 完整版本，包含：token 认证、自动刷新、SSE、Sentry 上报、重试机制
 * 仅用于浏览器环境
 */

'use client';

import * as Sentry from '@sentry/nextjs';
import { createSseStream } from '@azure/core-sse';

import type {
  Method,
  CacheConfig,
  ClientParams,
  ApiResponse,
  RequestResult,
  ErrorHandler,
  QueuedRequest,
  RequestOptions,
  RequestParams,
} from './types';
import { RequestError } from './types';

import { getCookie, saveAuthData, clearAuthData } from '@/utils/auth/cookie';
import { HTTP_METHODS, HTTP_CREDENTIALS, HTTP_STATUS_MESSAGES } from '@/utils/constants/http';
import { ROUTES } from '@/utils/constants/routes';
import type { TokenRefreshResponse } from '@/types/auth';

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
  Sentry.captureException(error, options as Parameters<typeof Sentry.captureException>[1]);
}

interface ClientRequestProps {
  url: string;
  method: Method;
  mode?: RequestMode;
  token?: string;
  params?: RequestParams;
  cacheTime?: number;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  headers?: Record<string, string>;
  withCredentials?: boolean;
  signal?: AbortSignal;
  errorHandler?: ErrorHandler;
}

class ClientRequest {
  private baseURL: string;
  private defaultTimeout: number;
  private defaultRetries: number;
  private defaultRetryDelay: number;

  // 刷新尝试限制，避免潜在循环
  private maxRefreshAttempts = 2;
  private currentRefreshAttempts = 0;

  // Token 刷新相关
  private isRefreshing = false;
  private refreshTokenPromise: Promise<string> | null = null;
  private failedQueue: QueuedRequest[] = [];

  constructor(baseURL: string, options?: RequestOptions) {
    this.baseURL = baseURL;
    this.defaultTimeout = options?.timeout || 10000;
    this.defaultRetries = options?.retries || 0;
    this.defaultRetryDelay = options?.retryDelay || 1000;
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
   * 统一处理认证失败
   */
  private handleAuthFailure(): void {
    clearAuthData();

    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname + window.location.search;
      const loginUrl = new URL(ROUTES.AUTH, window.location.origin);

      if (currentPath && currentPath !== ROUTES.AUTH) {
        loginUrl.searchParams.set('redirect_to', encodeURIComponent(currentPath));
      }

      window.location.href = loginUrl.toString();
    }
  }

  /**
   * 刷新访问令牌
   */
  private async refreshAccessToken(): Promise<string> {
    const refreshToken = getCookie('refresh_token');

    if (!refreshToken) {
      throw new RequestError('未找到刷新令牌，请重新登录', '', 401, 'Unauthorized');
    }

    try {
      const refreshUrl = this.baseURL + '/api/v1/auth/refresh';

      addSentryBreadcrumb({
        category: 'auth',
        message: 'Refreshing access token',
        level: 'info',
      });

      const csrfToken = getCookie('csrf_token');
      const response = await fetch(refreshUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}),
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!response.ok) {
        this.handleAuthFailure();
        throw new RequestError(
          '刷新令牌失败，请重新登录',
          refreshUrl,
          response.status,
          response.statusText,
        );
      }

      const result = await response.json();

      if (
        result.code !== undefined &&
        result.code !== 0 &&
        (result.code < 200 || result.code >= 300)
      ) {
        this.handleAuthFailure();
        throw new RequestError(result.message, refreshUrl, 401, 'Unauthorized', result);
      }

      const tokenData: TokenRefreshResponse = result.data;

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
      this.handleAuthFailure();

      addSentryBreadcrumb({
        category: 'auth',
        message: 'Token refresh failed',
        level: 'error',
      });

      throw error;
    }
  }

  /**
   * 处理 token 刷新和请求队列
   */
  private async handleTokenRefresh(): Promise<string> {
    if (this.isRefreshing && this.refreshTokenPromise) {
      return this.refreshTokenPromise;
    }

    if (this.currentRefreshAttempts >= this.maxRefreshAttempts) {
      throw new RequestError('刷新令牌次数过多，请重新登录', '', 401, 'Unauthorized');
    }

    this.isRefreshing = true;
    this.currentRefreshAttempts += 1;

    this.refreshTokenPromise = this.refreshAccessToken()
      .then((newToken) => {
        this.isRefreshing = false;
        this.refreshTokenPromise = null;
        this.currentRefreshAttempts = 0;
        this.processQueue(null);

        return newToken;
      })
      .catch((error) => {
        this.isRefreshing = false;
        this.refreshTokenPromise = null;
        this.processQueue(error);
        throw error;
      });

    return this.refreshTokenPromise;
  }

  /**
   * 处理请求队列
   */
  private processQueue(error: Error | null) {
    this.failedQueue.forEach((queuedRequest) => {
      if (error) {
        queuedRequest.reject(error);
      } else {
        queuedRequest.requestFn().then(queuedRequest.resolve).catch(queuedRequest.reject);
      }
    });
    this.failedQueue = [];
  }

  /**
   * 将请求添加到队列
   */
  private addRequestToQueue<T>(requestFn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.failedQueue.push({
        resolve: resolve as (value: unknown) => void,
        reject,
        requestFn,
      });
    });
  }

  /**
   * 构建请求配置
   */
  private buildRequest({
    url,
    method,
    params,
    cacheTime,
    token,
    headers: customHeaders,
    withCredentials,
  }: ClientRequestProps) {
    let queryParams = '';
    let requestPayload: string | FormData | URLSearchParams | undefined;

    const headers: Record<string, string> = { ...customHeaders };

    const authToken = token || getCookie('auth_token');

    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

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
        credentials: withCredentials ? HTTP_CREDENTIALS.INCLUDE : HTTP_CREDENTIALS.SAME_ORIGIN,
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
   * 执行请求重试（带 token 刷新支持）
   */
  private async executeWithRetry<T>(
    requestFn: () => Promise<T>,
    retries: number,
    retryDelay: number,
    isRetryAfterRefresh: boolean = false,
  ): Promise<T> {
    try {
      return await requestFn();
    } catch (error) {
      // 处理 401 错误 - token 过期
      if (error instanceof RequestError && error.status === 401 && !isRetryAfterRefresh) {
        if (!getCookie('refresh_token')) {
          throw error;
        }

        try {
          if (this.isRefreshing) {
            return this.addRequestToQueue(requestFn);
          }

          await this.handleTokenRefresh();

          return this.executeWithRetry(requestFn, 0, 0, true);
        } catch {
          this.handleAuthFailure();
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
    if (error instanceof RequestError) {
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

      if (handlers && error.status) {
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

      return error.message || fallbackMessage;
    }

    if (
      error instanceof TypeError &&
      (error.message.includes('Failed to fetch') ||
        error.message.includes('Network request failed'))
    ) {
      captureSentryException(error, {
        tags: { errorType: 'NetworkError' },
        level: 'error',
      });

      if (handlers?.networkError) {
        handlers.networkError();
      }

      return '网络连接错误，请检查您的网络';
    }

    if (error instanceof DOMException && error.name === 'AbortError') {
      return '请求已取消';
    }

    captureSentryException(error, {
      tags: { errorType: 'UnknownError' },
      level: 'error',
    });

    if (handlers?.default) {
      handlers.default(error);
    }

    return error instanceof Error ? error.message : fallbackMessage;
  }

  /**
   * 包装请求，返回统一结果格式
   */
  private async handleRequest<T>(
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
        ...(handlers as Record<number, (error: RequestError) => void>),
        default: handlers?.default || handlers?.onError,
      });

      if (typeof errorHandler === 'function') {
        errorHandler(error);
      } else if (errorHandler?.onError) {
        errorHandler.onError(error);
      }

      const status = error instanceof RequestError ? error.status : undefined;

      return { data: null, error: errorMessage, status };
    }
  }

  /**
   * 执行 HTTP 请求
   */
  private async execute<T>(props: ClientRequestProps): Promise<T> {
    const {
      url = '',
      params,
      method,
      mode,
      token,
      timeout = this.defaultTimeout,
      retries = this.defaultRetries,
      retryDelay = this.defaultRetryDelay,
      signal,
      cacheTime,
      headers,
      withCredentials,
    } = props;

    const fullUrl = this.baseURL + url;

    addSentryBreadcrumb({
      category: 'http',
      message: `${method} ${fullUrl}`,
      level: 'info',
      data: { url: fullUrl, method, timeout, retries },
    });

    const req = this.buildRequest({
      url: fullUrl,
      method,
      params,
      cacheTime,
      mode,
      token,
      headers,
      withCredentials,
    });

    const makeRequest = async (): Promise<T> => {
      const fetchPromise = fetch(req.url, {
        ...req.options,
        signal,
      } as RequestInit);

      let res: Response;

      if (timeout) {
        res = await Promise.race([fetchPromise, this.createTimeoutPromise(timeout)]);
      } else {
        res = await fetchPromise;
      }

      addSentryBreadcrumb({
        category: 'http',
        message: `${method} ${fullUrl} - ${res.status}`,
        level: 'info',
        data: { url: fullUrl, method, status: res.status, statusText: res.statusText },
      });

      return this.handleResponse<T>(res, fullUrl);
    };

    const requestFn = async () => {
      try {
        return await makeRequest();
      } catch (error) {
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
        throw error;
      }
    };

    return this.executeWithRetry(requestFn, retries, retryDelay);
  }

  /**
   * 内部请求方法
   */
  private async internalRequest<T>(
    method: Method,
    url: string,
    params?: ClientParams,
    mode?: RequestMode,
    token?: string,
  ): Promise<ApiResponse<T>> {
    return this.execute<ApiResponse<T>>({
      url,
      params: params?.params,
      method,
      mode,
      token,
      cacheTime: params?.cacheTime,
      timeout: params?.timeout,
      retries: params?.retries,
      retryDelay: params?.retryDelay,
      signal: params?.signal,
      headers: params?.headers,
      withCredentials: params?.withCredentials,
    });
  }

  /**
   * GET 请求
   */
  get<T>(
    url: string,
    params?: ClientParams,
    mode?: RequestMode,
    token?: string,
  ): Promise<RequestResult<T>> {
    return this.handleRequest<T>(
      () => this.internalRequest<T>(HTTP_METHODS.GET, url, params, mode, token),
      params?.errorHandler,
    );
  }

  /**
   * POST 请求
   */
  post<T>(
    url: string,
    params?: ClientParams,
    mode?: RequestMode,
    token?: string,
  ): Promise<RequestResult<T>> {
    return this.handleRequest<T>(
      () => this.internalRequest<T>(HTTP_METHODS.POST, url, params, mode, token),
      params?.errorHandler,
    );
  }

  /**
   * PUT 请求
   */
  put<T>(
    url: string,
    params?: ClientParams,
    mode?: RequestMode,
    token?: string,
  ): Promise<RequestResult<T>> {
    return this.handleRequest<T>(
      () => this.internalRequest<T>(HTTP_METHODS.PUT, url, params, mode, token),
      params?.errorHandler,
    );
  }

  /**
   * DELETE 请求
   */
  delete<T>(
    url: string,
    params?: ClientParams,
    mode?: RequestMode,
    token?: string,
  ): Promise<RequestResult<T>> {
    return this.handleRequest<T>(
      () => this.internalRequest<T>(HTTP_METHODS.DELETE, url, params, mode, token),
      params?.errorHandler,
    );
  }

  /**
   * PATCH 请求
   */
  patch<T>(
    url: string,
    params?: ClientParams,
    mode?: RequestMode,
    token?: string,
  ): Promise<RequestResult<T>> {
    return this.handleRequest<T>(
      () => this.internalRequest<T>(HTTP_METHODS.PATCH, url, params, mode, token),
      params?.errorHandler,
    );
  }

  /**
   * SSE 请求（返回原始 Response）
   */
  async sse(
    url: string,
    params: ClientParams,
    callback: (response: Response) => void,
  ): Promise<(() => void) | undefined> {
    const controller = new AbortController();
    let activeController = controller;
    const fullUrl = this.baseURL + url;

    addSentryBreadcrumb({
      category: 'sse',
      message: `SSE Connection: ${fullUrl}`,
      level: 'info',
      data: { url: fullUrl, method: 'POST' },
    });

    try {
      const req = this.buildRequest({
        url: fullUrl,
        method: HTTP_METHODS.POST,
        params: params.params,
        headers: params.headers,
        withCredentials: params.withCredentials,
      });

      let response = await fetch(req.url, {
        ...req.options,
        signal: activeController.signal,
      } as RequestInit);

      // 处理 401 错误，尝试刷新 token
      if (!response.ok) {
        if (response.status === 401 && getCookie('refresh_token')) {
          try {
            if (this.isRefreshing) {
              await this.refreshTokenPromise;
            } else {
              await this.handleTokenRefresh();
            }

            const retryReq = this.buildRequest({
              url: fullUrl,
              method: HTTP_METHODS.POST,
              params: params.params,
              headers: params.headers,
              withCredentials: params.withCredentials,
            });

            activeController = new AbortController();
            response = await fetch(retryReq.url, {
              ...retryReq.options,
              signal: activeController.signal,
            } as RequestInit);

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
            this.handleAuthFailure();
          }
        }

        let errorMessage = HTTP_STATUS_MESSAGES[response.status] || 'SSE连接失败';
        let errorData = null;

        try {
          const contentType = response.headers.get('content-type');

          if (contentType?.includes('application/json')) {
            const clonedResponse = response.clone();
            errorData = await clonedResponse.json();

            if (errorData.message) {
              errorMessage = errorData.message;
            }
          }
        } catch {
          // 使用默认错误消息
        }

        const sseError = new RequestError(
          errorMessage,
          fullUrl,
          response.status,
          response.statusText,
          errorData,
        );

        captureSentryException(sseError, {
          tags: { errorType: 'SSEError', statusCode: response.status, url: fullUrl },
          contexts: {
            sse: { url: fullUrl, status: response.status, statusText: response.statusText },
          },
          level: 'error',
        });

        throw sseError;
      }

      addSentryBreadcrumb({
        category: 'sse',
        message: `SSE Connected: ${fullUrl}`,
        level: 'info',
        data: { url: fullUrl, status: response.status },
      });

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
        // 中止是预期行为
      } else {
        addSentryBreadcrumb({
          category: 'sse',
          message: `SSE Error: ${fullUrl}`,
          level: 'error',
          data: {
            url: fullUrl,
            error: error instanceof Error ? error.message : 'Unknown error',
          },
        });

        if (!(error instanceof RequestError)) {
          captureSentryException(error, {
            tags: { errorType: 'SSEConnectionError', url: fullUrl },
            contexts: { sse: { url: fullUrl } },
            level: 'error',
          });
        }

        if (typeof params?.errorHandler === 'function') {
          params.errorHandler(error);
        } else if (params?.errorHandler?.onError) {
          params.errorHandler.onError(error);
        }

        console.error('流读取过程中出错:', error);
        throw error;
      }

      throw error;
    }
  }

  /**
   * SSE 流式请求（使用 @azure/core-sse 解析）
   */
  async sseStream(
    url: string,
    params: ClientParams,
    onMessage: (data: string) => void,
  ): Promise<() => void> {
    const controller = new AbortController();
    let activeController = controller;
    const fullUrl = this.baseURL + url;

    addSentryBreadcrumb({
      category: 'sse',
      message: `SSE Stream Connection: ${fullUrl}`,
      level: 'info',
    });

    const connect = async (): Promise<Response> => {
      const req = this.buildRequest({
        url: fullUrl,
        method: HTTP_METHODS.POST,
        params: params.params,
        headers: params.headers,
        withCredentials: params.withCredentials,
      });

      return fetch(req.url, {
        ...req.options,
        signal: activeController.signal,
      } as RequestInit);
    };

    const open = async (): Promise<void> => {
      let response = await connect();

      if (!response.ok) {
        if (response.status === 401 && getCookie('refresh_token')) {
          try {
            if (this.isRefreshing) {
              await this.refreshTokenPromise;
            } else {
              await this.handleTokenRefresh();
            }

            activeController = new AbortController();
            response = await connect();
          } catch {
            this.handleAuthFailure();
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

// 创建客户端请求实例
const clientRequest = new ClientRequest(process.env.NEXT_PUBLIC_SERVER_URL || '', {
  timeout: 15000,
  retries: 1,
  retryDelay: 1000,
});

export { ClientRequest, clientRequest };
export default clientRequest;
