import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'Transformer',
      formats: ['es', 'cjs'],
      fileName: (format) => `transformer.${format === 'es' ? 'esm.js' : 'cjs'}`,
    },
    rollupOptions: {
      external: [
        'yjs',
        'y-prosemirror',
        '@tiptap/core',
        '@tiptap/pm',
        '@tiptap/pm/model',
        '@tiptap/starter-kit',
        '@syncflow/alert',
      ],
      output: {
        exports: 'named',
      },
    },
    sourcemap: true,
    outDir: 'dist',
    emptyOutDir: true,
  },
  plugins: [
    dts({
      insertTypesEntry: true,
      rollupTypes: true,
    }),
  ],
});
