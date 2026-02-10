import { StarterKit } from '@tiptap/starter-kit';
import { Bilibili } from '@syncflow/bilibili';

import { Tiptap } from '../Tiptap';

/**
 * Pre-configured Tiptap transformer with Bilibili extension support
 * Use this for documents that contain Bilibili nodes
 * Perfect for backend/server-side transformations
 *
 * @example
 * ```ts
 * import { TiptapTransformerWithBilibili } from '@syncflow/transformer/presets/bilibili';
 *
 * // Transform Yjs Doc to JSON
 * const json = TiptapTransformerWithBilibili.fromYdoc(ydoc);
 *
 * // Transform JSON to Yjs Doc
 * const ydoc = TiptapTransformerWithBilibili.toYdoc(json);
 * ```
 */
export const TiptapTransformerWithBilibili = new Tiptap().extensions([StarterKit, Bilibili]);
