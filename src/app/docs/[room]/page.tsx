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
  const { room: documentId } = await params;

  const cookieStore = await cookies();
  const authToken = cookieStore.get('auth_token')?.value;

  if (!authToken) {
    redirect('/auth');
  }

  // 在服务器端获取文档数据
  const result = await getDocumentContent(documentId, authToken);

  if (result.error) {
    if (result.error === 'AUTH_FAILED') {
      redirect('/auth');
    }

    return useDocumentError(result, documentId);
  }

  const documentData = result.data;
  const content = documentData.content;

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

export function generateStaticParams() {
  return [];
}

// 元数据生成
export async function generateMetadata({ params }: PageProps) {
  const { room: documentId } = await params;

  const cookieStore = await cookies();
  const authToken = cookieStore.get('auth_token')?.value;

  if (!authToken) {
    return {
      title: `协作文档 ${documentId}`,
      description: '实时协作编辑文档平台',
    };
  }

  // Next.js 会自动去重这个请求，不会产生额外的网络调用
  const result = await getDocumentContent(documentId, authToken);
  const title = result.data?.title || `协作文档 ${documentId}`;

  return {
    title,
    description: `实时协作编辑文档：${title}`,
  };
}
