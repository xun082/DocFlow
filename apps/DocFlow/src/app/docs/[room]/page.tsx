'use client';

import { useEffect, useState, useRef, Activity } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { EditorContent, useEditor } from '@tiptap/react';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCaret from '@tiptap/extension-collaboration-caret';
import { Eye } from 'lucide-react';
import dynamic from 'next/dynamic';
import {
  Group,
  Panel,
  Separator,
  type PanelImperativeHandle,
  type GroupImperativeHandle,
} from 'react-resizable-panels';
import 'md-editor-rt/lib/preview.css';

import { ExtensionKit } from '@/extensions/extension-kit';
import { getSelectionLineRange } from '@/utils/editor';
import DocumentHeader from '@/app/docs/_components/DocumentHeader';
import { FloatingToc } from '@/app/docs/_components/FloatingToc';
import { SearchPanel } from '@/app/docs/_components/SearchPanel';
import { ContentItemMenu } from '@/components/menus/ContentItemMenu';
import { LinkMenu } from '@/components/menus';
import { TextMenu } from '@/components/menus/TextMenu';
import { ImageBlockMenu } from '@/components/menus';
import NoPermission from '@/app/docs/_components/NoPermission';
import { useEditorStore } from '@/stores/editorStore';
import { useEditorHistory } from '@/hooks/useEditorHistory';
import { useChatStore } from '@/stores/chatStore';
import { useDocumentPermission } from '@/hooks/useDocumentPermission';
import { useCollaboration } from '@/hooks/useCollaboration';
import { useTemplateInsertion } from '@/hooks/useTemplateInsertion';

const AgentEditPanel = dynamic(
  () =>
    import('@/app/docs/_components/AgentEditPanel').then((mod) => ({
      default: mod.AgentEditPanel,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col h-full bg-white items-center justify-center gap-2">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
        <span className="text-xs text-gray-400">加载中...</span>
      </div>
    ),
  },
);

export default function DocumentPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const documentId = params?.room as string;
  const forceReadOnly = searchParams?.get('readonly') === 'true';

  const { isOpen: isChatOpen, setIsOpen } = useChatStore();
  const { setEditor, clearEditor } = useEditorStore();

  const menuContainerRef = useRef<HTMLDivElement>(null);
  const chatPanelRef = useRef<PanelImperativeHandle>(null);
  const groupRef = useRef<GroupImperativeHandle>(null);

  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const { permissionData, isLoadingPermission, permissionError, isMounted, doc, currentUser } =
    useDocumentPermission(documentId);

  const {
    provider,
    connectedUsers,
    isCollaborationBootstrapReady,
    isIndexedDBReady,
    isServerSynced,
    serverReadOnly,
  } = useCollaboration(documentId, doc, permissionData, currentUser);

  /**
   * Authoritative read-only flag.
   * Priority: forceReadOnly > serverReadOnly (server-confirmed) > HTTP fallback.
   * VIEW and COMMENT both lack edit permission on the backend, so both are treated
   * as read-only in the fallback.
   */
  const isReadOnly =
    forceReadOnly ||
    (serverReadOnly !== null
      ? serverReadOnly
      : permissionData?.permission === 'VIEW' || permissionData?.permission === 'COMMENT');

  useEditorHistory({
    documentId,
    doc,
    autoSnapshot: true,
    autoSnapshotInterval: 300000,
    snapshotOnUnmount: true,
  });

  const editor = useEditor(
    {
      extensions: [
        ...ExtensionKit({ provider }),
        ...(doc && isCollaborationBootstrapReady
          ? [Collaboration.configure({ document: doc, field: 'content' })]
          : []),
        ...(provider && currentUser && doc && isCollaborationBootstrapReady
          ? [CollaborationCaret.configure({ provider, user: currentUser })]
          : []),
      ],
      editable: !isReadOnly,
      editorProps: {
        attributes: {
          autocomplete: 'off',
          autocorrect: 'off',
          autocapitalize: 'off',
          class: 'min-h-full',
          spellcheck: 'false',
        },
        handleKeyDown: (view, event) => {
          if (event.key !== 'Tab') return false;

          const { state } = view;
          const { from } = state.selection;
          const $from = state.doc.resolve(from);
          const startOfLine = $from.start($from.depth);
          const textBeforeCursor = state.doc.textBetween(startOfLine, from);

          if (event.shiftKey) {
            if (textBeforeCursor.endsWith('  ')) {
              view.dispatch(state.tr.deleteRange(Math.max(startOfLine, from - 2), from));

              return true;
            }

            if (textBeforeCursor.endsWith(' ')) {
              view.dispatch(state.tr.deleteRange(from - 1, from));

              return true;
            }

            return false;
          }

          view.dispatch(view.state.tr.insertText('  '));

          return true;
        },
      },
      immediatelyRender: false,
      shouldRerenderOnTransaction: false,
      onCreate: ({ editor }) => {
        if (editor && documentId) setEditor(editor, documentId);
      },
      onDestroy: () => clearEditor(),
    },
    // isReadOnly is intentionally excluded: permission changes are applied via
    // editor.setEditable() below so the instance is never torn down mid-session.
    [doc, provider, currentUser, isCollaborationBootstrapReady, documentId, setEditor, clearEditor],
  );

  // Keep editable state in sync without recreating the editor.
  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    editor.setEditable(!isReadOnly, false);
  }, [editor, isReadOnly]);

  // Enrich clipboard with document metadata for the AI chat reference feature.
  useEffect(() => {
    if (!editor) return;

    const handleCopy = (e: ClipboardEvent) => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) return;

      try {
        const selectedText = selection.toString();
        if (!selectedText || !e.clipboardData) return;

        const { from, to } = editor.state.selection;
        const { startLine, endLine } = getSelectionLineRange(editor.state.doc, from, to);

        e.clipboardData.setData('text/plain', selectedText);
        e.clipboardData.setData('text/json', JSON.stringify(editor.getJSON()));
        e.clipboardData.setData(
          'application/docflow-reference',
          JSON.stringify({
            type: 'docflow-reference',
            fileName: permissionData?.documentTitle ?? '未命名文档',
            startLine: Math.max(1, startLine - 1),
            endLine: Math.max(1, endLine - 1),
            content: selectedText,
            charCount: selectedText.length,
          }),
        );
        e.preventDefault();
      } catch (error) {
        console.error('复制失败:', error);
      }
    };

    document.addEventListener('copy', handleCopy);

    return () => document.removeEventListener('copy', handleCopy);
  }, [editor, permissionData]);

  useTemplateInsertion(editor, documentId, isCollaborationBootstrapReady, isReadOnly);

  useEffect(() => () => clearEditor(), [clearEditor]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault();
        setIsSearchOpen(true);
      } else if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen]);

  useEffect(() => {
    const panel = chatPanelRef.current;
    const group = groupRef.current;
    if (!panel || !group) return;

    if (isChatOpen) {
      panel.expand();
      requestAnimationFrame(() => group.setLayout({ editor: 65, chat: 35 }));
    } else {
      panel.collapse();
    }
  }, [isChatOpen]);

  // --- Render ---

  if (isLoadingPermission) {
    return <LoadingState title="正在加载文档权限..." />;
  }

  if (permissionError || permissionData?.permission === 'NONE') {
    return (
      <NoPermission
        documentTitle={permissionData?.documentTitle}
        message={permissionError ?? '您没有访问此文档的权限。请联系文档所有者获取访问权限。'}
      />
    );
  }

  if (!isMounted || !doc || !isCollaborationBootstrapReady || !editor) {
    const subtitle = !isMounted
      ? '等待挂载...'
      : !doc
        ? '创建文档...'
        : !isIndexedDBReady
          ? '从本地恢复文档...'
          : !isServerSynced
            ? '连接协作服务并同步最新内容...'
            : '初始化编辑器...';

    return <LoadingState title="正在初始化编辑器..." subtitle={subtitle} />;
  }

  return (
    <div
      className="h-screen flex flex-col bg-white dark:bg-gray-900"
      ref={menuContainerRef}
      suppressHydrationWarning
    >
      <Activity mode={isReadOnly ? 'visible' : 'hidden'}>
        <div className="bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800 px-4 py-2 flex items-center justify-center gap-2 text-amber-800 dark:text-amber-200">
          <Eye className="w-4 h-4" />
          <span className="text-sm font-medium">
            {forceReadOnly
              ? '只读模式 - 当前以只读模式查看文档'
              : '只读模式 - 您只能查看此文档，无法编辑'}
          </span>
        </div>
      </Activity>

      <DocumentHeader
        provider={provider}
        connectedUsers={connectedUsers}
        currentUser={currentUser}
        documentId={documentId}
        documentTitle={permissionData?.documentTitle}
        documentName={`文档 ${documentId}`}
        doc={doc}
      />

      <div className="flex flex-1 overflow-hidden">
        <Group orientation="horizontal" className="flex-1" groupRef={groupRef}>
          <Panel id="editor" defaultSize={25} minSize={20}>
            <div className="h-full relative overflow-hidden">
              <div className="h-full overflow-y-auto overflow-x-hidden relative w-full">
                <EditorContent editor={editor} className="prose-container h-full pl-14" />
              </div>
              <FloatingToc editor={editor} />
            </div>
          </Panel>

          <Separator
            disabled={!isChatOpen}
            className={
              isChatOpen
                ? 'w-1 bg-gray-200 dark:bg-gray-800 hover:bg-blue-500 dark:hover:bg-blue-500 transition-colors cursor-col-resize'
                : 'w-0 opacity-0 pointer-events-none'
            }
          />

          <Panel
            id="chat"
            panelRef={chatPanelRef}
            defaultSize="35"
            minSize="20"
            maxSize="30"
            collapsible
            collapsedSize="0"
          >
            <Activity mode={isChatOpen ? 'visible' : 'hidden'}>
              <AgentEditPanel
                documentId={documentId}
                onClose={() => setIsOpen(false)}
                className="h-full"
              />
            </Activity>
          </Panel>
        </Group>
      </div>

      {editor?.view && (
        <SearchPanel editor={editor} isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      )}

      {editor && (
        <Activity mode={isReadOnly ? 'hidden' : 'visible'}>
          <ContentItemMenu editor={editor} />
          <LinkMenu editor={editor} appendTo={menuContainerRef} />
          <TextMenu editor={editor} />
          <ImageBlockMenu editor={editor} />
        </Activity>
      )}
    </div>
  );
}

function LoadingState({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div
      className="h-screen flex items-center justify-center bg-white dark:bg-gray-900"
      suppressHydrationWarning
    >
      <div className="text-center">
        <div className="inline-block animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mb-4" />
        <p className="text-lg text-gray-600 dark:text-gray-400">{title}</p>
        {subtitle && (
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2" suppressHydrationWarning>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
