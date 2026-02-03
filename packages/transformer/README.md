# @syncflow/transformer

Transformation utilities for Tiptap and ProseMirror with Yjs support.

## Features

- 🔄 Convert between Yjs documents and ProseMirror/Tiptap JSON
- 📦 Support for custom extensions including Alert nodes
- 🚀 Optimized for both client and server-side usage
- 🎯 Type-safe with full TypeScript support

## Installation

```bash
pnpm add @syncflow/transformer
```

## Usage

### Basic Transformation

```typescript
import { TiptapTransformer } from '@syncflow/transformer';
import { Doc } from 'yjs';

// Convert Yjs document to JSON
const json = TiptapTransformer.fromYdoc(ydoc, 'default');

// Convert JSON to Yjs document
const ydoc = TiptapTransformer.toYdoc(json, 'default');
```

### With Alert Extension Support

For documents containing Alert nodes, use the pre-configured transformer:

```typescript
import { TiptapTransformerWithAlert } from '@syncflow/transformer';

// Backend: Parse document with Alert nodes
const json = TiptapTransformerWithAlert.fromYdoc(ydoc, 'default');

// Backend: Convert to Yjs with Alert schema
const ydoc = TiptapTransformerWithAlert.toYdoc(json, 'default');
```

### Custom Extensions

Create a transformer with your own extension set:

```typescript
import { createTiptapTransformer } from '@syncflow/transformer';
import { StarterKit } from '@tiptap/starter-kit';
import { AlertSchema } from '@syncflow/transformer';

const transformer = createTiptapTransformer([
  StarterKit,
  AlertSchema,
  // ... your other extensions
]);

const json = transformer.fromYdoc(ydoc);
```

### Frontend vs Backend

```typescript
// Frontend (with React components)
import { Alert } from '@syncflow/alert';
import { createTiptapTransformer } from '@syncflow/transformer';

const frontendTransformer = createTiptapTransformer([
  StarterKit,
  Alert, // Full React component with NodeView
]);

// Backend (schema only, no React)
import { AlertSchema } from '@syncflow/transformer';
import { createTiptapTransformer } from '@syncflow/transformer';

const backendTransformer = createTiptapTransformer([
  StarterKit,
  AlertSchema, // Pure schema without React dependencies
]);
```

## API Reference

### `TiptapTransformer`

Default transformer with StarterKit extensions only.

### `TiptapTransformerWithAlert`

Pre-configured transformer with StarterKit + Alert extension support. Use this for documents containing Alert nodes.

### `createTiptapTransformer(extensions: Extensions): Tiptap`

Factory function to create a custom transformer with specific extensions.

**Parameters:**
- `extensions`: Array of Tiptap extensions to include

**Returns:** Configured Tiptap transformer instance

### `fromYdoc(document: Doc, fieldName?: string | string[]): Record<string, any>`

Convert Yjs document to ProseMirror/Tiptap JSON.

**Parameters:**
- `document`: Yjs document instance
- `fieldName`: Field name(s) to extract (optional, defaults to all fields)

**Returns:** JSON representation of the document

### `toYdoc(document: any, fieldName: string | string[] = 'default'): Doc`

Convert ProseMirror/Tiptap JSON to Yjs document.

**Parameters:**
- `document`: ProseMirror/Tiptap JSON document
- `fieldName`: Field name(s) to use (defaults to 'default')

**Returns:** Yjs document instance

## Example: Backend API

```typescript
import express from 'express';
import { TiptapTransformerWithAlert } from '@syncflow/transformer';
import { Doc } from 'yjs';

const app = express();

app.post('/api/documents', async (req, res) => {
  const { content } = req.body;
  
  // Convert JSON to Yjs binary for storage
  const ydoc = TiptapTransformerWithAlert.toYdoc(content);
  const binary = Buffer.from(Y.encodeStateAsUpdate(ydoc));
  
  // Store binary in database
  await db.documents.create({ content: binary });
  
  res.json({ success: true });
});

app.get('/api/documents/:id', async (req, res) => {
  // Retrieve binary from database
  const doc = await db.documents.findById(req.params.id);
  
  // Convert binary to Yjs and then to JSON
  const ydoc = new Doc();
  Y.applyUpdate(ydoc, doc.content);
  const json = TiptapTransformerWithAlert.fromYdoc(ydoc);
  
  res.json(json);
});
```

## License

MIT
