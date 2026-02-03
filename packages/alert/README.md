# @syncflow/alert

Alert extension for Tiptap editor with multiple alert types.

## Installation

```bash
pnpm add @syncflow/alert
```

## Usage

```typescript
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Alert } from '@syncflow/alert';
import '@syncflow/alert/styles';

const editor = useEditor({
  extensions: [
    StarterKit,
    Alert,
  ],
});
```

## Alert Types

- `info` - Information alerts (blue)
- `warning` - Warning alerts (yellow)
- `danger` - Danger/error alerts (red)
- `success` - Success alerts (green)
- `note` - Note alerts (purple)
- `tip` - Tip alerts (cyan)

## Commands

```typescript
// Insert a new alert
editor.commands.setAlert('info');

// Toggle alert wrapping
editor.commands.toggleAlert('warning');

// Remove alert
editor.commands.unsetAlert();
```

## Keyboard Shortcuts

- `Mod-Shift-i` - Insert info alert
- `Mod-Shift-w` - Insert warning alert
- `Mod-Shift-d` - Insert danger alert
- `Mod-Shift-s` - Insert success alert

## Styling

Import the CSS file to get the default styles:

```typescript
import '@syncflow/alert/styles';
```

The component uses Tailwind CSS classes and supports dark mode.

## License

MIT
