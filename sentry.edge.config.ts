// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

// 只在生产环境启用 Sentry
if (process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn: 'https://ff26f22bed7e5dab2e5a58317a23a6f5@o4510198572318720.ingest.us.sentry.io/4510198573629440',

    // 降低采样率，避免 429 错误
    tracesSampleRate: 0.1,

    // 禁用发送用户 PII，提升隐私保护
    sendDefaultPii: false,

    // 添加环境标识
    environment: 'production',

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
}
