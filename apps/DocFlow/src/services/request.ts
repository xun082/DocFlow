/**
 * @deprecated 请使用 '@/services/request' 代替
 *
 * 迁移指南：
 * - 服务端：import { serverRequest } from '@/services/request';
 * - 客户端：import { clientRequest } from '@/services/request';
 * - 或直接：import request from '@/services/request';
 */

export * from './request/index';
export { default } from './request/index';
