import type { Metadata } from 'next';
import Link from 'next/link';
import {
  FileText,
  Github,
  Newspaper,
  ChevronRight,
  Menu,
  X,
  Sparkles,
  Users,
  MessageCircle,
  Heart,
  Edit3,
  Database,
  Search,
  Mic,
  UserCircle,
  Zap,
} from 'lucide-react';

const SITE_CONFIG = {
  name: 'DocFlow',
  tagline: 'AI 智能写作平台',
  description:
    'DocFlow 基于 Tiptap+Yjs 构建的智能协作编辑器,集成 AI 续写、RAG 知识库检索、AI 播客生成。支持多人实时协作编辑、Markdown、富文本等格式。',
  url: 'https://www.codecrack.cn',
  githubUrl: 'https://github.com/xun082/DocFlow',
  blogUrl: '/blog',
  dashboardUrl: '/dashboard',
  year: 2026,
  beianNumber: '粤ICP备2025376666号',
  gonganBeian: '粤公网安备 44030502008888号',
  techStack: ['React 19', 'TypeScript', 'AI Powered'],
} as const;

const FEATURES = [
  {
    icon: Edit3,
    title: '沉浸式编辑器',
    description:
      '基于 Tiptap 打造的下一代编辑体验,支持 Markdown 快捷键、块级编辑、拖拽排版,让写作如行云流水般自然',
    gradient: 'from-violet-500 to-purple-600',
    bgColor: 'bg-violet-50',
    borderColor: 'border-violet-200',
    hoverBorder: 'hover:border-violet-400',
    textColor: 'text-violet-700',
  },
  {
    icon: Users,
    title: '实时协作引擎',
    description:
      '基于 Yjs CRDT 算法的毫秒级同步技术,支持百人同时在线编辑,冲突自动解决,协作从未如此丝滑',
    gradient: 'from-emerald-500 to-teal-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    hoverBorder: 'hover:border-emerald-400',
    textColor: 'text-emerald-700',
  },
  {
    icon: Sparkles,
    title: 'AI 创作引擎',
    description:
      '深度理解上下文语境的智能续写系统,支持多种写作风格切换,让 AI 成为你最懂你的创作伙伴',
    gradient: 'from-pink-500 to-rose-600',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
    hoverBorder: 'hover:border-pink-400',
    textColor: 'text-pink-700',
  },
  {
    icon: Database,
    title: '知识图谱系统',
    description:
      '智能构建知识关联网络,自动提取文档关键信息,支持语义搜索和知识发现,让信息价值最大化',
    gradient: 'from-blue-500 to-cyan-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    hoverBorder: 'hover:border-blue-400',
    textColor: 'text-blue-700',
  },
  {
    icon: Search,
    title: 'RAG 检索增强',
    description: '结合向量数据库和语义理解的智能检索系统,精准定位相关内容,为创作提供强大的知识支撑',
    gradient: 'from-orange-500 to-red-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    hoverBorder: 'hover:border-orange-400',
    textColor: 'text-orange-700',
  },
  {
    icon: MessageCircle,
    title: '智能对话助手',
    description: '基于文档上下文的专属 AI 助手,深度理解你的内容,提供精准的写作建议和创意灵感',
    gradient: 'from-indigo-500 to-blue-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    hoverBorder: 'hover:border-indigo-400',
    textColor: 'text-indigo-700',
  },
  {
    icon: Mic,
    title: '音频内容生成',
    description: '文档一键转换为专业播客,支持多语言、多音色、情感表达,让知识以声音的形式传播更远',
    gradient: 'from-purple-500 to-pink-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    hoverBorder: 'hover:border-purple-400',
    textColor: 'text-purple-700',
  },
  {
    icon: UserCircle,
    title: '生活智能助理',
    description: '全方位生活服务助手,智能规划出行路线、管理日程安排、提醒重要事项,让生活更有序高效',
    gradient: 'from-cyan-500 to-blue-600',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
    hoverBorder: 'hover:border-cyan-400',
    textColor: 'text-cyan-700',
  },
  {
    icon: Zap,
    title: 'Agent 流程编排',
    description:
      '可视化 Agent 构建平台,从输入处理到输出生成的完整流程设计,支持多模态数据处理和复杂逻辑编排',
    gradient: 'from-yellow-500 to-orange-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    hoverBorder: 'hover:border-yellow-400',
    textColor: 'text-yellow-700',
  },
] as const;

const CONTACT_METHODS = [
  {
    type: 'wechat',
    title: '微信社群',
    description: '关注掘金文章，评论区留言即可添加微信拉入交流群',
    buttonText: '前往掘金',
    gradient: 'from-green-600 to-green-500',
    hoverBorder: 'hover:border-green-400',
    hoverShadow: 'hover:shadow-green-500/10',
    href: 'https://juejin.cn/user/3782764966460398',
  },
  {
    type: 'juejin',
    title: '掘金技术',
    description: '关注我们的技术文章和分享',
    buttonText: '前往掘金主页',
    gradient: 'from-blue-500 via-indigo-500 to-purple-600',
    hoverBorder: 'hover:border-blue-400',
    hoverShadow: 'hover:shadow-blue-500/10',
    href: 'https://juejin.cn/user/3782764966460398',
  },
  {
    type: 'github',
    title: 'GitHub 开源',
    description: '查看我们的开源项目和代码',
    buttonText: '前往 GitHub',
    gradient: 'from-gray-700 via-gray-800 to-gray-900',
    hoverBorder: 'hover:border-gray-400',
    hoverShadow: 'hover:shadow-gray-500/10',
    href: 'https://github.com/xun082',
  },
] as const;

// 导出 Header 和 Footer 供其他页面使用
export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group" aria-label="DocFlow 首页">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-violet-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/30 group-hover:shadow-violet-500/50 transition-shadow">
              <FileText className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-900 via-violet-900 to-purple-900 bg-clip-text text-transparent">
                {SITE_CONFIG.name}
              </span>
              <span className="hidden xs:inline-flex text-[10px] sm:text-xs bg-gradient-to-r from-violet-500 to-purple-600 text-white px-2.5 py-0.5 rounded-full font-bold shadow-sm">
                开源
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-3">
            <Link
              href={SITE_CONFIG.blogUrl}
              className="group flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-violet-600 bg-gray-50 hover:bg-violet-50 rounded-xl border border-gray-200 hover:border-violet-200 transition-all"
            >
              <Newspaper className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-semibold">博客</span>
            </Link>
            <Link
              href={SITE_CONFIG.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 hover:border-gray-300 transition-all"
            >
              <Github className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-semibold">GitHub</span>
            </Link>
            <Link
              href={SITE_CONFIG.dashboardUrl}
              className="group flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 hover:scale-105 active:scale-100 transition-all"
            >
              <span>快速开始</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="md:hidden">
            <input type="checkbox" id="mobile-menu" className="peer sr-only" />
            <label
              htmlFor="mobile-menu"
              className="group flex items-center justify-center w-11 h-11 text-gray-700 hover:text-violet-600 hover:bg-violet-50 rounded-xl cursor-pointer transition-all peer-checked:hidden shadow-sm hover:shadow-md border border-transparent hover:border-violet-200"
              aria-label="打开菜单"
            >
              <Menu className="w-6 h-6 group-hover:scale-110 transition-transform" />
            </label>
            <label
              htmlFor="mobile-menu"
              className="hidden peer-checked:block fixed inset-0 bg-black/50 backdrop-blur-md z-40 fade-in cursor-pointer"
              aria-hidden="true"
            />
            <div className="hidden peer-checked:flex fixed top-0 right-0 bottom-0 w-[min(340px,85vw)] bg-white shadow-2xl border-l-2 border-violet-100 z-50 flex-col slide-in">
              <div className="relative p-6 border-b border-gray-100 bg-gradient-to-br from-violet-50/50 to-purple-50/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-gradient-to-br from-violet-600 via-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-violet-500/50">
                      <FileText className="w-5.5 h-5.5 text-white" />
                    </div>
                    <div>
                      <span className="text-xl font-black bg-gradient-to-r from-violet-900 via-purple-900 to-violet-900 bg-clip-text text-transparent">
                        {SITE_CONFIG.name}
                      </span>
                      <p className="text-[10px] text-gray-500 font-medium mt-0.5">智能写作平台</p>
                    </div>
                  </div>
                  <label
                    htmlFor="mobile-menu"
                    className="group flex items-center justify-center w-10 h-10 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl cursor-pointer transition-all border border-transparent hover:border-red-200 shadow-sm hover:shadow-md"
                    aria-label="关闭菜单"
                  >
                    <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                  </label>
                </div>
              </div>

              <nav className="flex-1 overflow-y-auto p-5 space-y-3">
                <Link
                  href={SITE_CONFIG.blogUrl}
                  className="group block p-4 bg-white hover:bg-gradient-to-br hover:from-violet-50 hover:to-purple-50 rounded-2xl border-2 border-violet-100 hover:border-violet-300 shadow-md hover:shadow-xl hover:shadow-violet-500/20 transition-all hover:scale-105 active:scale-100"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-violet-100 via-violet-200 to-purple-200 group-hover:from-violet-500 group-hover:to-purple-500 rounded-xl flex items-center justify-center shadow-lg transition-all">
                      <Newspaper className="w-6 h-6 text-violet-600 group-hover:text-white group-hover:scale-110 transition-all" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-base text-gray-900 group-hover:text-violet-900 transition-colors mb-0.5">
                        博客
                      </p>
                      <p className="text-xs text-gray-500 group-hover:text-violet-600 transition-colors">
                        阅读最新技术文章
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-violet-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>

                <Link
                  href={SITE_CONFIG.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block p-4 bg-white hover:bg-gradient-to-br hover:from-gray-50 hover:to-gray-100 rounded-2xl border-2 border-gray-200 hover:border-gray-400 shadow-md hover:shadow-xl hover:shadow-gray-500/20 transition-all hover:scale-105 active:scale-100"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 group-hover:from-gray-800 group-hover:to-gray-900 rounded-xl flex items-center justify-center shadow-lg transition-all">
                      <Github className="w-6 h-6 text-gray-700 group-hover:text-white group-hover:scale-110 transition-all" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-base text-gray-900 transition-colors mb-0.5">
                        GitHub
                      </p>
                      <p className="text-xs text-gray-500 group-hover:text-gray-700 transition-colors">
                        开源代码仓库 ⭐
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-700 group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>

                <div className="py-4">
                  <div className="h-px bg-gradient-to-r from-transparent via-violet-300 to-transparent" />
                </div>

                <Link
                  href={SITE_CONFIG.dashboardUrl}
                  className="group block p-5 bg-gradient-to-r from-violet-600 via-purple-600 to-violet-600 hover:from-violet-700 hover:via-purple-700 hover:to-violet-700 rounded-2xl shadow-2xl shadow-violet-500/40 hover:shadow-violet-500/60 hover:scale-105 active:scale-100 transition-all"
                >
                  <div className="flex items-center justify-center gap-3">
                    <Sparkles className="w-5 h-5 text-white group-hover:rotate-12 group-hover:scale-110 transition-all" />
                    <span className="text-base font-black text-white">快速开始</span>
                    <ChevronRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </nav>

              <div className="p-6 text-center border-t border-gray-100 bg-gradient-to-t from-violet-50/50 to-transparent">
                <p className="text-xs font-bold text-gray-700 mb-1">
                  {SITE_CONFIG.name} © {SITE_CONFIG.year}
                </p>
                <p className="text-[10px] text-gray-500 font-medium">
                  ✨ 共同构建下一代智能写作平台
                </p>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
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
              className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-200 hover:border-gray-300 rounded-lg text-gray-700 hover:text-gray-900 transition-all group"
            >
              <Github className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium">GitHub</span>
            </Link>
            <div className="px-3 py-1 bg-green-50 border border-green-200 rounded-full">
              <span className="text-xs text-green-700 font-medium">MIT 开源</span>
            </div>
          </div>
        </div>

        <div className="my-8 border-t border-gray-200" />

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

export const metadata: Metadata = {
  title: 'DocFlow - AI 智能写作平台 | 基于 Tiptap+Yjs 的实时协作编辑器',
  description: SITE_CONFIG.description,
  keywords: [
    '富文本编辑器',
    '在线文本编辑器',
    '协作文档编辑器',
    'AI 写作',
    'AI 续写',
    'Tiptap',
    'Yjs',
    '实时协作',
    '多人协作编辑',
    'Markdown 编辑器',
    'RAG 知识库',
    'AI 播客生成',
  ],
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: SITE_CONFIG.url,
    siteName: SITE_CONFIG.name,
    title: `${SITE_CONFIG.name} - ${SITE_CONFIG.tagline}`,
    description: SITE_CONFIG.description,
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: SITE_CONFIG.name }],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: { canonical: SITE_CONFIG.url },
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: SITE_CONFIG.name,
            description: SITE_CONFIG.description,
            url: SITE_CONFIG.url,
            applicationCategory: 'ProductivityApplication',
            operatingSystem: 'Web',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'CNY' },
          }),
        }}
      />

      <style
        dangerouslySetInnerHTML={{
          __html: `*{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}.fade-in{animation:f .6s ease-out forwards}@keyframes f{to{opacity:1}}.fade-in{opacity:0}.fade-in-1{animation-delay:.1s}.fade-in-2{animation-delay:.2s}.fade-in-3{animation-delay:.3s}.slide-in{animation:s .25s cubic-bezier(.4,0,.2,1)}@keyframes s{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}@media(prefers-reduced-motion:reduce){*{animation:none!important;opacity:1!important}}`,
        }}
      />

      <div
        className="min-h-screen bg-gradient-to-br from-white via-violet-50/20 to-purple-50/10"
        style={{
          background:
            'linear-gradient(135deg, #fff 0%, rgba(245,243,255,.2) 50%, rgba(250,245,255,.1) 100%), radial-gradient(circle 600px at 25% 0%, rgba(167,139,250,.15), transparent), radial-gradient(circle 700px at 75% 100%, rgba(192,132,252,.12), transparent)',
        }}
      >
        <Header />

        {/* Hero */}
        <section className="px-6 flex items-center justify-center min-h-[calc(100vh-120px)]">
          <div className="max-w-7xl mx-auto text-center w-full mb-12 fade-in">
            <div className="inline-flex items-center gap-2 bg-violet-50 text-violet-700 px-4 py-2 rounded-full border border-violet-200 mb-6">
              <Sparkles className="h-4 w-4 text-violet-500" />
              <span className="text-sm font-medium">基于 Tiptap + Yjs 构建的 AI 写作平台</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight fade-in fade-in-1">
              <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent">
                {SITE_CONFIG.name}
              </span>
              <br />
              <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                {SITE_CONFIG.tagline}
              </span>
            </h1>

            <p className="text-lg text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed fade-in fade-in-2">
              基于 Tiptap + Yjs 构建的新一代智能协作编辑器,集成 AI 续写、RAG 知识库检索、AI
              播客生成等核心功能。支持多人实时协作编辑,让团队像使用 Google Docs
              一样流畅协作,同时拥有强大的 AI 能力加持。
            </p>

            <Link
              href={SITE_CONFIG.dashboardUrl}
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 hover:from-violet-500 hover:via-purple-500 hover:to-pink-500 text-white text-lg font-semibold rounded-2xl shadow-2xl hover:shadow-violet-500/40 transition-all hover:scale-105 active:scale-95 fade-in fade-in-3"
            >
              <Sparkles className="h-5 w-5" />
              <span>开始创作</span>
              <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-20 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                DocFlow
                <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {' '}
                  核心能力矩阵
                </span>
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                九大核心功能模块,构建完整的 AI 驱动内容创作生态系统
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {FEATURES.map((feature) => {
                const Icon = feature.icon;

                return (
                  <article key={feature.title} className="group">
                    <div
                      className={`${feature.bgColor} rounded-2xl border-2 ${feature.borderColor} ${feature.hoverBorder} p-6 h-full transition-all hover:shadow-xl hover:-translate-y-1`}
                    >
                      <div
                        className={`h-1 bg-gradient-to-r ${feature.gradient} -mx-6 -mt-6 mb-6`}
                      />
                      <div className="flex justify-center mb-4">
                        <div
                          className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-3`}
                        >
                          <Icon className="h-7 w-7 text-white" />
                        </div>
                      </div>
                      <h3 className={`text-xl font-bold ${feature.textColor} mb-3 text-center`}>
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed text-center group-hover:text-gray-700 transition-colors">
                        {feature.description}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="px-6 py-24 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl mb-6 shadow-lg">
                <Users className="w-8 h-8 text-white" />
              </div>

              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                加入{' '}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {SITE_CONFIG.name}
                </span>{' '}
                社区
              </h2>

              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                与全球开发者一起探索 AI 写作的无限可能
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {CONTACT_METHODS.map((contact) => {
                const Icon =
                  contact.type === 'wechat'
                    ? MessageCircle
                    : contact.type === 'github'
                      ? Github
                      : Zap;

                return (
                  <a
                    key={contact.type}
                    href={contact.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`group p-6 bg-white border-2 border-gray-200 rounded-2xl ${contact.hoverBorder} ${contact.hoverShadow} transition-all hover:shadow-2xl hover:-translate-y-1`}
                  >
                    <div
                      className={`flex items-center justify-center w-12 h-12 bg-gradient-to-r ${contact.gradient} rounded-xl mb-4 shadow-lg group-hover:scale-110 transition-transform`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{contact.title}</h3>
                    <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                      {contact.description}
                    </p>
                    <span
                      className={`block w-full px-4 py-2.5 text-center bg-gradient-to-r ${contact.gradient} text-white text-sm font-medium rounded-xl shadow-lg transition-all group-hover:opacity-90 group-hover:-translate-y-0.5 group-hover:scale-105`}
                    >
                      {contact.buttonText}
                    </span>
                  </a>
                );
              })}
            </div>

            <div className="text-center mt-12 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-600 font-medium mb-2">{SITE_CONFIG.name} Community</p>
              <p className="text-xs text-gray-500">共同构建下一代智能写作平台</p>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
