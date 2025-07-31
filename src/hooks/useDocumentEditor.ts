import { useState, useEffect } from 'react';
import { useEditor } from '@tiptap/react';
import { JSONContent } from '@tiptap/core';

import { ExtensionKit } from '@/extensions/extension-kit';
import { DocumentApi } from '@/services/document';

export interface DocumentEditorProps {
  documentId: string;
  initialContent?: JSONContent;
  isEditable?: boolean;
  onCommentActivated?: (commentId: string) => void;
}

export interface DocumentEditorState {
  editor: any;
  isEditable: boolean;
  loading: boolean;
  error: string | null;
  documentData: any;
}

export function useDocumentEditor({
  documentId,
  initialContent,
  isEditable = true,
}: DocumentEditorProps): DocumentEditorState {
  const [loading, setLoading] = useState(!initialContent);
  const [error, setError] = useState<string | null>(null);
  const [documentData, setDocumentData] = useState<any>(null);

  // 创建编辑器
  const editor = useEditor({
    extensions: ExtensionKit({
      provider: null,
    }),
    content: initialContent || '',
    editable: isEditable,
    immediatelyRender: true,
    editorProps: {
      attributes: {
        autocomplete: 'off',
        autocorrect: 'off',
        autocapitalize: 'off',
        class: 'min-h-full',
        spellcheck: 'false',
      },
    },
  });

  // 获取文档内容
  useEffect(() => {
    if (initialContent || !documentId || documentId === '') return;

    const fetchDocument = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await DocumentApi.GetDocumentContent(parseInt(documentId));

        if (response.status === 401) {
          window.location.href = '/auth';

          return;
        }

        if (response.data?.data) {
          const docData = response.data.data;
          setDocumentData(docData);

          // 设置编辑器内容
          if (editor && (docData as any).content) {
            editor.commands.setContent((docData as any).content, false);
          }
        } else {
          throw new Error('无法获取文档内容');
        }
      } catch (err) {
        console.error('获取文档失败:', err);

        if (err instanceof Error && err.message.includes('401')) {
          window.location.href = '/auth';

          return;
        }

        setError(err instanceof Error ? err.message : '获取文档失败');
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [documentId, initialContent, editor]);

  // 更新编辑器可编辑状态
  useEffect(() => {
    if (editor) {
      editor.setEditable(isEditable);
    }
  }, [editor, isEditable]);

  return {
    editor,
    isEditable,
    loading,
    error,
    documentData,
  };
}

export default useDocumentEditor;
