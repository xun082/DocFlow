import { FileEdit, Github, Twitter, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#F3F3F5] border-t border-gray-200 pt-14 pb-8">
      <div className="px-5 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pb-10 border-b border-gray-200">
          <div>
            <a href="/" className="flex items-center gap-2 font-bold text-xl text-gray-900 mb-3">
              <FileEdit size={22} className="text-violet-600" />
              DocFlow
            </a>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
              智能文档协作平台，让写作与团队协同更高效。
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">快速导航</h4>
            <ul className="space-y-2">
              {[
                { text: '功能特性', url: '#features' },
                { text: '价格方案', url: '#pricing' },
                { text: '用户评价', url: '#testimonials' },
              ].map((item) => (
                <li key={item.url}>
                  <a
                    href={item.url}
                    className="text-sm text-gray-500 hover:text-violet-600 transition-colors"
                  >
                    {item.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">联系我们</h4>
            <a
              href="mailto:hello@codecrack.cn"
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-violet-600 transition-colors mb-5"
            >
              <Mail size={16} />
              hello@codecrack.cn
            </a>
            <div className="flex items-center gap-3">
              <a
                href="https://github.com/xun082/DocFlow"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-violet-600 transition-colors"
              >
                <Github size={20} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-violet-600 transition-colors"
              >
                <Twitter size={20} />
              </a>
            </div>
          </div>
        </div>
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
          <p>© 2025 DocFlow. 保留所有权利。</p>
          <p>
            由{' '}
            <a href="https://www.codecrack.cn" className="hover:text-violet-600 transition-colors">
              DocFlow Team
            </a>{' '}
            用心构建 ♥
          </p>
        </div>
      </div>
    </footer>
  );
}
