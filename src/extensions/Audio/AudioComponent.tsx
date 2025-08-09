'use client';

import React, { useEffect, useRef, useState } from 'react';
import { NodeViewWrapper, type ReactNodeViewProps } from '@tiptap/react';
import { Link } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/utils/utils';
import 'plyr/dist/plyr.css';

export const AudioComponent: React.FC<ReactNodeViewProps> = ({
  node,
  updateAttributes,
  selected,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const plyrRef = useRef<any>(null);
  const [audioUrl, setAudioUrl] = useState('');
  const { src, controls, autoplay, loop, muted, preload } = node.attrs;

  useEffect(() => {
    // 确保在客户端环境下才初始化 Plyr
    if (typeof window !== 'undefined' && audioRef.current && src) {
      // 动态导入 Plyr 避免 SSR 问题
      import('plyr')
        .then((PlyrModule) => {
          const Plyr = PlyrModule.default;
          // 初始化 Plyr
          plyrRef.current = new Plyr(audioRef.current!, {
            controls: [
              'play-large',
              'restart',
              'rewind',
              'play',
              'fast-forward',
              'progress',
              'current-time',
              'duration',
              'mute',
              'volume',
              'settings',
            ],
            settings: ['speed', 'loop'],
            speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2] },
            loop: { active: loop },
            muted: muted,
            autoplay: autoplay,
            keyboard: { focused: true, global: false },
            tooltips: { controls: true, seek: true },
            displayDuration: true,
            invertTime: false,
            toggleInvert: true,
            ratio: undefined,
            clickToPlay: true,
            hideControls: true,
            resetOnEnd: false,
            disableContextMenu: false,
          });
        })
        .catch((error) => {
          console.error('Failed to load Plyr:', error);
        });

      // 清理函数
      return () => {
        if (plyrRef.current) {
          plyrRef.current.destroy();
          plyrRef.current = null;
        }
      };
    }
  }, [src, controls, autoplay, loop, muted, preload]);

  if (!src) {
    return (
      <NodeViewWrapper
        className={cn(
          'my-4 overflow-hidden rounded-lg',
          selected && 'ring-2 ring-blue-500 ring-offset-2',
        )}
      >
        <div className="group relative">
          <div className="cursor-pointer rounded-lg border-2 border-dashed border-border bg-gradient-to-br from-background to-muted/50 p-2 transition-all duration-200 hover:border-border/80">
            <div className="flex w-full items-center gap-2">
              <Input
                type="url"
                placeholder="输入音频链接 (MP3, WAV, OGG)"
                value={audioUrl}
                onChange={(e) => setAudioUrl(e.target.value)}
                className="text-center"
              />
              <Button
                variant="default"
                size="sm"
                className="h-8 w-[100px]"
                onClick={() => {
                  if (audioUrl.trim()) {
                    updateAttributes({ src: audioUrl.trim() });
                    setAudioUrl('');
                  }
                }}
                disabled={!audioUrl.trim()}
              >
                <Link className="mr-2 h-4 w-4" />
                添加音频
              </Button>
            </div>
          </div>
        </div>
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper>
      <div>
        <audio
          ref={audioRef}
          controls={controls}
          autoPlay={autoplay}
          muted={muted}
          preload={preload}
          className="w-full"
        >
          <source src={src} />
        </audio>
      </div>
    </NodeViewWrapper>
  );
};
