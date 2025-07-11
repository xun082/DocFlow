import { useEffect, useCallback } from 'react';

/**
 * 监听 Excalidraw SVG 导出事件（跨标签页，使用 postmessage）
 * @param onExport 回调，参数为 svg 字符串和文件名
 */
export function useExcalidrawExportListener(onExport: (svg: string, fileName: string) => void) {
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      // 打印所有收到的消息进行调试
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

export function useExcalidrawMessage(options: { origin?: string } = {}) {
  // 发送 SVG 导出消息
  const sendExportMessage = useCallback(
    (svg: string, fileName: string) => {
      window.opener?.postMessage(
        {
          type: 'excalidraw-export-svg',
          data: { svg, fileName },
        },
        options.origin || '*', // 如果 origin 是 A 页面的地址，则更安全
      );
    },
    [options.origin],
  );

  return { sendExportMessage };
}
