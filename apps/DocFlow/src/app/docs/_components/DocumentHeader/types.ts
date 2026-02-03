import type { Editor } from '@tiptap/react';
import type * as Y from 'yjs';

export interface CollaborationUser {
  id: string;
  name: string;
  color: string;
  avatar: string;
}

export type ExportAction = 'copy' | 'pdf' | 'docx' | 'blog';

export interface DocumentHeaderProps {
  provider?: unknown;
  connectedUsers?: CollaborationUser[];
  currentUser?: CollaborationUser | null;
  documentId?: string;
  documentName?: string;
  documentTitle?: string;
  doc?: Y.Doc;
}

export interface DocumentActionsProps {
  editor: Editor;
  documentId?: string;
  documentTitle: string;
  doc?: Y.Doc;
  connectedUsers?: CollaborationUser[];
  currentUser?: CollaborationUser | null;
}

export interface CollaborationUsersProps {
  users: CollaborationUser[];
  currentUser?: CollaborationUser | null;
}

export interface UserAvatarProps {
  user: CollaborationUser;
  currentUser?: CollaborationUser | null;
  index: number;
  total: number;
}
