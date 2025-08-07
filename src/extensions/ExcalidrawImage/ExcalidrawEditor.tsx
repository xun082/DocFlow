'use client';

import dynamicImport from 'next/dynamic';

import '@excalidraw/excalidraw/index.css';
import { Surface } from '@/components/ui/Surface';

// 动态导入 Excalidraw，避免 SSR 问题
const Excalidraw = dynamicImport(async () => (await import('@excalidraw/excalidraw')).Excalidraw, {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">正在加载 Excalidraw...</p>
      </div>
    </div>
  ),
});

interface ExcalidrawEditorProps {
  initialData?: any;
  width?: number;
  height?: number;
}

const ExcalidrawEditor: React.FC<ExcalidrawEditorProps> = ({
  initialData,
  width = 800,
  height = 600,
}) => {
  return (
    <Surface className="excalidraw-editor-container p-1" style={{ width, height }}>
      {/* Excalidraw 画板 */}
      <div className="h-full">
        <Excalidraw
          initialData={initialData}
          theme="light"
          UIOptions={{
            canvasActions: {
              loadScene: false,
              saveToActiveFile: false,
              export: false,
            },
          }}
        />
      </div>
    </Surface>
  );
};

export default ExcalidrawEditor;
