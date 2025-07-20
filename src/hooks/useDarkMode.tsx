import { useEffect, useState } from 'react';

export const useDarkMode = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // 初始化主题
  useEffect(() => {
    // 从localStorage获取保存的主题设置
    const savedTheme = localStorage.getItem('color-theme');

    // 检测系统主题偏好
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    // 如果用户没有设置过主题，则使用系统主题
    if (savedTheme === null) {
      const defaultTheme = systemPrefersDark ? 'dark' : 'light';
      localStorage.setItem('color-theme', defaultTheme);
      setIsDarkMode(defaultTheme === 'dark');
    } else {
      // 如果用户设置过主题，则使用保存的主题设置
      if (savedTheme === 'system') {
        setIsDarkMode(systemPrefersDark);
      } else {
        setIsDarkMode(savedTheme === 'dark');
      }
    }

    setIsInitialized(true);

    // 监听系统主题变化
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      const currentTheme = localStorage.getItem('color-theme');

      if (currentTheme === 'system') {
        setIsDarkMode(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  // 应用主题到document
  useEffect(() => {
    if (typeof document === 'undefined' || !isInitialized) return;
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode, isInitialized]);

  // 切换暗黑模式
  const toggleDarkMode = () => {
    setIsDarkMode((prevIsDark) => {
      const newValue = !prevIsDark;
      localStorage.setItem('color-theme', newValue ? 'dark' : 'light');

      return newValue;
    });
  };

  // 设置亮色模式
  const lightMode = () => {
    setIsDarkMode(false);
    localStorage.setItem('color-theme', 'light');
  };

  // 设置暗色模式
  const darkMode = () => {
    setIsDarkMode(true);
    localStorage.setItem('color-theme', 'dark');
  };

  return {
    isDarkMode,
    toggleDarkMode,
    lightMode,
    darkMode,
    isInitialized,
  };
};
