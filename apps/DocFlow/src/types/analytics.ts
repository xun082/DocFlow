export interface TrackingData {
  path: string;
  referrer?: string;
  duration: number;
  os: string;
  browser: string;
  browser_ver: string;
  screen_resolution: string;
  device_type: string;
  language: string;
  timezone: string;
  load_time: number;
  fingerprint_id: string;
}

export interface DeviceInfo {
  path: string;
  referrer: string;
  os: string;
  browser: string;
  browser_ver: string;
  screen_resolution: string;
  device_type: string;
  language: string;
  timezone: string;
  load_time: number;
}

export interface UseAnalyticsOptions {
  debug?: boolean;
}

export interface QueuedAnalyticsItem extends TrackingData {
  timestamp: number;
  retry_count: number;
}
