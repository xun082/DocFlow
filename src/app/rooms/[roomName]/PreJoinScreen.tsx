'use client';

import React, { useState } from 'react';
import { LocalUserChoices } from '@livekit/components-react';

interface PreJoinScreenProps {
  roomName: string;
  onSubmit: (choices: LocalUserChoices) => void;
  onError?: (error: any) => void;
  defaults?: LocalUserChoices;
}

export function PreJoinScreen({ roomName, onSubmit, onError, defaults }: PreJoinScreenProps) {
  const [username, setUsername] = useState(defaults?.username || '');
  const [videoEnabled, setVideoEnabled] = useState(defaults?.videoEnabled ?? true);
  const [audioEnabled, setAudioEnabled] = useState(defaults?.audioEnabled ?? true);
  const [isJoining, setIsJoining] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      alert('Please enter your name');

      return;
    }

    setIsJoining(true);

    try {
      onSubmit({
        username: username.trim(),
        videoEnabled,
        audioEnabled,
        videoDeviceId: '',
        audioDeviceId: '',
      });
    } catch (error) {
      console.error('Join error:', error);

      if (onError) {
        onError(error);
      }

      setIsJoining(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '2rem',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.98)',
          borderRadius: '20px',
          padding: '3rem',
          maxWidth: '480px',
          width: '100%',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        }}
      >
        <h1
          style={{
            fontSize: '2rem',
            fontWeight: '700',
            color: '#1a1a1a',
            marginBottom: '0.5rem',
            textAlign: 'center',
          }}
        >
          Join Room
        </h1>

        <p
          style={{
            color: '#666',
            textAlign: 'center',
            marginBottom: '1rem',
            fontSize: '0.95rem',
          }}
        >
          Room: <strong>{roomName}</strong>
        </p>

        <p
          style={{
            color: '#888',
            textAlign: 'center',
            marginBottom: '1.5rem',
            fontSize: '0.85rem',
            lineHeight: '1.4',
          }}
        >
          💡 提示：即使没有摄像头也可以加入，只用麦克风聊天
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label
              htmlFor="username"
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: '#374151',
                fontSize: '0.875rem',
                fontWeight: '600',
              }}
            >
              Your Name *
            </label>
            <input
              id="username"
              type="text"
              placeholder="Enter your name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isJoining}
              autoFocus
              style={{
                width: '100%',
                padding: '0.875rem 1rem',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '1rem',
                transition: 'border-color 0.2s',
                outline: 'none',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#667eea')}
              onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
              required
            />
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              marginBottom: '2rem',
            }}
          >
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                cursor: 'pointer',
                padding: '0.75rem',
                background: videoEnabled ? 'rgba(102, 126, 234, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                borderRadius: '12px',
                transition: 'background 0.2s',
              }}
            >
              <input
                type="checkbox"
                checked={videoEnabled}
                onChange={(e) => setVideoEnabled(e.target.checked)}
                disabled={isJoining}
                style={{
                  width: '20px',
                  height: '20px',
                  cursor: 'pointer',
                }}
              />
              <span
                style={{
                  fontSize: '0.95rem',
                  fontWeight: '500',
                  color: '#1a1a1a',
                }}
              >
                📹 Enable Camera
              </span>
            </label>

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                cursor: 'pointer',
                padding: '0.75rem',
                background: audioEnabled ? 'rgba(102, 126, 234, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                borderRadius: '12px',
                transition: 'background 0.2s',
              }}
            >
              <input
                type="checkbox"
                checked={audioEnabled}
                onChange={(e) => setAudioEnabled(e.target.checked)}
                disabled={isJoining}
                style={{
                  width: '20px',
                  height: '20px',
                  cursor: 'pointer',
                }}
              />
              <span
                style={{
                  fontSize: '0.95rem',
                  fontWeight: '500',
                  color: '#1a1a1a',
                }}
              >
                🎤 Enable Microphone
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isJoining || !username.trim()}
            style={{
              width: '100%',
              padding: '1rem',
              background:
                isJoining || !username.trim()
                  ? '#e5e7eb'
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: isJoining || !username.trim() ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              boxShadow:
                isJoining || !username.trim() ? 'none' : '0 4px 15px rgba(102, 126, 234, 0.4)',
            }}
          >
            {isJoining ? 'Joining...' : 'Join Room'}
          </button>
        </form>
      </div>
    </div>
  );
}
