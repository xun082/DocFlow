import { useState, useEffect, startTransition } from 'react';
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
  isMounted: boolean;
  documentData: any;
}

export function useDocumentEditor({
  documentId,
  initialContent,
  isEditable = true,
  onCommentActivated,
}: DocumentEditorProps): DocumentEditorState {
  const [loading, setLoading] = useState(!initialContent);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [documentData, setDocumentData] = useState<any>(null);
  const [content, setContent] = useState<JSONContent | null>(initialContent || null);

  // 客户端挂载 - 使用startTransition避免flushSync错误
  useEffect(() => {
    startTransition(() => {
      setIsMounted(true);
    });
  }, []);

  // 获取文档内容（仅在客户端且没有初始内容时）
  useEffect(() => {
    if (!isMounted || initialContent || !documentId) return;

    const fetchDocument = async () => {
      try {
        startTransition(() => {
          setLoading(true);
          setError(null);
        });

        const response = await DocumentApi.GetDocumentContent(parseInt(documentId));

        if (response.status === 401) {
          // 认证失败，重定向到登录页
          window.location.href = '/auth';

          return;
        }

        if (response.data?.data) {
          startTransition(() => {
            setDocumentData(response.data!.data);
            setContent((response.data!.data as any).content);
          });
        } else {
          throw new Error('无法获取文档内容');
        }
      } catch (err) {
        console.error('获取文档失败:', err);

        // 如果是认证错误，重定向到登录页
        if (err instanceof Error && err.message.includes('401')) {
          window.location.href = '/auth';

          return;
        }

        startTransition(() => {
          setError(err instanceof Error ? err.message : '获取文档失败');
        });
      } finally {
        startTransition(() => {
          setLoading(false);
        });
      }
    };

    fetchDocument();
  }, [documentId, initialContent, isMounted]);

  // 创建编辑器 - 使用startTransition避免flushSync错误
  const editor = useEditor(
    {
      extensions: ExtensionKit({
        provider: null,
        onCommentActivated,
      }),
      // 如果有initialContent，直接使用它；否则使用空内容等待后续API加载
      content: initialContent || '',
      editable: isEditable,
      immediatelyRender: false, // 关键：不立即渲染，等待手动控制
      onTransaction: () => {
        // 可以在这里处理文档变更，比如自动保存
        // 注意：这里不需要状态更新，所以不需要startTransition
      },
      editorProps: {
        attributes: {
          autocomplete: 'off',
          autocorrect: 'off',
          autocapitalize: 'off',
          class: 'min-h-full',
          spellcheck: 'false',
        },
      },
    },
    [isEditable, isMounted],
  );

  // 内容变化时更新编辑器（仅限从API获取的内容，且没有初始内容时）
  useEffect(() => {
    if (!editor || !content || initialContent || !isMounted) return;

    // 仅在没有初始内容且从API获取到内容时才更新
    const currentContent = editor.getJSON();
    const hasContent = currentContent.content && currentContent.content.length > 0;

    if (!hasContent && content) {
      // 等待编辑器和DOM完全稳定后再设置内容
      const delayTimeout = setTimeout(() => {
        try {
          // 验证编辑器状态
          if (!editor || editor.isDestroyed || !editor.view || !editor.view.state) {
            console.warn('编辑器状态不正常，跳过内容设置');

            return;
          }

          // 验证DOM是否稳定
          if (!editor.view.dom || !document.contains(editor.view.dom)) {
            console.warn('编辑器DOM不在文档中，跳过内容设置');

            return;
          }

          // 安全地设置内容
          editor.commands.setContent(content, false);

          // 进一步延迟设置焦点
          const focusTimeout = setTimeout(() => {
            try {
              if (
                editor &&
                !editor.isDestroyed &&
                editor.view &&
                editor.view.dom &&
                document.contains(editor.view.dom)
              ) {
                editor.commands.focus();
              }
            } catch (error) {
              console.warn('API内容加载后设置焦点失败:', error);
              // 不影响其他功能
            }
          }, 300);

          return () => {
            clearTimeout(focusTimeout);
          };
        } catch (error) {
          console.error('设置编辑器内容失败:', error);
          startTransition(() => {
            setError('编辑器内容加载失败');
          });
        }
      }, 250); // 延迟250ms确保DOM稳定

      return () => {
        clearTimeout(delayTimeout);
      };
    }
  }, [editor, content, initialContent, isMounted]);

  return {
    editor,
    isEditable,
    loading,
    error,
    isMounted,
    documentData,
  };
}

export default useDocumentEditor;
