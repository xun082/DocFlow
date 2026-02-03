import { memo, useMemo, type RefObject } from 'react';
import { useReactFlow } from 'reactflow';
import { HocuspocusProvider } from '@hocuspocus/provider';

import Cursor from './cursor';

interface AwarenessState {
  cursor: { x: number; y: number } | null;
  color: string;
  clientId: number;
  name?: string;
}

interface CursorsLayerProps {
  cursors: Map<number, AwarenessState>;
  provider: RefObject<HocuspocusProvider | undefined>;
  isConnected: boolean;
}

const CursorsLayer = memo(({ cursors, provider, isConnected }: CursorsLayerProps) => {
  const { flowToScreenPosition } = useReactFlow();

  const renderedCursors = useMemo(() => {
    if (!isConnected) return null;

    return Array.from(cursors.entries()).map(([clientId, state]) => {
      // 不渲染自己的光标
      if (clientId === provider.current?.awareness?.clientID) {
        return null;
      }

      // 确保有光标位置数据
      if (!state || !state.cursor) {
        return null;
      }

      // 将 Flow 坐标转换为屏幕坐标
      const screenPos = flowToScreenPosition(state.cursor);

      return (
        <Cursor
          key={clientId}
          x={screenPos.x}
          y={screenPos.y}
          color={state.color}
          name={state.name}
        />
      );
    });
  }, [cursors, isConnected, provider, flowToScreenPosition]);

  return <>{renderedCursors}</>;
});

CursorsLayer.displayName = 'CursorsLayer';

export default CursorsLayer;
