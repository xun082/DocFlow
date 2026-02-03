import { Doc, applyUpdate, encodeStateAsUpdate } from 'yjs';
import { yDocToProsemirrorJSON, prosemirrorJSONToYDoc } from 'y-prosemirror';
import { Schema } from '@tiptap/pm/model';

import { Transformer } from './types';

class Prosemirror implements Transformer {
  defaultSchema: Schema = new Schema({
    nodes: {
      text: {},
      doc: { content: 'text*' },
    },
  });

  schema(schema: Schema): Prosemirror {
    this.defaultSchema = schema;

    return this;
  }

  fromYdoc(document: Doc, fieldName?: string | string[]): Record<string, any> {
    const data: Record<string, any> = {};

    // allow a single field name
    if (typeof fieldName === 'string') {
      return { [fieldName]: yDocToProsemirrorJSON(document, fieldName) };
    }

    // Get all available field names from the document
    const fields: string[] = fieldName && fieldName.length > 0 ? fieldName : [];

    // If no fields specified, iterate through all shared types
    if (fields.length === 0) {
      const shareMap = document.share as Map<string, any>;
      fields.push(...Array.from(shareMap.keys()));
    }

    fields.forEach((field) => {
      data[field] = yDocToProsemirrorJSON(document, field);
    });

    return data;
  }

  toYdoc(document: any, fieldName: string | string[] = 'prosemirror', schema?: Schema): Doc {
    if (!document) {
      throw new Error(
        `You’ve passed an empty or invalid document to the Transformer. Make sure to pass ProseMirror-compatible JSON. Actually passed JSON: ${document}`,
      );
    }

    // allow a single field name
    if (typeof fieldName === 'string') {
      return prosemirrorJSONToYDoc(schema || this.defaultSchema, document, fieldName);
    }

    const ydoc = new Doc();

    fieldName.forEach((field) => {
      const update = encodeStateAsUpdate(
        prosemirrorJSONToYDoc(schema || this.defaultSchema, document, field),
      );

      applyUpdate(ydoc, update);
    });

    return ydoc;
  }
}

export const ProsemirrorTransformer = new Prosemirror();
