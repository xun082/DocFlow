import { Doc } from 'yjs';

export interface Transformer {
  fromYdoc: (document: Doc, fieldName?: string | string[]) => Record<string, any>;
  toYdoc: (document: any, fieldName: string | string[]) => Doc;
}
