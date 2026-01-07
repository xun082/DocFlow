'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useMotionValue, useSpring } from 'framer-motion';

import useAnalytics from '@/hooks/useAnalysis';
import { getCookie, springConfig } from '@/utils';
import Header from '@/components/homepage/Header';
import Hero from '@/components/homepage/Hero';

const Features = dynamic(() => import('@/components/homepage/Features'), {
  loading: () => <div className="min-h-screen" />,
  ssr: true,
});

const Contact = dynamic(() => import('@/components/homepage/Contact'), {
  loading: () => <div className="min-h-[400px]" />,
  ssr: true,
});

const Projects = dynamic(() => import('@/components/homepage/Projects'), {
  loading: () => <div className="min-h-screen" />,
  ssr: true,
});

const Footer = dynamic(() => import('@/components/homepage/Footer'), {
  loading: () => <div className="min-h-[200px]" />,
  ssr: true,
});

const BackgroundEffects = dynamic(() => import('@/components/homepage/BackgroundEffects'), {
  loading: () => null,
  ssr: false, // 背景效果不需要SSR
});

const Page = () => {
  useAnalytics();

  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  // 分离认证检查和OAuth回调处理
  useEffect(() => {
    setIsMounted(true);

    const token = getCookie('auth_token');
    setIsLoggedIn(!!token);

    // 检查是否是GitHub OAuth回调（如果callback URL配置错误指向了根目录）
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
      // 构建完整的callback URL，保留所有参数
      const callbackUrl = `/auth/callback${window.location.search}`;
      // 使用replace避免在浏览器历史中留下痕迹
      window.location.replace(callbackUrl);
    }
  }, []);

  // 鼠标移动效果 - 独立effect，避免不必要的重渲染
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX - 192);
      mouseY.set(e.clientY - 192);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
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
