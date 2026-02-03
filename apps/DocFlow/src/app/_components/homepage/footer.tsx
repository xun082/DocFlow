import Link from 'next/link';
import { FileText, Github, Heart } from 'lucide-react';

import { SITE_CONFIG } from './constants';

export function Footer() {
  return (
    <footer className="relative bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-6 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {SITE_CONFIG.name}
              </span>
              <p className="text-sm text-gray-600 mt-1">AI 驱动的智能写作平台</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              href={SITE_CONFIG.githubUrl}
              target="_blank"
              className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-200 hover:border-gray-300 rounded-lg text-gray-700 hover:text-gray-900 transition-all duration-300 group"
            >
              <Github className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium">GitHub</span>
            </Link>
            <div className="px-3 py-1 bg-green-50 border border-green-200 rounded-full">
              <span className="text-xs text-green-700 font-medium">MIT 开源</span>
            </div>
          </div>
        </div>

        <div className="my-8 border-t border-gray-200"></div>

        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 text-center md:text-left">
            <div className="text-sm text-gray-600">
              © {new Date().getFullYear()} {SITE_CONFIG.name}. Made with{' '}
              <Heart className="inline h-3 w-3 text-red-500 mx-1" />
              by {SITE_CONFIG.name} Team
            </div>
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <Link
                href="https://beian.miit.gov.cn/#/Integrated/index"
                className="hover:text-gray-700 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                {SITE_CONFIG.beianNumber}
              </Link>
              <span>•</span>
              <Link
                href="http://www.beian.gov.cn/portal/registerSystemInfo"
                className="hover:text-gray-700 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                {SITE_CONFIG.gonganBeian}
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {SITE_CONFIG.techStack.map((tech) => {
              const colorMap: Record<string, string> = {
                'React 19': 'bg-violet-50 border-violet-200 text-violet-700',
                TypeScript: 'bg-blue-50 border-blue-200 text-blue-700',
                'AI Powered': 'bg-green-50 border-green-200 text-green-700',
              };

              return (
                <div
                  key={tech}
                  className={`px-2 py-1 border rounded text-xs font-medium ${colorMap[tech]}`}
                >
                  {tech}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}
