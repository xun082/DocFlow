'use client';

import { useState } from 'react';
import { FileEdit, Menu, X } from 'lucide-react';

const NAV_ITEMS = [
  { text: '功能特性', url: '#features' },
  { text: '价格方案', url: '#pricing' },
  { text: '用户评价', url: '#testimonials' },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-100">
      <div className="px-5 max-w-7xl mx-auto flex items-center justify-between h-16">
        <a href="/" className="flex items-center gap-2 font-bold text-xl text-gray-900">
          <FileEdit size={24} className="text-violet-600" />
          DocFlow
        </a>
        <nav className="hidden md:flex items-center gap-8">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.url}
              href={item.url}
              className="text-base text-gray-600 hover:text-gray-900 transition-colors"
            >
              {item.text}
            </a>
          ))}
        </nav>
        <div className="hidden md:flex items-center gap-3">
          <a href="#" className="text-sm text-gray-600 hover:text-gray-900 px-4 py-2">
            登录
          </a>
          <a
            href="#"
            className="text-sm font-semibold bg-violet-600 text-white px-5 py-2 rounded-full hover:bg-violet-700 transition-colors"
          >
            免费开始
          </a>
        </div>
        <button
          className="md:hidden p-2 text-gray-600"
          onClick={() => setOpen((v) => !v)}
          aria-label="菜单"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 bg-white border-t border-gray-100 ${open ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <nav className="px-5 py-4 flex flex-col gap-4">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.url}
              href={item.url}
              onClick={() => setOpen(false)}
              className="text-base text-gray-700 hover:text-violet-600 transition-colors"
            >
              {item.text}
            </a>
          ))}
          <div className="flex flex-col gap-3 pt-2 border-t border-gray-100">
            <a href="#" className="text-base text-gray-600">
              登录
            </a>
            <a
              href="#"
              className="text-base font-semibold bg-violet-600 text-white px-5 py-2.5 rounded-full text-center"
            >
              免费开始
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
}
