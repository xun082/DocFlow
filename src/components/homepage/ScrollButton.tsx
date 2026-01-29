'use client';

import { FileText } from 'lucide-react';

/**
 * 滚动按钮 - 客户端组件
 * 处理平滑滚动到指定区域
 */
export function ScrollButton() {
  return (
    <button
      className="group px-8 py-4 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold rounded-2xl border-2 border-gray-200 hover:border-gray-300 transition-all duration-300 hover:scale-105 cursor-pointer shadow-lg hover:shadow-xl active:scale-95"
      onClick={() => {
        const featuresSection = document.getElementById('features');
        featuresSection?.scrollIntoView({ behavior: 'smooth' });
      }}
    >
      <span className="relative flex items-center justify-center space-x-2 text-lg">
        <FileText className="h-5 w-5" />
        <span>项目介绍</span>
      </span>
    </button>
  );
}
