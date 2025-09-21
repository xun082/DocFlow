'use client';

import React from 'react';
import { motion, MotionValue } from 'framer-motion';

interface BackgroundEffectsProps {
  springX: MotionValue<number>;
  springY: MotionValue<number>;
}

const BackgroundEffects: React.FC<BackgroundEffectsProps> = ({ springX, springY }) => {
  return (
    <div className="absolute inset-0">
      {/* 鼠标跟随光圈 - 使用优化的 motion value */}
      <motion.div
        className="absolute w-96 h-96 bg-gradient-to-r from-violet-500/20 to-purple-500/20 rounded-full blur-3xl pointer-events-none will-change-transform"
        style={{
          x: springX,
          y: springY,
        }}
      />

      {/* 静态装饰光圈 */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl will-change-transform"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
          repeatType: 'reverse',
        }}
      />

      <motion.div
        className="absolute top-3/4 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl will-change-transform"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.5, 0.2],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
          repeatType: 'reverse',
          delay: 2,
        }}
      />

      {/* 网格背景 */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[length:60px_60px]" />
    </div>
  );
};

export default BackgroundEffects;
