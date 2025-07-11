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
      { cacheTime: 0 },
      undefined,
      authToken,
    );

    if (result.error) {
      // 根据状态码返回不同的错误信息
      switch (result.status) {
        case 401:
          return { error: 'AUTH_FAILED', status: 401, message: '认证失败，请重新登录' };

        case 403:
          return { error: 'PERMISSION_DENIED', status: 403, message: '没有权限访问此文档' };

        case 404:
          return { error: 'NOT_FOUND', status: 404, message: '文档不存在或已被删除' };

        case 500:
          return { error: 'SERVER_ERROR', status: 500, message: '服务器内部错误，请稍后重试' };

        default:
          return {
            error: `API_ERROR_${result.status || 'UNKNOWN'}`,
            status: result.status,
            message: result.error,
          };
      }
    }

    if (!result.data?.data) {
      return { error: 'INVALID_DATA', status: 200, message: '响应数据格式错误' };
    }

    return { data: result.data.data, error: null };
  } catch (error) {
    // 仅在开发环境记录详细错误信息
    if (process.env.NODE_ENV === 'development') {
      console.error('文档获取失败:', error);
    }

    return { error: 'NETWORK_ERROR', status: 0, message: '网络连接失败，请检查网络连接' };
  }
}

// 生成文档HTML - 使用与客户端相同的扩展
export function generateDocumentHTML(content: JSONContent): string {
  try {
    // 简单验证content格式
    if (!content || typeof content !== 'object' || !content.type) {
      console.log('⚠️ generateDocumentHTML: content格式无效，使用占位符');

      return '<div class="text-gray-500 p-4 text-center">正在加载文档内容...</div>';
    }

    console.log('🔄 generateDocumentHTML: 使用服务端扩展配置生成HTML');

    // 使用专门的服务端扩展配置
    const html = generateHTML(content, ExtensionKitServer());

    // 后处理HTML：确保空段落显示正确
    const processedHTML = html
      // 将空的<p></p>标签替换为包含不间断空格的段落
      .replace(/<p([^>]*)><\/p>/g, '<p$1>&nbsp;</p>')
      // 确保所有段落都有适当的样式类
      .replace(/<p(\s[^>]*)?>/g, '<p class="leading-relaxed my-3"$1>')
      // 修复重复的class属性
      .replace(/class="([^"]*)" class="([^"]*)"/g, 'class="$1 $2"');

    console.log('✅ generateDocumentHTML: HTML生成并处理成功');

    return processedHTML;
  } catch (error) {
    // 仅在开发环境记录详细错误信息
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ generateDocumentHTML: HTML生成失败:', error);
      console.log('原始content:', content);
    }

    return '<div class="text-gray-500 p-4 text-center">正在加载文档内容...</div>';
  }
}
