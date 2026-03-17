import { Document as TiptapDocument } from '@tiptap/extension-document';

export const Document = TiptapDocument.extend({
  content: 'block+',
});

export default Document;
