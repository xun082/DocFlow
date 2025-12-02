import { Inter } from 'next/font/google';

// 使用 Google Fonts 的 Inter - Next.js 会自动优化
// 只加载实际使用的字重，减少加载时间
export const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
  preload: true,
  adjustFontFallback: true,
  fallback: [
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Noto Sans SC',
    'Helvetica Neue',
    'Arial',
    'sans-serif',
  ],
});
