/**
 * 请求模块统一导出
 *
 * 使用方式：
 *
 * 1. 服务端组件/API 路由（无需认证）：
 *    import { serverRequest } from '@/services/request';
 *    const { data, error } = await serverRequest.get('/api/v1/posts');
 *
 * 2. 客户端组件（需要认证、SSE、错误上报）：
 *    import { clientRequest } from '@/services/request';
 *    const { data, error } = await clientRequest.get('/api/v1/user/profile');
 *
 * 3. 兼容旧代码（默认导出客户端请求）：
 *    import request from '@/services/request';
 *    const { data, error } = await request.get('/api/v1/posts');
 */

// 导出类型
export type {
  Method,
  CacheConfig,
  ServerParams,
  ClientParams,
  ApiResponse,
  RequestResult,
  ErrorHandler,
  RequestOptions,
} from './types';

export { RequestError } from './types';

// 导出服务端请求
export { ServerRequest, serverRequest } from './server';

// 导出客户端请求
export { ClientRequest, clientRequest } from './client';

// 默认导出客户端请求（兼容旧代码）
export { clientRequest as default } from './client';
