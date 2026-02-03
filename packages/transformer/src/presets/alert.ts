import { StarterKit } from '@tiptap/starter-kit';
import { AlertSchema } from '@syncflow/alert';

import { Tiptap } from '../Tiptap';

/**
 * Pre-configured Tiptap transformer with Alert extension support
 * Use this for documents that contain Alert nodes
 * Perfect for backend/server-side transformations
 *
 * @example
 * ```ts
 * import { TiptapTransformerWithAlert } from '@syncflow/transformer/presets/alert';
 *
 * // Transform Yjs Doc to JSON
 * const json = TiptapTransformerWithAlert.fromYdoc(ydoc);
 *
 * // Transform JSON to Yjs Doc
 * const ydoc = TiptapTransformerWithAlert.toYdoc(json);
 * ```
 */
export const TiptapTransformerWithAlert = new Tiptap().extensions([StarterKit, AlertSchema]);
