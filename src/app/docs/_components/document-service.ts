import { generateHTML } from '@tiptap/html';
import { JSONContent } from '@tiptap/core';

// 定义DocumentResult类型
export interface DocumentResult {
  data?: any;
  error?: string | null;
  status?: number;
  message?: string;
}

import { ExtensionKitServer } from '@/extensions/extension-kit-server';
import request from '@/services/request';

// 获取文档内容
export async function getDocumentContent(
  documentId: string,
  authToken: string,
): Promise<DocumentResult> {
  try {
    const result = await request.get(
      `/api/v1/documents/${documentId}/content`,
      { cacheTime: 30 },
      undefined,
      authToken,
    );

    if (result.error) {
      // 简化错误处理，只处理主要状态码
      switch (result.status) {
        case 401:
          return { error: 'AUTH_FAILED', status: 401, message: '认证失败，请重新登录' };
        case 403:
          return { error: 'PERMISSION_DENIED', status: 403, message: '没有权限访问此文档' };
        case 404:
          return { error: 'NOT_FOUND', status: 404, message: '文档不存在或已被删除' };
        default:
          return {
            error: 'API_ERROR',
            status: result.status,
            message: result.error || '请求失败',
          };
      }
    }

    if (!result.data?.data) {
      return { error: 'INVALID_DATA', message: '响应数据格式错误' };
    }

    return { data: result.data.data, error: null };
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('文档获取失败:', error);
    }

    return { error: 'NETWORK_ERROR', message: '网络连接失败，请检查网络连接' };
  }
}

// 生成文档HTML - 使用与客户端相同的扩展
export function generateDocumentHTML(content: JSONContent): string {
  try {
    if (!content || typeof content !== 'object' || !content.type) {
      return '<div class="text-gray-500 p-4 text-center">正在加载文档内容...</div>';
    }

    return generateHTML(content, ExtensionKitServer());
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('HTML生成失败:', error);
    }

    return '<div class="text-gray-500 p-4 text-center">正在加载文档内容...</div>';
  }
}
