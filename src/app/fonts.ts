import localFont from 'next/font/local';

// 优化 Inter 字体加载 - 使用本地字体文件，只加载需要的字重
export const inter = localFont({
  src: '../../public/fonts/Inter.ttf',
  variable: '--font-inter',
  display: 'swap', // 优化字体加载性能
  preload: true,
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
