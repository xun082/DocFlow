'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FileText, Github } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface HeaderProps {
  isLoggedIn: boolean;
  onGetStarted: () => void;
}

const Header: React.FC<HeaderProps> = ({ isLoggedIn, onGetStarted }) => {
  return (
    <header className="relative z-50 px-6 py-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <motion.div
          className="flex items-center space-x-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/25">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <span className="text-2xl font-bold text-white">DocFlow</span>
          <span className="text-xs bg-gradient-to-r from-violet-500 to-purple-500 text-white px-3 py-1 rounded-full font-medium">
            开源
          </span>
        </motion.div>

        <motion.div
          className="flex items-center space-x-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
        >
          <Link
            href="https://github.com/xun082/DocFlow"
            target="_blank"
            aria-label="查看 DocFlow 在 GitHub 上的源代码"
          >
            <div className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors duration-300 px-4 py-2 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10">
              <Github className="h-4 w-4" />
              <span className="text-sm font-medium">GitHub</span>
            </div>
          </Link>
          <Button
            onClick={onGetStarted}
            className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-lg shadow-violet-500/25 hover:scale-105 transition-all duration-300 px-6 py-2.5"
          >
            {isLoggedIn ? '快速开始' : '免费使用'}
          </Button>
        </motion.div>
      </div>
    </header>
  );
};

export default Header;
