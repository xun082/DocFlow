import { useCallback, useEffect, useState } from 'react';

const useDarkMode = () => {
  // 安全地初始化黑暗模式状态
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // 初始化暗黑模式状态
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isInitialized) return;

    // 获取localStorage中保存的主题偏好
    const savedTheme = localStorage.getItem('color-theme');

    if (savedTheme === 'dark') {
      setIsDarkMode(true);
    } else if (savedTheme === 'light') {
      setIsDarkMode(false);
    } else {
      // 如果没有保存的偏好，则使用系统偏好
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDark);
      localStorage.setItem('color-theme', prefersDark ? 'dark' : 'light');
    }

    setIsInitialized(true);
  }, [isInitialized]);

  // 监听系统主题变化
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      // 仅当用户没有设置明确偏好时跟随系统
      if (!localStorage.getItem('color-theme')) {
        setIsDarkMode(e.matches);
      }
    };

    // 仅使用现代浏览器 API
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // 当暗黑模式状态变化时，应用到文档
  useEffect(() => {
    if (typeof document === 'undefined' || !isInitialized) return;
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode, isInitialized]);

  // 切换暗黑模式
  const toggleDarkMode = useCallback(() => {
    setIsDarkMode((prevIsDark) => {
      const newValue = !prevIsDark;
      localStorage.setItem('color-theme', newValue ? 'dark' : 'light');

      return newValue;
    });
  }, []);

  // 设置亮色模式
  const lightMode = useCallback(() => {
    setIsDarkMode(false);
    localStorage.setItem('color-theme', 'light');
  }, []);

  // 设置暗色模式
  const darkMode = useCallback(() => {
    setIsDarkMode(true);
    localStorage.setItem('color-theme', 'dark');
  }, []);

  return {
    isDarkMode,
    toggleDarkMode,
    lightMode,
    darkMode,
  };
};

export default useDarkMode;
