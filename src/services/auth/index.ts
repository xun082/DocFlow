import request, { ErrorHandler } from '../request';

import type {
  User,
  AuthResponse,
  TokenRefreshResponse,
  SendCodeResponse,
  EmailCodeLoginParams,
} from '@/types/auth';

/**
 * 认证服务API
 */
export const authApi = {
  /**
   * 获取当前用户信息
   * @param errorHandler 自定义错误处理函数
   * @returns 用户信息，包含错误处理
   */
  getCurrentUser: (errorHandler?: ErrorHandler) =>
    request.get<User>('/api/v1/auth/profile', { errorHandler }),

  /**
   * 发送邮箱验证码
   * @param email 邮箱地址
   * @param errorHandler 自定义错误处理函数
   * @returns 发送结果
   */
  sendEmailCode: (email: string, errorHandler?: ErrorHandler) =>
    request.post<SendCodeResponse>('/api/v1/auth/email/send-code', {
      params: { email },
      errorHandler,
      // 网络较慢时避免自动重试造成的重复发送，适当延长超时
      retries: 0,
      timeout: 30000,
    }),

  /**
   * 使用邮箱验证码登录
   * @param params 邮箱和验证码
   * @param errorHandler 自定义错误处理函数
   * @returns 认证结果，包含token等信息
   */
  emailCodeLogin: (params: EmailCodeLoginParams, errorHandler?: ErrorHandler) =>
    request.post<AuthResponse>('/api/v1/auth/email/login', {
      params,
      errorHandler,
    }),

  /**
   * 使用GitHub授权码完成登录
   * @param code GitHub提供的授权码
   * @param errorHandler 自定义错误处理函数
   * @returns 认证结果，包含token等信息
   */
  githubCallback: (code: string, errorHandler?: ErrorHandler) =>
    request.get<AuthResponse>('/api/v1/auth/github/callback', {
      params: { code },
      errorHandler,
      withCredentials: true,
      timeout: 60000, // 增加超时到60秒，GitHub OAuth可能需要更长时间
      retries: 3, // 允许重试3次
    }),

  /**
   * 登出当前用户
   * @param errorHandler 自定义错误处理函数
   * @returns 登出结果
   */
  logout: (errorHandler?: ErrorHandler) =>
    request.post<{ success: boolean }>('/api/v1/auth/logout', { errorHandler }),

  /**
   * 刷新访问令牌
   * @param refreshToken 刷新令牌
   * @param errorHandler 自定义错误处理函数
   * @returns 新的访问令牌和刷新令牌
   * @note 此接口通常由 request.ts 内部自动调用，当检测到 401 错误时会自动刷新 token
   */
  refreshToken: (refreshToken: string, errorHandler?: ErrorHandler) =>
    request.post<TokenRefreshResponse>('/api/v1/auth/refresh', {
      params: { refresh_token: refreshToken },
      errorHandler,
    }),
};

export default authApi;
