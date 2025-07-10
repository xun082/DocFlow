import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

import { DocumentClient } from '../_components/DocumentClient';
import { useDocumentError } from '../_components/error';
import { getDocumentContent, generateDocumentHTML } from '../_components/document-service';

interface PageProps {
  params: Promise<{
    room: string;
  }>;
}

export default async function DocumentPage({ params }: PageProps) {
  // 获取动态路由参数
  const { room: documentId } = await params;
  // 检查认证状态
  const cookieStore = await cookies();
  const authToken = cookieStore.get('auth_token')?.value;

  if (!authToken) {
    redirect('/auth');
  }

  // 在服务器端获取文档数据
  const result = await getDocumentContent(documentId, authToken);

  // 处理错误情况
  if (result.error) {
    if (result.error === 'AUTH_FAILED') {
      redirect('/auth');
    }

    return useDocumentError(result, documentId);
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
        documentId={documentId}
        initialContent={content}
        initialHTML={initialHTML}
        enableCollaboration={true}
      />
    </div>
  );
}

// 生成静态参数（可选，用于静态生成）
export function generateStaticParams() {
  return [];
}

// 元数据生成
export async function generateMetadata({ params }: PageProps) {
  try {
    // 获取动态路由参数
    const { room: documentId } = await params;

    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value;

    if (!authToken) {
      return {
        title: `协作文档 ${documentId} - 需要登录`,
        description: '需要登录才能查看此协作文档',
      };
    }

    const result = await getDocumentContent(documentId, authToken);

    if (result.error || !result.data) {
      return {
        title: `协作文档 ${documentId} - 加载失败`,
        description: '协作文档加载失败，请稍后重试',
      };
    }

    const title = result.data.title || '无标题协作文档';

    return {
      title: title,
      description: `实时协作编辑文档：${title}`,
    };
  } catch {
    return {
      title: '协作文档 - 错误',
      description: '协作文档加载时发生错误',
    };
  }
}
