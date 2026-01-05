import { withSentryConfig } from '@sentry/nextjs';
/** @type {import('next').NextConfig} */
import { NextConfig } from 'next';
import withBundleAnalyzer from '@next/bundle-analyzer';
import path from 'path';

const nextConfig: NextConfig = {
  poweredByHeader: false,

  // 启用编译器优化
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // 优化图片处理
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // 性能优化配置
  compress: true,
  productionBrowserSourceMaps: false, // 生产环境禁用 source maps 减少体积

  // 禁用过度预加载，减少资源预加载警告
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts', '@radix-ui/react-icons'],
    // 优化 CSS 加载
    optimizeCss: true,
  },

  // 开发模式优化
  devIndicators: {
    position: 'bottom-right',
  },

  // 优化模块导入
  modularizeImports: {
    'lodash-es': {
      transform: 'lodash-es/{{member}}',
    },
  },

  webpack(config, { isServer, dev }) {
    // SVG 支持
    config.module.rules.push({
      test: /\.svg$/,
      use: [
        {
          loader: '@svgr/webpack',
          options: {
            dimensions: false,
          },
        },
      ],
    });

    // 忽略来自 Sentry/OpenTelemetry 的依赖警告
    config.ignoreWarnings = [
      {
        module: /node_modules\/@opentelemetry\/instrumentation/,
        message: /Critical dependency: the request of a dependency is an expression/,
      },
      {
        module: /node_modules\/require-in-the-middle/,
        message:
          /Critical dependency: require function is used in a way in which dependencies cannot be statically extracted/,
      },
    ];

    // 开发模式下减少预加载
    if (dev && !isServer) {
      // 禁用某些自动优化以减少预加载警告
      config.optimization = {
        ...config.optimization,
        runtimeChunk: false, // 禁用运行时 chunk
      };
    }

    // 生产环境优化（仅客户端） - 使用 Next.js 默认策略
    if (!dev && !isServer) {
      // 保留 Next.js 的默认代码分割，只做细微调整
      if (
        config.optimization?.splitChunks &&
        typeof config.optimization.splitChunks !== 'boolean'
      ) {
        config.optimization.splitChunks = {
          ...config.optimization.splitChunks,
          chunks: 'all',
        };
      }
    }

    // 缓存优化（仅客户端）
    if (!isServer && !dev) {
      config.cache = {
        type: 'filesystem',
        compression: 'gzip',
        buildDependencies: {
          config: [__filename],
        },
      };
    }
    return config;
  },
};

// 配置 Bundle Analyzer
const withAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

export default withSentryConfig(withAnalyzer(nextConfig), {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: 'docflow-0c',

  project: 'javascript-nextjs',

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: '/monitoring',

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
  // See the following for more information:
  // https://docs.sentry.io/product/crons/
  // https://vercel.com/docs/cron-jobs
  automaticVercelMonitors: true,
});
