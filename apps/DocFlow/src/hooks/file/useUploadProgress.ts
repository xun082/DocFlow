import { useRef } from 'react';

import { formatSpeed, formatTime } from '@/utils';

interface UseUploadProgressReturn {
  updateProgress: (bytesUploaded: number, totalBytes: number) => void;
  resetProgress: () => void;
}

// 定义速度计算配置
const SPEED_UPDATE_INTERVAL = 1000; // 更新速度的间隔时间(ms)
const MAX_SPEED_SAMPLES = 10; // 保留的速度样本数量

export const useUploadProgress = (
  setProgress: (progress: number) => void,
  setUploadSpeed: (speed: string | null) => void,
  setRemainingTime: (time: string | null) => void,
): UseUploadProgressReturn => {
  // 速度计算相关的refs
  const speedSamples = useRef<{ bytes: number; timestamp: number }[]>([]);
  const lastUpdateTime = useRef<number>(0);
  const lastBytesUploaded = useRef<number>(0);
  const uploadStartTime = useRef<number>(0);

  const updateProgress = (bytesUploaded: number, totalBytes: number) => {
    const now = Date.now();

    // 设置上传开始时间
    if (uploadStartTime.current === 0) {
      uploadStartTime.current = now;
      lastUpdateTime.current = now;
      lastBytesUploaded.current = 0;
    }

    // 计算并设置上传进度百分比
    const progress = Math.round((bytesUploaded / totalBytes) * 100);
    setProgress(progress);

    // 速度计算：只有当有字节增量且时间间隔足够时才更新
    if (
      now - lastUpdateTime.current >= SPEED_UPDATE_INTERVAL &&
      bytesUploaded > lastBytesUploaded.current
    ) {
      const timeDiff = now - lastUpdateTime.current; // 毫秒
      const bytesDiff = bytesUploaded - lastBytesUploaded.current;

      // 计算当前速度 (bytes/second)
      const currentSpeed = (bytesDiff / timeDiff) * 1000;

      // 记录速度样本
      speedSamples.current.push({
        bytes: currentSpeed,
        timestamp: now,
      });

      // 移除过期的样本 (超过10秒的)
      const cutoffTime = now - 10000;
      speedSamples.current = speedSamples.current.filter((sample) => sample.timestamp > cutoffTime);

      // 保持样本数量在限制内
      if (speedSamples.current.length > MAX_SPEED_SAMPLES) {
        speedSamples.current = speedSamples.current.slice(-MAX_SPEED_SAMPLES);
      }

      // 计算平均速度 (使用最近的样本)
      let avgSpeed = 0;

      if (speedSamples.current.length > 0) {
        // 使用加权平均，最近的样本权重更高
        let totalWeight = 0;
        let weightedSum = 0;

        speedSamples.current.forEach((sample, index) => {
          const weight = index + 1; // 越新的样本权重越大
          weightedSum += sample.bytes * weight;
          totalWeight += weight;
        });

        avgSpeed = weightedSum / totalWeight;
      } else {
        // 如果没有足够的样本，使用整体平均速度
        const totalTime = now - uploadStartTime.current;

        if (totalTime > 0) {
          avgSpeed = (bytesUploaded / totalTime) * 1000;
        }
      }

      // 设置显示的速度
      setUploadSpeed(formatSpeed(avgSpeed));

      // 估算剩余时间
      const remainingBytes = totalBytes - bytesUploaded;

      if (avgSpeed > 0 && remainingBytes > 0) {
        const estimatedRemainingSeconds = remainingBytes / avgSpeed;
        setRemainingTime(formatTime(estimatedRemainingSeconds));
      } else if (remainingBytes <= 0) {
        setRemainingTime('即将完成');
      } else {
        setRemainingTime('计算中...');
      }

      // 更新记录
      lastUpdateTime.current = now;
      lastBytesUploaded.current = bytesUploaded;
    }
  };

  const resetProgress = () => {
    speedSamples.current = [];
    lastUpdateTime.current = 0;
    lastBytesUploaded.current = 0;
    uploadStartTime.current = 0;
    setProgress(0);
    setUploadSpeed(null);
    setRemainingTime(null);
  };

  return {
    updateProgress,
    resetProgress,
  };
};
