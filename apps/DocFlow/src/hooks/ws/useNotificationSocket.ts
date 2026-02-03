'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

import {
  ConnectedEvent,
  ConnectionState,
  OnlineUser,
  OnlineUsersResponse,
  PodcastEventResponse,
  PodcastEvent,
} from '@/types/ws';
import { getAuthToken } from '@/utils';

// 从cookie中获取token的工具函数
const getTokenFromStorage = (): string | null => {
  if (typeof window === 'undefined') return null;

  try {
    return getAuthToken();
  } catch (error) {
    console.error('获取 token 失败:', error);

    return null;
  }
};

// 验证token格式的函数
const isValidToken = (token: string | null): boolean => {
  if (!token || token.trim() === '') {
    return false;
  }

  try {
    const parts = token.split('.');

    return parts.length === 3;
  } catch {
    return false;
  }
};

export const useNotificationSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [server] = useState(process.env.NEXT_PUBLIC_NOTIFICATION_WEBSOCKET_URL);

  const [connectionState, setConnectionState] = useState<ConnectionState>({
    isConnected: false,
    error: null,
  });
  const [isConnecting, setIsConnecting] = useState(false);

  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [currentUser, setCurrentUser] = useState<{
    id: number;
    name: string;
  } | null>(null);

  // const [podcastEvent, setPodcastEvent] = useState<PodcastEvent | null>(null);

  const [podcastTasks, setPodcastTasks] = useState<Map<string, PodcastEvent>>(new Map());

  useEffect(() => {
    const storageToken = getTokenFromStorage();

    if (storageToken && isValidToken(storageToken)) {
      setToken(storageToken);
    }
  }, []);

  // 连接到WebSocket服务器
  const connect = useCallback(() => {
    if (!token) {
      setConnectionState({
        isConnected: false,
        error: '缺少认证令牌',
      });

      return;
    }

    if (socketRef.current?.connected) {
      return;
    }

    setIsConnecting(true);

    try {
      const socket = io(process.env.NEXT_PUBLIC_NOTIFICATION_WEBSOCKET_URL, {
        transports: ['websocket', 'polling'],
        timeout: 10000,
        forceNew: true,
        auth: {
          token,
        },
        query: {
          token,
        },
      });

      socketRef.current = socket;

      // 连接成功
      socket.on('connect', () => {
        setIsConnecting(false);
        setConnectionState({
          isConnected: true,
          error: null,
        });
      });

      // 连接失败
      socket.on('connect_error', (error: Error) => {
        console.error('Socket.IO 连接失败:', error);
        setIsConnecting(false);
        setConnectionState({
          isConnected: false,
          error: `连接失败: ${error.message || '未知错误'}`,
        });
      });

      // 断开连接
      socket.on('disconnect', (reason: string) => {
        setIsConnecting(false);
        setConnectionState({
          isConnected: false,
          error: reason !== 'io client disconnect' ? `连接断开: ${reason}` : null,
        });
        setOnlineUsers([]);
        setCurrentUser(null);
      });

      // 监听连接成功事件
      socket.on('connected', (data: ConnectedEvent) => {
        console.log('连接成功:', data);
        setCurrentUser({
          id: data.userId,
          name: data.userName,
        });
        // 连接成功后自动获取在线用户列表
        socket.emit('get_online_users');
      });

      // 监听用户状态变化
      socket.on('user_status_change', () => {
        socket.emit('get_online_users');
      });

      // 监听在线用户列表
      socket.on('online_users', (data: OnlineUsersResponse) => {
        setOnlineUsers(data.users);
      });

      // 监听播客 ai 事件
      socket.on('podcast_event', (data: PodcastEventResponse) => {
        setPodcastTasks((prev) => {
          const newTasks = new Map(prev);
          newTasks.set(data.data.jobId, data.data);

          return newTasks;
        });
      });

      // 监听错误
      socket.on('error', (error: any) => {
        setConnectionState((prev) => ({
          ...prev,
          error: error.message || '未知错误',
        }));
      });

      // 监听心跳响应
      socket.on('pong', (data: any) => {
        console.log('心跳正常:', data.timestamp);
      });

      // 监听认证结果
      socket.on('auth_result', (data: any) => {
        if (data.success) {
          setCurrentUser({
            id: data.user.id,
            name: data.user.name,
          });
          // 认证成功后获取在线用户列表
          socket.emit('get_online_users');
        } else {
          setConnectionState((prev) => ({
            ...prev,
            error: data.message || '认证失败',
          }));
        }
      });
    } catch (error) {
      setIsConnecting(false);
      setConnectionState({
        isConnected: false,
        error: error instanceof Error ? error.message : '连接创建失败',
      });
    }
  }, [server, token]);

  // 断开连接
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    setIsConnecting(false);
    setConnectionState({
      isConnected: false,
      error: null,
    });
    setOnlineUsers([]);
    setCurrentUser(null);
  }, []);

  // 发送心跳
  const sendPing = useCallback(() => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('ping');
    }
  }, []);

  // 获取在线用户
  const getOnlineUsers = useCallback(() => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('get_online_users');
    }
  }, []);

  // 手动连接（用于重连）
  const manualConnect = useCallback(() => {
    const storageToken = getTokenFromStorage();

    if (storageToken && isValidToken(storageToken)) {
      setToken(storageToken);
      // 连接会在下面的 useEffect 中自动处理
    } else {
      connect();
    }
  }, [connect]);

  // 移除已完成的任务
  const removeCompletedTask = useCallback((jobId: string) => {
    setPodcastTasks((prev) => {
      const newTasks = new Map(prev);
      newTasks.delete(jobId);

      return newTasks;
    });
  }, []);

  // 清理所有已完成的任务
  const clearCompletedTasks = useCallback(() => {
    setPodcastTasks((prev) => {
      const newTasks = new Map();

      for (const [jobId, task] of prev.entries()) {
        if (task.status !== 'completed') {
          newTasks.set(jobId, task);
        }
      }

      return newTasks;
    });
  }, []);

  // 重置连接
  const reset = useCallback(() => {
    disconnect();
    setToken(null);
    setIsConnecting(false);
  }, [disconnect]);

  // 初始化连接
  useEffect(() => {
    if (token) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [token, connect, disconnect]);

  return {
    // 连接状态
    isConnected: connectionState.isConnected,
    isConnecting,
    error: connectionState.error,

    // 用户数据
    currentUser,
    onlineUsers,

    // 播客 ai 事件
    podcastTasks,

    // 服务器和认证信息
    serverUrl: server,
    token,

    // 操作方法
    connect: manualConnect,
    disconnect,
    sendPing,
    getOnlineUsers,
    reset,
    removeCompletedTask,
    clearCompletedTasks,

    // 工具函数
    isValidToken: () => isValidToken(token),

    // Socket 实例
    socket: socketRef.current,
  };
};
