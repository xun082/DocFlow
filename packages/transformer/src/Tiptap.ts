import { Doc } from 'yjs';
import { Extensions, getSchema } from '@tiptap/core';
import { StarterKit } from '@tiptap/starter-kit';

import { Transformer } from './types';
import { ProsemirrorTransformer } from './Prosemirror';

export class Tiptap implements Transformer {
  defaultExtensions: Extensions = [StarterKit];

  extensions(extensions: Extensions): Tiptap {
    this.defaultExtensions = extensions;

    return this;
  }

  fromYdoc(document: Doc, fieldName?: string | string[]): Record<string, any> {
    return ProsemirrorTransformer.fromYdoc(document, fieldName);
  }

  toYdoc(document: any, fieldName: string | string[] = 'default', extensions?: Extensions): Doc {
    return ProsemirrorTransformer.toYdoc(
      document,
      fieldName,
      getSchema(extensions || this.defaultExtensions),
    );
  }
}

/**
 * Default Tiptap transformer with StarterKit only
 * For basic document transformations without custom extensions
 */
export const TiptapTransformer = new Tiptap();

/**
 * Helper function to create a custom Tiptap transformer with specific extensions
 * @param extensions - Array of Tiptap extensions to include
 * @returns A configured Tiptap transformer
 *
 * @example
 * ```ts
 * // For frontend with React Alert component
 * import { Alert } from '@syncflow/alert';
 * const transformer = createTiptapTransformer([StarterKit, Alert]);
 *
 * // For backend with Alert schema only
 * import { AlertSchema } from '@syncflow/alert';
 * const transformer = createTiptapTransformer([StarterKit, AlertSchema]);
 * ```
 */
export function createTiptapTransformer(extensions: Extensions): Tiptap {
  const transformer = new Tiptap();
  transformer.extensions(extensions);

  return transformer;
}
