'use client';

import React from 'react';

interface ShareRoomButtonProps {
  roomName: string;
  userName?: string;
  onClose?: () => void;
}

export function ShareRoomButton({ roomName, onClose }: ShareRoomButtonProps) {
  const [copied] = React.useState(false);

  const shareUrl =
    typeof window !== 'undefined' ? `${window.location.origin}?join=${roomName}` : '';

  // 快速复制房间号（点击按钮时）
  // const handleQuickCopy = () => {
  //   navigator.clipboard.writeText(roomName).then(() => {
  //     setCopied(true);
  //     setTimeout(() => setCopied(false), 2000);
  //   });
  // };

  const handleCopyRoomId = () => {
    navigator.clipboard.writeText(roomName).then(() => {
      alert('✅ 房间号已复制：' + roomName);
    });
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      alert('✅ 分享链接已复制！');
    });
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#1a1a1a',
          borderRadius: '16px',
          padding: '2rem',
          maxWidth: '500px',
          width: '90%',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
          }}
        >
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>分享会议</h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'white',
              fontSize: '1.5rem',
              cursor: 'pointer',
              padding: '0.5rem',
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label
            style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontSize: '0.9rem',
              color: 'rgba(255, 255, 255, 0.7)',
            }}
          >
            房间号码
          </label>
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              alignItems: 'center',
            }}
          >
            <input
              type="text"
              value={roomName}
              readOnly
              style={{
                flex: 1,
                padding: '0.75rem 1rem',
                fontSize: '1.2rem',
                letterSpacing: '0.1em',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                background: 'rgba(255, 255, 255, 0.05)',
                color: 'white',
                textAlign: 'center',
                fontWeight: '600',
              }}
            />
            <button
              onClick={handleCopyRoomId}
              style={{
                padding: '0.75rem 1rem',
                fontSize: '1rem',
                background: copied
                  ? 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)'
                  : 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                cursor: 'pointer',
                minWidth: '80px',
              }}
            >
              {copied ? '✓ 已复制' : '复制'}
            </button>
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label
            style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontSize: '0.9rem',
              color: 'rgba(255, 255, 255, 0.7)',
            }}
          >
            分享链接
          </label>
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              alignItems: 'center',
            }}
          >
            <input
              type="text"
              value={shareUrl}
              readOnly
              style={{
                flex: 1,
                padding: '0.75rem 1rem',
                fontSize: '0.9rem',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                background: 'rgba(255, 255, 255, 0.05)',
                color: 'rgba(255, 255, 255, 0.7)',
              }}
            />
            <button
              onClick={copyShareLink}
              style={{
                padding: '0.75rem 1rem',
                fontSize: '1rem',
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                cursor: 'pointer',
                minWidth: '80px',
              }}
            >
              复制
            </button>
          </div>
        </div>

        <div
          style={{
            padding: '1rem',
            background: 'rgba(102, 126, 234, 0.1)',
            borderRadius: '8px',
            border: '1px solid rgba(102, 126, 234, 0.3)',
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: '0.9rem',
              color: 'rgba(255, 255, 255, 0.8)',
              lineHeight: '1.5',
            }}
          >
            💡 <strong>分享方式：</strong>
            <br />• 发送房间号给好友，让他们在首页输入加入
            <br />• 或直接发送分享链接，点击后自动填充房间号
          </p>
        </div>
      </div>
    </div>
  );
}
