import { withSentryConfig } from '@sentry/nextjs';
import withBundleAnalyzer from '@next/bundle-analyzer';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  poweredByHeader: false,

  serverExternalPackages: ['import-in-the-middle', 'require-in-the-middle'],

  // 启用编译器优化
  compiler: {
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? {
          exclude: ['error', 'warn'], // 保留错误和警告日志
        }
        : false,
  },

  // 优化图片处理
  images: {
    formats: ['image/avif', 'image/webp'] as const,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // 性能优化配置
  compress: true,
  productionBrowserSourceMaps: false,

  // 实验性功能 - Turbopack 优化
  experimental: {
    // 优化包导入 - 只优化核心大型依赖库
    // 注意：列举过多包会导致 HMR 模块工厂丢失问题，只优化真正需要的核心包
    optimizePackageImports: [
      // 图标库优化（体积大，大量图标按需加载）
      'lucide-react',
      // 图表库优化
      'recharts',
      // TipTap 编辑器核心（只列举核心包，具体扩展让 Turbopack 自动处理）
      '@tiptap/react',
      '@tiptap/core',
      // 动画库优化（体积大）
      'framer-motion',
      // 表单和验证
      'react-hook-form',
      'zod',
      // 日期处理
      'date-fns',
      // 工具库
      'lodash-es',
      // React Query
      '@tanstack/react-query',
    ],
    // 优化 CSS 加载
    optimizeCss: true,
    // 优化服务器组件 HMR 缓存（默认开启）
    serverComponentsHmrCache: true,
    // Turbopack 文件系统缓存（Next.js 16 默认开启）
    turbopackFileSystemCacheForDev: true,
  },

  // 开发模式优化
  devIndicators: {
    position: 'bottom-right',
  },

  // 优化模块导入 - 按需加载
  modularizeImports: {
    'lodash-es': {
      transform: 'lodash-es/{{member}}',
      preventFullImport: true,
    },
    'date-fns': {
      transform: 'date-fns/{{member}}',
      preventFullImport: true,
    },
    // Lucide React 已经通过 optimizePackageImports 自动优化，不需要这里配置
  },

  // Turbopack 专用配置
  turbopack: {
    // 解析别名（tsconfig.json 中已有，这里显式声明）
    resolveAlias: {
      '@': './src',
    },
    // 解析扩展名优先级
    resolveExtensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
  },

  // Webpack 优化配置（生产环境使用）
  webpack: (config, { isServer, webpack, dev }) => {
    // 只在生产环境应用 webpack 优化
    if (!dev) {
      // 优化代码分割
      if (!isServer) {
        config.optimization = {
          ...config.optimization,
          splitChunks: {
            chunks: 'all',
            cacheGroups: {
              // 框架核心库
              framework: {
                name: 'framework',
                test: /[\\/]node_modules[\\/](react|react-dom|next|scheduler)[\\/]/,
                priority: 40,
                enforce: true,
              },
              // TipTap 编辑器（最大依赖）
              tiptap: {
                name: 'tiptap',
                test: /[\\/]node_modules[\\/](@tiptap|prosemirror-|yjs|y-prosemirror|y-protocols)[\\/]/,
                priority: 35,
                enforce: true,
              },
              // UI 组件库
              ui: {
                name: 'ui',
                test: /[\\/]node_modules[\\/](@radix-ui|cmdk|vaul|sonner)[\\/]/,
                priority: 30,
                enforce: true,
              },
              // 图标和图表
              charting: {
                name: 'charting',
                test: /[\\/]node_modules[\\/](lucide-react|recharts|d3-)[\\/]/,
                priority: 28,
                enforce: true,
              },
              // 动画库
              animation: {
                name: 'animation',
                test: /[\\/]node_modules[\\/](framer-motion)[\\/]/,
                priority: 26,
                enforce: true,
              },
              // PDF 和文档处理
              document: {
                name: 'document',
                test: /[\\/]node_modules[\\/](pdfjs-dist|docx|mammoth|xlsx|jspdf)[\\/]/,
                priority: 24,
                enforce: true,
              },
              // 其他第三方库
              vendor: {
                name: 'vendor',
                test: /[\\/]node_modules[\\/]/,
                priority: 20,
                minChunks: 1,
                reuseExistingChunk: true,
              },
              // 公共组件
              common: {
                name: 'common',
                minChunks: 2,
                priority: 10,
                reuseExistingChunk: true,
              },
            },
            maxInitialRequests: 25,
            maxAsyncRequests: 30,
            minSize: 20000,
            maxSize: 244000,
          },
        };
      }

      // 忽略不必要的依赖
      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /^\.\/locale$/,
          contextRegExp: /moment$/,
        }),
      );
    }

    return config;
  },

  // 响应头优化 - 强制缓存静态资源
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|jpeg|png|gif|webp|avif|ico|woff|woff2|ttf|eot)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },

  // async rewrites() {
  //   const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;

  //   if (!serverUrl) return [];

  //   return [
  //     {
  //       source: '/api/:path*',
  //       destination: `${serverUrl}/api/:path*`,
  //     },
  //   ];
  // },
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

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors
  automaticVercelMonitors: true,
});
