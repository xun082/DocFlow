import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'Bilibili',
      formats: ['es', 'cjs'],
      fileName: (format) => `bilibili.${format === 'es' ? 'esm.js' : 'cjs'}`,
    },
    rollupOptions: {
      external: [
        'react',
        'react/jsx-runtime',
        'react-dom/client',
        '@tiptap/core',
        '@tiptap/react',
        'lucide-react',
      ],
      output: {
        exports: 'named',
        globals: {
          react: 'React',
          'react/jsx-runtime': 'jsxRuntime',
          'react-dom/client': 'ReactDomClient',
        },
        assetFileNames: 'bilibili.css',
      },
    },
    sourcemap: true,
    outDir: 'dist',
    emptyOutDir: true,
    cssCodeSplit: false,
  },
  plugins: [
    dts({
      entryRoot: 'src',
      outDir: 'dist',
      insertTypesEntry: true,
      rollupTypes: true,
    }),
  ],
});
