// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: 'https://ff26f22bed7e5dab2e5a58317a23a6f5@o4510198572318720.ingest.us.sentry.io/4510198573629440',

  // 生产环境降低采样率，避免 429 错误
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1,

  // 只在生产环境启用日志
  enableLogs: process.env.NODE_ENV === 'production',

  // 禁用发送用户 PII，提升隐私保护
  sendDefaultPii: false,

  // 添加环境标识
  environment: process.env.NODE_ENV || 'development',

  // 忽略常见的良性错误
  ignoreErrors: [
    'ResizeObserver loop limit exceeded',
    'Non-Error promise rejection captured',
    'ChunkLoadError',
    'Loading chunk',
    'Failed to fetch',
  ],

  // 设置发布版本
  release: process.env.NEXT_PUBLIC_APP_VERSION,
});
