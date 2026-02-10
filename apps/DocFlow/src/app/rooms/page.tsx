'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { Sparkles, Video, Users, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

import styles from './styles/Home.module.css';

import { roomsApi } from '@/services/rooms';
import type { LiveKitConnectionDetails } from '@/services/rooms/type';

/**
 * 验证 LiveKit 连接信息是否完整
 */
const isValidConnection = (
  connection: LiveKitConnectionDetails | null | undefined,
): connection is LiveKitConnectionDetails => {
  return !!(connection?.token && connection?.url && connection?.roomName);
};

/**
 * 编码连接信息为 URL 安全的 Base64 字符串
 */
const encodeConnection = (connection: LiveKitConnectionDetails): string => {
  return btoa(encodeURIComponent(JSON.stringify(connection)));
};

function RoomsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [roomId, setRoomId] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  // 自动填充分享的房间号
  useEffect(() => {
    const joinRoomId = searchParams.get('join');

    if (joinRoomId && /^\d{12}$/.test(joinRoomId)) {
      console.log('🔗 检测到分享链接，自动填充房间号:', joinRoomId);
      setRoomId(joinRoomId);
    }
  }, [searchParams]);

  /**
   * 导航到房间页面
   */
  const navigateToRoom = useCallback(
    (connection: LiveKitConnectionDetails) => {
      const encodedConnection = encodeConnection(connection);
      router.push(`/rooms/${connection.roomName}?c=${encodedConnection}`);
    },
    [router],
  );

  const handleQuickCreate = async () => {
    setIsCreating(true);

    try {
      console.log('🚀 正在创建房间...');

      const result = await roomsApi.quickCreateRoom({
        maxParticipants: 20,
        emptyTimeout: 300,
      });

      // 处理请求错误
      if (result.error || !result.data) {
        throw new Error(result.error || '请求失败');
      }

      const connection = result.data.data;
      console.log('✅ 房间创建成功:', connection);

      if (!isValidConnection(connection)) {
        throw new Error('服务器返回的连接信息不完整');
      }

      console.log('✅ 准备跳转到房间:', connection.roomName);
      navigateToRoom(connection);
    } catch (error) {
      console.error('❌ 创建房间失败:', error);

      const message = error instanceof Error ? error.message : '未知错误';
      toast.error(`创建房间失败: ${message}\n请确保您已登录`);
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async () => {
    const trimmedRoomId = roomId.trim();

    if (!trimmedRoomId) {
      toast.error('请输入房间号');

      return;
    }

    // 验证房间ID格式（12位纯数字）
    if (!/^\d{12}$/.test(trimmedRoomId)) {
      toast.error('房间号必须是12位纯数字');

      return;
    }

    setIsJoining(true);

    try {
      console.log('📞 正在加入房间:', trimmedRoomId);

      const result = await roomsApi.joinRoom(trimmedRoomId);

      // 处理请求错误
      if (result.error || !result.data) {
        throw new Error(result.error || '请求失败');
      }

      const connection = result.data.data;
      console.log('✅ 成功获取房间信息:', connection);

      if (!isValidConnection(connection)) {
        throw new Error('服务器返回的连接信息不完整');
      }

      console.log('✅ 准备跳转到房间:', connection.roomName);
      navigateToRoom(connection);
    } catch (error) {
      console.error('❌ 加入房间失败:', error);

      const message = error instanceof Error ? error.message : '未知错误';
      toast.error(`加入房间失败: ${message}\n请确保您已登录且房间号正确`);
      setIsJoining(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <main className={styles.main}>
        {/* 背景装饰 */}
        <div className={styles.backgroundDecor}>
          <div className={styles.gradientOrb1} />
          <div className={styles.gradientOrb2} />
        </div>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.badge}>
            <Sparkles className={styles.badgeIcon} />
            <span>实时视频协作</span>
          </div>

          <h1 className={styles.title}>
            <span className={styles.titleGradient}>FlowSync</span>
            <span className={styles.titleAccent}> Video</span>
          </h1>

          <p className={styles.subtitle}>
            基于 LiveKit 构建的实时视频协作平台，支持多人高清视频会议与屏幕共享
          </p>
        </div>

        {/* Main Card */}
        <div className={styles.cardContainer}>
          <div className={styles.card}>
            {/* 快速创建房间 */}
            <button
              className={`${styles.primaryButton} ${isCreating ? styles.buttonLoading : ''}`}
              onClick={handleQuickCreate}
              disabled={isCreating}
            >
              <Video className={styles.buttonIcon} />
              <span>{isCreating ? '正在创建房间...' : '快速创建房间'}</span>
              {!isCreating && <ArrowRight className={styles.buttonArrow} />}
            </button>

            {/* 分隔线 */}
            <div className={styles.divider}>
              <span className={styles.dividerText}>或者加入现有房间</span>
            </div>

            {/* 加入房间 */}
            <div className={styles.joinSection}>
              <label htmlFor="roomId" className={styles.inputLabel}>
                <Users className={styles.labelIcon} />
                <span>输入房间号</span>
                {searchParams.get('join') && (
                  <span className={styles.autoFillBadge}>已自动填充</span>
                )}
              </label>

              <div className={styles.inputWrapper}>
                <input
                  id="roomId"
                  type="text"
                  placeholder="请输入12位房间号"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value.replace(/\D/g, '').slice(0, 12))}
                  onKeyPress={(e) => e.key === 'Enter' && handleJoinRoom()}
                  maxLength={12}
                  className={`${styles.input} ${searchParams.get('join') ? styles.inputHighlight : ''}`}
                />
                {roomId.length > 0 && (
                  <span className={styles.inputCounter}>{roomId.length}/12</span>
                )}
              </div>

              <button
                className={`${styles.secondaryButton} ${isJoining || roomId.length !== 12 ? styles.buttonDisabled : ''}`}
                onClick={handleJoinRoom}
                disabled={isJoining || roomId.length !== 12}
              >
                <Users className={styles.buttonIcon} />
                <span>{isJoining ? '正在加入...' : '加入房间'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className={styles.features}>
          <div className={styles.featureItem}>
            <div className={styles.featureIcon}>🔒</div>
            <span>端到端加密</span>
          </div>
          <div className={styles.featureItem}>
            <div className={styles.featureIcon}>🎥</div>
            <span>高清视频</span>
          </div>
          <div className={styles.featureItem}>
            <div className={styles.featureIcon}>💬</div>
            <span>实时聊天</span>
          </div>
          <div className={styles.featureItem}>
            <div className={styles.featureIcon}>�️</div>
            <span>屏幕共享</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>
          Powered by{' '}
          <a href="https://livekit.io" target="_blank" rel="noopener noreferrer">
            LiveKit
          </a>{' '}
          · Built with ❤️ by DocFlow Team
        </p>
      </footer>
    </div>
  );
}

function RoomsPageFallback() {
  return (
    <div className={styles.pageWrapper}>
      <main className={styles.main}>
        <div className={styles.backgroundDecor}>
          <div className={styles.gradientOrb1} />
          <div className={styles.gradientOrb2} />
        </div>
        <div className={styles.header}>
          <div className={styles.badge}>
            <Sparkles className={styles.badgeIcon} />
            <span>实时视频协作</span>
          </div>
          <h1 className={styles.title}>
            <span className={styles.titleGradient}>FlowSync</span>
            <span className={styles.titleAccent}> Video</span>
          </h1>
          <p className={styles.subtitle}>
            基于 LiveKit 构建的实时视频协作平台，支持多人高清视频会议与屏幕共享
          </p>
        </div>
        <div className={styles.cardContainer}>
          <div className={styles.card}>
            <div className={styles.primaryButton} aria-hidden>
              <Video className={styles.buttonIcon} />
              <span>加载中...</span>
            </div>
          </div>
        </div>
      </main>
      <footer className={styles.footer}>
        <p>
          Powered by{' '}
          <a href="https://livekit.io" target="_blank" rel="noopener noreferrer">
            LiveKit
          </a>{' '}
          · Built with ❤️ by DocFlow Team
        </p>
      </footer>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<RoomsPageFallback />}>
      <RoomsPageContent />
    </Suspense>
  );
}
