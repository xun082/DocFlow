import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

import { DocumentClient } from '../_components/DocumentClient';
import { useDocumentError } from '../_components/error';
import { getDocumentContent, generateDocumentHTML } from '../_components/document-service';

// 测试用的固定文档ID
const TEST_DOCUMENT_ID = '79';

export default async function DocumentPage() {
  // 检查认证状态
  const cookieStore = await cookies();
  const authToken = cookieStore.get('auth_token')?.value;

  if (!authToken) {
    redirect('/auth');
  }

  // 在服务器端获取文档数据
  const result = await getDocumentContent(TEST_DOCUMENT_ID, authToken);

  // 处理错误情况
  if (result.error) {
    if (result.error === 'AUTH_FAILED') {
      redirect('/auth');
    }

    return useDocumentError(result, TEST_DOCUMENT_ID);
  }

  const documentData = result.data;
  const content = documentData.content;

  console.log('documentData:', documentData);
  console.log('content:', content);

  // 生成初始HTML用于SSR
  const initialHTML = generateDocumentHTML(content);

  return (
    <div className="w-full h-screen" suppressHydrationWarning>
      <DocumentClient
        documentId={TEST_DOCUMENT_ID}
        initialContent={content}
        initialHTML={initialHTML}
      />
    </div>
  );
}

// 生成静态参数（可选，用于静态生成）
export function generateStaticParams() {
  return [];
}

// 元数据生成
export async function generateMetadata() {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value;

    if (!authToken) {
      return {
        title: 'SSR测试 - 需要登录',
        description: 'SSR认证测试页面',
      };
    }

    const result = await getDocumentContent(TEST_DOCUMENT_ID, authToken);

    if (result.error || !result.data) {
      return {
        title: 'SSR测试 - 加载失败',
        description: 'SSR认证测试页面 - 文档加载失败',
      };
    }

    const title = result.data.title || '无标题文档';

    return {
      title: `SSR测试 - ${title}`,
      description: 'SSR认证测试页面 - ' + title,
    };
  } catch {
    return {
      title: 'SSR测试 - 错误',
      description: 'SSR认证测试页面',
    };
  }
}
