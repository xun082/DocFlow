import { useEffect, useRef } from 'react';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { UAParser } from 'ua-parser-js';

import type { TrackingData, DeviceInfo } from '@/types/analytics';

class AnalyticsTracker {
  private static instance: AnalyticsTracker;
  private fingerprintId: string | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private lastHeartbeat: number = Date.now();
  private accumulatedDuration: number = 0;
  private isVisible: boolean = document.visibilityState === 'visible';
  private readonly deviceInfo: DeviceInfo;
  private readonly apiUrl: string;
  private readonly pageLoadTime: number;

  private constructor() {
    this.pageLoadTime = Date.now();
    this.apiUrl = process.env.NEXT_PUBLIC_SERVER_URL + '/api/v1/trace';
    this.deviceInfo = this.collectDeviceInfo();
    this.initialize();
  }

  public static getInstance(): AnalyticsTracker {
    return (AnalyticsTracker.instance ||= new AnalyticsTracker());
  }

  public setFingerprintId(id: string): void {
    this.fingerprintId = id;
    this.track();
  }

  public track(data: Partial<TrackingData> = {}): void {
    if (!this.fingerprintId) {
      return;
    }

    const payload = this.buildPayload(data);
    this.send(payload);
  }

  private initialize(): void {
    this.setupEventListeners();
    this.startHeartbeat();
  }

  private setupEventListeners(): void {
    // 使用现代事件替代废弃的 unload
    // pagehide: 页面被隐藏时触发（包括关闭、前进/后退）
    // visibilitychange: 页面可见性变化时触发
    window.addEventListener('pagehide', this.handleExit);
    document.addEventListener('visibilitychange', this.handleVisibilityChange);

    // 仅在需要提示用户保存数据时使用 beforeunload
    // 这里只用于数据发送，不需要 beforeunload
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.isVisible) {
        this.updateDuration();
      }
    }, 5000);
  }

  private updateDuration(): void {
    const now = Date.now();
    this.accumulatedDuration += now - this.lastHeartbeat;
    this.lastHeartbeat = now;
  }

  private handleVisibilityChange = (): void => {
    const wasVisible = this.isVisible;
    this.isVisible = document.visibilityState === 'visible';

    if (wasVisible && !this.isVisible) {
      this.updateDuration();
    } else if (!wasVisible && this.isVisible) {
      this.lastHeartbeat = Date.now();
    }
  };

  private handleExit = (): void => {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    if (this.fingerprintId) {
      this.track();
    }
  };

  private buildPayload(data: Partial<TrackingData>): TrackingData {
    return {
      ...this.deviceInfo,
      duration: this.getCurrentDuration(),
      fingerprint_id: this.fingerprintId as string,
      ...data,
    };
  }

  private getCurrentDuration(): number {
    let duration = this.accumulatedDuration;

    if (this.isVisible) {
      duration += Date.now() - this.lastHeartbeat;
    }

    return Math.round(duration);
  }

  private send(data: TrackingData): void {
    const payload = JSON.stringify(data);

    if (navigator.sendBeacon) {
      navigator.sendBeacon(this.apiUrl, new Blob([payload], { type: 'application/json' }));
    } else {
      fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: '*/*',
        },
        body: payload,
        keepalive: true,
        mode: 'cors',
      }).catch(() => {
        // Silent fail
      });
    }
  }

  private collectDeviceInfo(): DeviceInfo {
    const parser = UAParser(navigator.userAgent);
    const currentPath = window.location.pathname;
    const referrer = document.referrer;
    const loadTime = Math.round(Date.now() - this.pageLoadTime);
    const screenResolution = `${screen.width}x${screen.height}`;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const language = navigator.language;

    return {
      path: currentPath,
      referrer: referrer,
      os: parser.os.name?.toLowerCase() as string,
      browser: parser.browser.name?.toLowerCase() as string,
      browser_ver: parser.browser.version as string,
      screen_resolution: screenResolution,
      device_type: (parser.device.type || 'desktop') as string,
      language: language,
      timezone: timezone,
      load_time: loadTime,
    };
  }
}

const isBrowser = typeof window !== 'undefined';
const tracker = isBrowser ? AnalyticsTracker.getInstance() : null;

const useAnalytics = () => {
  const initialized = useRef<boolean>(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const initializeTracking = async () => {
      try {
        const fp = await FingerprintJS.load();
        const result = await fp.get();
        const fingerprintId = result.visitorId;

        tracker?.setFingerprintId(fingerprintId);
      } catch {
        // Silent fail
      }
    };

    initializeTracking();
  }, []);
};

export default useAnalytics;
