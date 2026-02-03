export interface MentionUser {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  role?: string;
}

export interface MentionAttrs {
  id: string;
  label: string;
  email?: string;
}

export interface MentionListProps {
  command: (attrs: MentionAttrs) => void;
  items: MentionUser[];
}
