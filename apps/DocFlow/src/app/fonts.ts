// 使用系统字体栈 - 无需网络请求，加载更快
// 支持 macOS、Windows、Linux 和移动设备的系统字体
export const systemFont = {
  variable: '--font-inter',
  style: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Noto Sans SC", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
  },
};

// 保持兼容性的别名
export const inter = systemFont;
