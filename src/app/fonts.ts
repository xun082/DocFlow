import { Inter } from 'next/font/google';
import localFont from 'next/font/local';

// 使用 Google Fonts 的 Inter - Next.js 会自动优化
export const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
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

// Cal Sans 字体
export const calSans = localFont({
  src: '../../public/fonts/CalSans-SemiBold.ttf',
  variable: '--font-cal-sans',
  display: 'swap',
  preload: false, // 非关键字体，延迟加载
  weight: '600',
});
