'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Github, Menu, Newspaper, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { getCookie } from '@/utils';

const Header: React.FC = () => {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    const token = getCookie('auth_token');
    setIsLoggedIn(!!token);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const onGetStarted = () => {
    console.log('isLoggedIn', isLoggedIn);

    if (isLoggedIn) {
      router.push('/dashboard');
    } else {
      router.push('/auth');
    }
  };

  return (
    <header className="relative z-50 px-4 sm:px-6 py-4 sm:py-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo 部分 */}
        <motion.div
          className="flex items-center space-x-2 sm:space-x-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/25">
            <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          </div>
          <span className="text-xl sm:text-2xl font-bold text-white">DocFlow</span>
          <span className="hidden xs:inline-block text-xs bg-gradient-to-r from-violet-500 to-purple-500 text-white px-2 sm:px-3 py-1 rounded-full font-medium">
            开源
          </span>
        </motion.div>

        {/* 桌面端导航 */}
        <motion.div
          className="hidden md:flex items-center space-x-6"
          initial={{ opacity: 0, x: 20 }}
          animate={isMounted ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
          transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
        >
          <Link href="/blog" aria-label="查看 DocFlow 博客">
            <div className="flex items-center space-x-2 text-white bg-white/10 hover:bg-white/20 backdrop-blur-xl transition-all duration-300 px-4 py-2.5 rounded-xl border border-white/20 hover:border-white/40 shadow-lg hover:shadow-white/10 hover:scale-105">
              <Newspaper className="h-4 w-4" />
              <span className="text-sm font-semibold">博客</span>
            </div>
          </Link>
          <Link
            href="https://github.com/xun082/DocFlow"
            target="_blank"
            aria-label="查看 DocFlow 在 GitHub 上的源代码"
          >
            <div className="flex items-center space-x-2 text-white bg-white/10 hover:bg-white/20 backdrop-blur-xl transition-all duration-300 px-4 py-2.5 rounded-xl border border-white/20 hover:border-white/40 shadow-lg hover:shadow-white/10 hover:scale-105">
              <Github className="h-4 w-4" />
              <span className="text-sm font-semibold">GitHub</span>
            </div>
          </Link>
          <Button
            onClick={onGetStarted}
            className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-lg shadow-violet-500/25 hover:scale-105 transition-all duration-300 px-6 py-2.5"
          >
            {isLoggedIn ? '快速开始' : '免费使用'}
          </Button>
        </motion.div>

        {/* 移动端菜单按钮 */}
        <motion.button
          className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors duration-300"
          onClick={toggleMobileMenu}
          initial={{ opacity: 0, x: 20 }}
          animate={isMounted ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
          transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
          aria-label="切换菜单"
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </motion.button>
      </div>

      {/* 移动端全屏菜单 */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* 背景遮罩 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* 菜单内容 */}
            <motion.div
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-gray-900/95 backdrop-blur-xl border-l border-white/10 z-50 md:hidden"
            >
              {/* 菜单头部 */}
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <FileText className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-xl font-bold text-white">DocFlow</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors duration-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* 菜单内容 */}
              <div className="p-6 space-y-6">
                <div className="space-y-4">
                  <Link
                    href="/blog"
                    aria-label="查看 DocFlow 博客"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="flex items-center space-x-3 text-gray-300 hover:text-white transition-colors duration-300 px-4 py-4 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10">
                      <FileText className="h-5 w-5" />
                      <span className="font-medium">博客</span>
                    </div>
                  </Link>
                  <Link
                    href="https://github.com/xun082/DocFlow"
                    target="_blank"
                    aria-label="查看 DocFlow 在 GitHub 上的源代码"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="flex items-center space-x-3 text-gray-300 hover:text-white transition-colors duration-300 px-4 py-4 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10">
                      <Github className="h-5 w-5" />
                      <span className="font-medium">GitHub 源码</span>
                    </div>
                  </Link>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <Button
                    onClick={() => {
                      onGetStarted();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-lg shadow-violet-500/25 transition-all duration-300 py-4 text-base font-medium"
                  >
                    {isLoggedIn ? '快速开始' : '免费使用'}
                  </Button>
                </div>

                {/* 额外信息 */}
                <div className="pt-6 border-t border-white/10">
                  <div className="text-center space-y-2">
                    <p className="text-sm text-gray-400">基于 Tiptap + Yjs 构建</p>
                    <p className="text-xs text-gray-500">AI 智能写作平台</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
