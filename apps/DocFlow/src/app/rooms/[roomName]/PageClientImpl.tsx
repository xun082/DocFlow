'use client';

import React from 'react';
import {
  RoomContext,
  ParticipantTile,
  useParticipantContext,
  GridLayout,
  useTracks,
  LayoutContextProvider,
} from '@livekit/components-react';
import {
  ExternalE2EEKeyProvider,
  RoomOptions,
  VideoCodec,
  VideoPresets,
  Room,
  DeviceUnsupportedError,
  RoomConnectOptions,
  RoomEvent,
  TrackPublishDefaults,
  VideoCaptureOptions,
  Track,
} from 'livekit-client';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

// import { DebugMode } from '../_components/Debug';
import { KeyboardShortcuts } from '../_components/KeyboardShortcuts';
import { RecordingIndicator } from '../_components/RecordingIndicator';
import { CustomControlBar } from '../_components/CustomControlBar';
import { ShareRoomButton } from '../_components/ShareRoomButton';

import { decodePassphrase } from '@/utils/rooms/client-utils';
import { LiveKitConnectionDetails } from '@/services/rooms/type';
import { useSetupE2EE } from '@/hooks/useSetupE2EE';
import { useLowCPUOptimizer } from '@/hooks/usePerfomanceOptimiser';

export function PageClientImpl(props: {
  roomName: string;
  region?: string;
  hq: boolean;
  codec: VideoCodec;
  encodedConnection?: string;
}) {
  const [connectionDetails, setConnectionDetails] = React.useState<
    LiveKitConnectionDetails | undefined
  >(undefined);
  const [error, setError] = React.useState<string | null>(null);
  const router = useRouter();

  React.useEffect(() => {
    console.log('🔍 房间页面加载，开始读取连接信息...');
    console.log('📦 URL 参数中的编码连接信息:', props.encodedConnection);

    if (!props.encodedConnection) {
      console.error('❌ URL 中没有找到连接信息参数');
      setError('未找到连接信息，请从首页重新创建或加入房间');
      setTimeout(() => router.push('/'), 3000);

      return;
    }

    try {
      // 解码 Base64 编码的连接信息
      const decodedStr = decodeURIComponent(atob(props.encodedConnection));
      console.log('🔓 解码后的字符串:', decodedStr);

      const connection: LiveKitConnectionDetails = JSON.parse(decodedStr);
      console.log('✅ 成功解析连接信息:', connection);

      // 验证连接信息
      if (!connection.token || !connection.url || !connection.roomName) {
        console.error('❌ 连接信息不完整:', {
          hasToken: !!connection.token,
          hasUrl: !!connection.url,
          hasRoomName: !!connection.roomName,
        });
        throw new Error('连接信息不完整');
      }

      console.log('✅ 连接信息验证通过，准备连接到 LiveKit...');
      setConnectionDetails(connection);
    } catch (err) {
      console.error('❌ 解析连接信息失败:', err);
      setError('连接信息无效，请重新尝试');
      setTimeout(() => router.push('/'), 3000);
    }
  }, [router, props.encodedConnection]);

  if (error) {
    return (
      <main
        data-lk-theme="default"
        style={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h2 style={{ color: '#ff4444', marginBottom: '1rem' }}>❌ {error}</h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.7)' }}>正在返回首页...</p>
        </div>
      </main>
    );
  }

  if (!connectionDetails) {
    return (
      <main
        data-lk-theme="default"
        style={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ marginBottom: '1rem' }}>
            ⏳
          </div>
          <p style={{ color: 'rgba(255, 255, 255, 0.7)' }}>正在连接...</p>
        </div>
      </main>
    );
  }

  return (
    <main data-lk-theme="default" style={{ height: '100%' }}>
      <VideoConferenceComponent
        connectionDetails={connectionDetails}
        options={{ codec: props.codec, hq: props.hq }}
      />
    </main>
  );
}

function CustomParticipantTile() {
  return (
    <ParticipantTile>
      <AvatarOverlay />
    </ParticipantTile>
  );
}

function AvatarOverlay() {
  const participant = useParticipantContext();
  const metadata = React.useMemo(() => {
    if (!participant?.metadata) return null;

    try {
      return JSON.parse(participant.metadata);
    } catch {
      return null;
    }
  }, [participant?.metadata]);

  if (!participant) return null;

  return (
    <>
      {metadata?.avatar && !participant.isCameraEnabled && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 1,
          }}
        >
          <img
            src={metadata.avatar}
            alt={participant.identity}
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid rgba(255, 255, 255, 0.5)',
            }}
          />
        </div>
      )}
    </>
  );
}

function VideoConferenceComponent(props: {
  connectionDetails: LiveKitConnectionDetails;
  options: {
    hq: boolean;
    codec: VideoCodec;
  };
}) {
  const keyProvider = new ExternalE2EEKeyProvider();
  const { worker, e2eePassphrase } = useSetupE2EE();
  const e2eeEnabled = !!(e2eePassphrase && worker);

  const [e2eeSetupComplete, setE2eeSetupComplete] = React.useState(false);

  const roomOptions = React.useMemo((): RoomOptions => {
    let videoCodec: VideoCodec | undefined = props.options.codec ? props.options.codec : 'vp9';

    if (e2eeEnabled && (videoCodec === 'av1' || videoCodec === 'vp9')) {
      videoCodec = undefined;
    }

    const videoCaptureDefaults: VideoCaptureOptions = {
      resolution: props.options.hq ? VideoPresets.h2160 : VideoPresets.h720,
    };
    const publishDefaults: TrackPublishDefaults = {
      dtx: false,
      videoSimulcastLayers: props.options.hq
        ? [VideoPresets.h1080, VideoPresets.h720]
        : [VideoPresets.h540, VideoPresets.h216],
      red: !e2eeEnabled,
      videoCodec,
    };

    return {
      videoCaptureDefaults: videoCaptureDefaults,
      publishDefaults: publishDefaults,
      audioCaptureDefaults: {},
      adaptiveStream: true,
      dynacast: true,
      e2ee: keyProvider && worker && e2eeEnabled ? { keyProvider, worker } : undefined,
      singlePeerConnection: true,
    };
  }, [props.options.hq, props.options.codec, e2eeEnabled, keyProvider, worker]);

  const room = React.useMemo(() => new Room(roomOptions), []);

  React.useEffect(() => {
    if (e2eeEnabled) {
      keyProvider
        .setKey(decodePassphrase(e2eePassphrase))
        .then(() => {
          room.setE2EEEnabled(true).catch((e) => {
            if (e instanceof DeviceUnsupportedError) {
              toast.error(
                `You're trying to join an encrypted meeting, but your browser does not support it. Please update it to the latest version and try again.`,
              );
              console.error(e);
            } else {
              throw e;
            }
          });
        })
        .then(() => setE2eeSetupComplete(true));
    } else {
      setE2eeSetupComplete(true);
    }
  }, [e2eeEnabled, room, e2eePassphrase]);

  const connectOptions = React.useMemo((): RoomConnectOptions => {
    return {
      autoSubscribe: true,
    };
  }, []);

  React.useEffect(() => {
    room.on(RoomEvent.Disconnected, handleOnLeave);
    room.on(RoomEvent.EncryptionError, handleEncryptionError);
    room.on(RoomEvent.MediaDevicesError, handleDeviceError);

    if (e2eeSetupComplete) {
      room
        .connect(props.connectionDetails.url, props.connectionDetails.token, connectOptions)
        .then(() => {
          console.log('✅ Connected to room successfully');
          console.log('👤 User:', props.connectionDetails.userName);
          console.log('🏠 Room:', props.connectionDetails.roomName);

          // 自动启用摄像头和麦克风
          room.localParticipant.setCameraEnabled(true).catch((error) => {
            console.warn('⚠️ Camera not available:', error.message);
          });

          room.localParticipant.setMicrophoneEnabled(true).catch((error) => {
            console.warn('⚠️ Microphone not available:', error.message);
          });

          // 设置用户头像
          if (props.connectionDetails.userAvatar) {
            console.log('🖼️ 设置用户头像:', props.connectionDetails.userAvatar);
            room.localParticipant.setMetadata(
              JSON.stringify({
                avatar: props.connectionDetails.userAvatar,
              }),
            );
          } else {
            console.log('🖼️ 设置用户头像:', props.connectionDetails.userAvatar);
            room.localParticipant.setMetadata(
              JSON.stringify({
                avatar: '/placeholder-image.jpg',
              }),
            );
          }
        })
        .catch((error) => {
          console.error('❌ Connection error:', error);
          handleError(error);
        });
    }

    return () => {
      room.off(RoomEvent.Disconnected, handleOnLeave);
      room.off(RoomEvent.EncryptionError, handleEncryptionError);
      room.off(RoomEvent.MediaDevicesError, handleDeviceError);
    };
  }, [e2eeSetupComplete, room, props.connectionDetails]);

  const lowPowerMode = useLowCPUOptimizer(room);

  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false, room },
  );

  const router = useRouter();
  const handleOnLeave = React.useCallback(() => router.push('/'), [router]);
  const handleError = React.useCallback((error: Error) => {
    console.error('Room error:', error);
    toast.error(`遇到错误: ${error.message}`);
  }, []);
  const handleDeviceError = React.useCallback((error: Error) => {
    console.warn('Device error (non-critical):', error);
    // 设备错误不弹窗，只在控制台记录
    // 用户仍然可以继续使用其他可用的设备
  }, []);
  const handleEncryptionError = React.useCallback((error: Error) => {
    console.error('Encryption error:', error);
    toast.error(`加密错误: ${error.message}`);
  }, []);

  React.useEffect(() => {
    if (lowPowerMode) {
      console.warn('Low power mode enabled');
    }
  }, [lowPowerMode]);

  const [showShareDialog, setShowShareDialog] = React.useState(false);

  return (
    <div className="lk-room-container">
      <RoomContext.Provider value={room}>
        <LayoutContextProvider>
          <KeyboardShortcuts />
          {/* 使用自定义布局以展示头像 */}
          <div className="lk-video-conference" data-lk-theme="default">
            <div className="lk-video-conference-inner">
              <GridLayout tracks={tracks}>
                <CustomParticipantTile />
              </GridLayout>
              <CustomControlBar
                roomName={props.connectionDetails.roomName}
                onShareClick={() => setShowShareDialog(true)}
              />
            </div>
            {/*<Chat />*/}
          </div>
          {/* <DebugMode /> */}
          <RecordingIndicator />
          {showShareDialog && (
            <ShareRoomButton
              roomName={props.connectionDetails.roomName}
              userName={props.connectionDetails.userName}
              onClose={() => setShowShareDialog(false)}
            />
          )}
        </LayoutContextProvider>
      </RoomContext.Provider>
    </div>
  );
}
