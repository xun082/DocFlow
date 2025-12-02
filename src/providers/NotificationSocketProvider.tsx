'use client';

import { createContext, useContext, ReactNode, useEffect } from 'react';
import { Socket } from 'socket.io-client';

import { useNotificationSocket } from '@/hooks/ws/useNotificationSocket';
import { OnlineUser, PodcastEvent } from '@/types/ws';

// 定义 Context 类型
interface NotificationSocketContextType {
  // 连接状态
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;

  // 用户数据
  currentUser: { id: number; name: string } | null;
  onlineUsers: OnlineUser[];

  // 播客 ai 事件
  podcastTasks: Map<string, PodcastEvent>;

  // 服务器和认证信息
  serverUrl?: string;
  token: string | null;

  // 操作方法
  connect: () => void;
  disconnect: () => void;
  sendPing: () => void;
  getOnlineUsers: () => void;
  reset: () => void;
  removeCompletedTask: (jobId: string) => void;
  clearCompletedTasks: () => void;

  // 工具函数
  isValidToken: () => boolean;

  // Socket 实例
  socket: Socket | null;
}

// 创建 Context
const NotificationSocketContext = createContext<NotificationSocketContextType | undefined>(
  undefined,
);

// Provider 组件
interface NotificationSocketProviderProps {
  children: ReactNode;
}

export function NotificationSocketProvider({ children }: NotificationSocketProviderProps) {
  const socketState = useNotificationSocket();

  // 自动连接 WebSocket
  useEffect(() => {
    if (!socketState.isConnected && !socketState.isConnecting) {
      socketState.connect();
    }
  }, [socketState.isConnected, socketState.isConnecting, socketState.connect]);

  return (
    <NotificationSocketContext.Provider value={socketState}>
      {children}
    </NotificationSocketContext.Provider>
  );
}

// 自定义 Hook 用于消费 Context
export function useNotificationSocketContext() {
  const context = useContext(NotificationSocketContext);

  if (context === undefined) {
    throw new Error(
      'useNotificationSocketContext must be used within a NotificationSocketProvider',
    );
  }

  return context;
}
