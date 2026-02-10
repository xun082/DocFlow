import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'Alert',
      formats: ['es', 'cjs'],
      fileName: (format) => `alert.${format === 'es' ? 'esm.js' : 'cjs'}`,
    },
    rollupOptions: {
      external: ['react', 'react/jsx-runtime', '@tiptap/core', '@tiptap/react', 'lucide-react'],
      output: {
        exports: 'named',
        globals: {
          react: 'React',
          'react/jsx-runtime': 'jsxRuntime',
        },
      },
    },
    sourcemap: true,
    outDir: 'dist',
    emptyOutDir: true,
  },
  plugins: [
    dts({
      entryRoot: 'src',
      outDir: 'dist',
      insertTypesEntry: true,
      rollupTypes: false, // 禁用 rollupTypes 避免 API Extractor 路径问题
      staticImport: true,
    }),
  ],
});
