'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

import styles from './styles/Home.module.css';

import meetApi from '@/services/meet';

export default function Page() {
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

  const handleQuickCreate = async () => {
    setIsCreating(true);

    try {
      console.log('🚀 正在创建房间...');

      const result = await meetApi.quickCreateRoom({
        maxParticipants: 20,
        emptyTimeout: 300,
      });

      // 检查请求是否成功
      if (result.error || !result.data) {
        throw new Error(result.error || '创建房间失败');
      }

      const connection = result.data.data;

      console.log('✅ 房间创建成功:', connection);

      // 验证连接信息
      if (!connection || !connection.token || !connection.url || !connection.roomName) {
        throw new Error('服务器返回的连接信息不完整');
      }

      // 使用 Base64 编码连接信息（避免 URL 特殊字符问题）
      const connectionStr = JSON.stringify(connection);
      const encodedConnection = btoa(encodeURIComponent(connectionStr));

      console.log('✅ 准备跳转到房间:', connection.roomName);

      // 通过 URL state 传递连接信息
      router.push(`/rooms/${connection.roomName}?c=${encodedConnection}`);
    } catch (error: any) {
      console.error('❌ 创建房间失败:', error);
      toast.error(`创建房间失败: ${error.message}`);
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!roomId.trim()) {
      toast.error('请输入房间号');

      return;
    }

    // 验证房间ID格式（12位纯数字）
    if (!/^\d{12}$/.test(roomId.trim())) {
      toast.error('房间号必须是12位纯数字');

      return;
    }

    setIsJoining(true);

    try {
      console.log('📞 正在加入房间:', roomId.trim());

      const result = await meetApi.joinRoom(roomId.trim());

      // 检查请求是否成功
      if (result.error || !result.data) {
        throw new Error(result.error || '加入房间失败');
      }

      const connection = result.data.data;

      console.log('✅ 成功获取房间信息:', connection);

      // 验证连接信息
      if (!connection || !connection.token || !connection.url || !connection.roomName) {
        throw new Error('服务器返回的连接信息不完整');
      }

      // 使用 Base64 编码连接信息
      const connectionStr = JSON.stringify(connection);
      const encodedConnection = btoa(encodeURIComponent(connectionStr));

      console.log('✅ 准备跳转到房间:', connection.roomName);

      // 通过 URL state 传递连接信息
      router.push(`/rooms/${connection.roomName}?c=${encodedConnection}`);
    } catch (error: any) {
      console.error('❌ 加入房间失败:', error);
      toast.error(`加入房间失败: ${error.message}`);
      setIsJoining(false);
    }
  };

  return (
    <>
      <main className={styles.main} data-lk-theme="default">
        <div className="header">
          <h1 style={{ fontSize: '3rem', fontWeight: '700', margin: '0 0 1rem 0' }}>
            FlowSync Video
          </h1>
          <p style={{ fontSize: '1.2rem', color: 'rgba(255, 255, 255, 0.7)', margin: 0 }}>
            Real-time video collaboration powered by LiveKit
          </p>
        </div>

        <div className={styles.tabContainer}>
          <div className={styles.tabContent} style={{ maxWidth: '500px' }}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                marginBottom: '1.5rem',
              }}
            >
              <button
                className="lk-button"
                onClick={handleQuickCreate}
                disabled={isCreating}
                style={{
                  width: '100%',
                  padding: '1.25rem',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  background: isCreating
                    ? 'rgba(102, 126, 234, 0.5)'
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: isCreating ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  opacity: isCreating ? 0.7 : 1,
                }}
              >
                {isCreating ? '正在创建房间...' : '🚀 快速创建房间'}
              </button>
            </div>

            <div
              style={{
                position: 'relative',
                textAlign: 'center',
                marginBottom: '1.5rem',
              }}
            >
              <hr style={{ border: 'none', borderTop: '1px solid rgba(255, 255, 255, 0.15)' }} />
              <span
                style={{
                  position: 'absolute',
                  top: '-0.6rem',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: '#0a0a0a',
                  padding: '0 1rem',
                  fontSize: '0.9rem',
                  color: 'rgba(255, 255, 255, 0.5)',
                }}
              >
                OR
              </span>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label
                htmlFor="roomId"
                style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}
              >
                加入现有房间
                {searchParams.get('join') && (
                  <span
                    style={{
                      marginLeft: '0.5rem',
                      fontSize: '0.8rem',
                      color: '#4ade80',
                      fontWeight: 'normal',
                    }}
                  >
                    🔗 已自动填充分享的房间号
                  </span>
                )}
              </label>
              <input
                id="roomId"
                type="text"
                placeholder="请输入12位房间号"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value.replace(/\D/g, '').slice(0, 12))}
                onKeyPress={(e) => e.key === 'Enter' && handleJoinRoom()}
                maxLength={12}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  fontSize: '1rem',
                  borderRadius: '8px',
                  border: searchParams.get('join')
                    ? '2px solid #4ade80'
                    : '1px solid rgba(255, 255, 255, 0.2)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: 'white',
                  letterSpacing: '0.1em',
                }}
              />
              <div
                style={{
                  marginTop: '0.5rem',
                  fontSize: '0.85rem',
                  color: 'rgba(255, 255, 255, 0.5)',
                }}
              >
                {roomId.length > 0 && `${roomId.length}/12`}
              </div>
            </div>

            <button
              className="lk-button"
              onClick={handleJoinRoom}
              disabled={isJoining || roomId.length !== 12}
              style={{
                width: '100%',
                padding: '1rem',
                fontSize: '1rem',
                fontWeight: '600',
                background:
                  isJoining || roomId.length !== 12
                    ? 'rgba(255, 255, 255, 0.05)'
                    : 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                cursor: isJoining || roomId.length !== 12 ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                opacity: isJoining || roomId.length !== 12 ? 0.5 : 1,
              }}
            >
              {isJoining ? '正在加入...' : '📞 加入房间'}
            </button>
          </div>
        </div>
      </main>

      {/* <footer
        data-lk-theme="default"
        style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255, 255, 255, 0.5)' }}
      >
        Powered by{' '}
        <a
          href="https://livekit.io"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#667eea' }}
        >
          LiveKit
        </a>{' '}
        and NestJS
      </footer> */}
    </>
  );
}
