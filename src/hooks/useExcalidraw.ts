import { useEffect, useCallback } from 'react';

type ExcalidrawExportPayload = {
  svg: string;
  fileName: string;
};

type ExcalidrawMessageOptions = {
  onExport?: (svg: string, fileName: string) => void;
  origin?: string; // 新增：只允许指定来源的消息
};

/**
 * 监听 Excalidraw SVG 导出事件
 * @param onExport 回调，参数为 svg 字符串和文件名
 */
export function useExcalidrawExportListener(onExport: (svg: string, fileName: string) => void) {
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data?.type === 'excalidraw-export-svg') {
        const { svg, fileName } = event.data.data;
        onExport(svg, fileName);
      }
    };

    window.addEventListener('message', handler);

    return () => {
      window.removeEventListener('message', handler);
    };
  }, [onExport]);
}

export function useExcalidrawMessage(options: ExcalidrawMessageOptions = {}) {
  // 发送 SVG 导出消息
  const sendExportMessage = useCallback(
    (svg: string, fileName: string) => {
      window.postMessage(
        {
          type: 'excalidraw-export-svg',
          data: { svg, fileName },
        },
        options.origin || '*',
      );
    },
    [options.origin],
  );

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      // 如果指定了 origin，则只处理来自该 origin 的消息
      if (options.origin && event.origin !== options.origin) return;

      if (event.data?.type === 'excalidraw-export-svg' && options.onExport) {
        const { svg, fileName } = event.data.data as ExcalidrawExportPayload;
        options.onExport(svg, fileName);
      }
    };

    window.addEventListener('message', handler);

    return () => window.removeEventListener('message', handler);
  }, [options]);

  return { sendExportMessage };
}
