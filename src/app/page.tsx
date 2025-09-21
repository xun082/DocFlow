'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMotionValue, useSpring } from 'framer-motion';

import useAnalytics from '@/hooks/useAnalysis';
import { getCookie } from '@/utils/cookie';
import { springConfig } from '@/utils/constants/homepage';
import Header from '@/components/homepage/Header';
import Hero from '@/components/homepage/Hero';
import Features from '@/components/homepage/Features';
import Contact from '@/components/homepage/Contact';
import Projects from '@/components/homepage/Projects';
import Footer from '@/components/homepage/Footer';
import BackgroundEffects from '@/components/homepage/BackgroundEffects';

const Page = () => {
  useAnalytics();

  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  useEffect(() => {
    setIsMounted(true);

    const token = getCookie('auth_token');
    setIsLoggedIn(!!token);

    // 检查是否是GitHub OAuth回调（如果callback URL配置错误指向了根目录）
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');

      if (code) {
        // 构建完整的callback URL，保留所有参数
        const callbackUrl = `/auth/callback${window.location.search}`;
        // 使用replace避免在浏览器历史中留下痕迹
        window.location.replace(callbackUrl);

        return; // 早期返回，避免设置其他监听器
      }

      const handleMouseMove = (e: MouseEvent) => {
        mouseX.set(e.clientX - 192);
        mouseY.set(e.clientY - 192);
      };

      window.addEventListener('mousemove', handleMouseMove);

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
      };
    }
  }, [mouseX, mouseY]);

  const handleGetStarted = () => {
    if (isLoggedIn) {
      router.push('/dashboard');
    } else {
      router.push('/auth');
    }
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* 动态背景 */}
      <BackgroundEffects springX={springX} springY={springY} />

      {/* Header */}
      <Header isLoggedIn={isLoggedIn} onGetStarted={handleGetStarted} />

      {/* Hero Section - 主要内容 */}
      <Hero isMounted={isMounted} />

      {/* Features Section - 功能介绍 */}
      <Features isMounted={isMounted} />

      {/* Contact 组件 - 联系我们部分 */}
      <Contact />

      {/* 社区项目展示 */}
      <Projects isMounted={isMounted} />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Page;
