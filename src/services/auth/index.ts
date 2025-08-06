import request, { ErrorHandler } from '../request';
import { User } from './type';

/**
 * 认证响应接口
 */
export interface AuthResponse {
  token: string;
  refresh_token?: string;
  expires_in?: number;
  refresh_expires_in?: number;
  user: User;
}

/**
 * 发送验证码响应接口
 */
export interface SendCodeResponse {
  success: boolean;
  message: string;
}

/**
 * 邮箱验证码登录参数
 */
export interface EmailCodeLoginParams {
  email: string;
  code: string;
}

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
   * @returns 新的访问令牌
   */
  refreshToken: (refreshToken: string, errorHandler?: ErrorHandler) =>
    request.post<{ token: string; expires_in: number }>('/api/v1/auth/refresh', {
      params: { refresh_token: refreshToken },
      errorHandler,
    }),
};

export default authApi;
