'use client';

import { useState, useEffect } from 'react';
import {
  FileEdit,
  Menu,
  X,
  BarChart2,
  Target,
  TrendingUp,
  Users,
  GitBranch,
  MessageSquare,
  Lock,
  Shield,
  RefreshCw,
  CheckCircle,
  Plus,
  Minus,
  Star,
  Globe,
  FileText,
  Github,
  Twitter,
  Mail,
} from 'lucide-react';

// ─── Data ─────────────────────────────────────────────────────────────────────

const SITE = {
  name: 'DocFlow',
  url: 'https://www.codecrack.cn',
  description: '智能文档协作平台，让写作与团队协同更高效。',
};

const NAV_ITEMS = [
  { text: '功能特性', url: '#features' },
  { text: '价格方案', url: '#pricing' },
  { text: '用户评价', url: '#testimonials' },
];

const BENEFITS = [
  {
    title: 'AI 智能写作',
    description:
      '内置强大的 AI 写作助手，支持智能续写、内容改写与创意激发。无论是日报、报告还是创意内容，都能高效产出。',
    mockup: 'editor' as const,
    bullets: [
      {
        Icon: BarChart2,
        title: '智能内容补全',
        desc: '基于上下文理解，自动给出高质量的写作建议与续写内容。',
      },
      {
        Icon: Target,
        title: '自定义写作目标',
        desc: '设定风格、语气和字数目标，让 AI 按你的要求精准输出。',
      },
      {
        Icon: TrendingUp,
        title: '多轮对话润色',
        desc: '通过对话式交互持续优化文章，直到满意为止。',
      },
    ],
  },
  {
    title: '实时多人协作',
    description:
      '基于 Yjs CRDT 算法实现零冲突的实时协作编辑，支持多人同时在线修改，所有变更即时同步，团队效率倍增。',
    mockup: 'collab' as const,
    bullets: [
      {
        Icon: Users,
        title: '多人同步编辑',
        desc: '多位团队成员可同时编辑同一文档，操作实时可见。',
      },
      {
        Icon: GitBranch,
        title: '完整版本历史',
        desc: '每次修改均自动记录，随时一键回溯到任意历史版本。',
      },
      {
        Icon: MessageSquare,
        title: '评论与反馈',
        desc: '在文档任意位置添加评论，方便团队沟通与审阅。',
      },
    ],
  },
  {
    title: '安全可靠存储',
    description:
      '采用企业级数据加密方案，完善的权限管理体系，配合自动云端备份，让你的文档资产始终安全无忧。',
    mockup: 'security' as const,
    bullets: [
      { Icon: Lock, title: '端到端数据加密', desc: '传输与存储全程加密，你的数据只有你能看到。' },
      {
        Icon: Shield,
        title: '细粒度权限控制',
        desc: '对每个文档、每位成员精准设置查看、编辑或管理权限。',
      },
      {
        Icon: RefreshCw,
        title: '自动备份恢复',
        desc: '增量备份实时运行，即使意外发生也能秒速恢复文档。',
      },
    ],
  },
];

const TIERS = [
  {
    name: '免费版',
    price: 0,
    features: [
      '最多 3 个文档',
      '基础 AI 写作（每月 50 次）',
      '单人使用',
      '云端自动保存',
      '邮件支持',
    ],
  },
  {
    name: '专业版',
    price: 99,
    features: [
      '无限文档数量',
      '高级 AI 写作（无限次）',
      '最多 10 人协作',
      '完整版本历史',
      '优先客服支持',
      '自定义域名',
    ],
  },
  {
    name: '企业版',
    price: -1,
    features: [
      '无限文档 & 空间',
      '专属 AI 模型微调',
      '无限成员数量',
      '私有化部署支持',
      '专属客户成功经理',
      '定制化培训服务',
    ],
  },
];

const FAQS = [
  {
    q: 'DocFlow 支持哪些文档格式？',
    a: 'DocFlow 支持 Markdown、富文本（WYSIWYG）、导入导出 Word/PDF 格式。内置的 Tiptap 编辑器提供超过 50 种内容块，满足绝大多数文档场景需求。',
  },
  {
    q: '实时协作最多支持多少人？',
    a: '基于 Yjs CRDT 算法，理论上支持无限人数同时协作编辑。专业版支持 10 人，企业版支持无限成员，零冲突实时同步。',
  },
  {
    q: 'AI 写作助手使用什么模型？',
    a: 'DocFlow 集成了主流大语言模型（包括 GPT-4、Claude 等），并通过 RAG 知识库增强，让 AI 能结合你的文档上下文给出更精准的建议。',
  },
  {
    q: '我的文档数据安全吗？',
    a: '完全安全。所有数据在传输和存储过程中均采用 AES-256 加密。我们不会将你的数据用于模型训练，企业版还支持私有化本地部署。',
  },
  {
    q: '可以免费试用吗？',
    a: '当然！免费版永久有效，无需绑定信用卡。你可以立即注册体验基础功能，随时升级到专业版解锁全部能力。',
  },
];

const TESTIMONIALS = [
  {
    name: '张伟',
    role: '某互联网公司产品总监',
    initials: '张',
    message:
      'DocFlow 的 AI 写作功能让我们的产品文档效率提升了 3 倍，实时协作功能更是彻底取代了我们之前繁琐的邮件来回流程。',
  },
  {
    name: '李晓梅',
    role: '独立内容创作者',
    initials: '李',
    message:
      '用了很多编辑器，DocFlow 是唯一让我感觉"在用未来工具"的产品。AI 续写和改写功能真的极大提升了我的创作效率。',
  },
  {
    name: '王建国',
    role: '技术团队负责人',
    initials: '王',
    message:
      '基于 Yjs 的协作体验非常丝滑，零延迟、零冲突，我们整个研发团队的文档协作效率得到了质的提升。强烈推荐！',
  },
];

const STATS = [
  {
    title: '10 万+',
    Icon: FileText,
    cls: 'text-violet-600',
    desc: '每日新建文档数，用户覆盖个人创作者、企业团队与高校师生。',
  },
  {
    title: '4.9 分',
    Icon: Star,
    cls: 'text-yellow-500',
    desc: '用户综合评分，持续保持在各平台同类产品最高水平。',
  },
  {
    title: '50+',
    Icon: Globe,
    cls: 'text-green-600',
    desc: '国家与地区的用户正在使用 DocFlow 管理他们的文档资产。',
  },
];

const BRANDS = ['Notion', 'Stripe', 'Dropbox', 'Shopify', 'Slack', 'Linear'];

// ─── Mockups ──────────────────────────────────────────────────────────────────

function EditorMockup() {
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden w-full max-w-sm mx-auto">
      <div className="flex items-center gap-1.5 px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div className="w-3 h-3 rounded-full bg-red-400" />
        <div className="w-3 h-3 rounded-full bg-yellow-400" />
        <div className="w-3 h-3 rounded-full bg-green-400" />
        <span className="ml-3 text-xs text-gray-400">AI 写作助手</span>
      </div>
      <div className="p-5 space-y-3">
        <div className="h-4 w-3/5 rounded bg-gray-800" />
        <div className="space-y-1.5">
          <div className="h-2.5 w-full rounded bg-gray-200" />
          <div className="h-2.5 w-11/12 rounded bg-gray-200" />
          <div className="h-2.5 w-4/5 rounded bg-gray-200" />
        </div>
        <div className="rounded-lg bg-violet-50 border border-violet-200 p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-violet-500" />
            <span className="text-xs font-medium text-violet-700">AI 续写建议</span>
          </div>
          <div className="space-y-1">
            <div className="h-2 w-full rounded bg-violet-200" />
            <div className="h-2 w-4/5 rounded bg-violet-200" />
          </div>
          <div className="flex gap-2 mt-3">
            <div className="h-6 w-16 rounded-full bg-violet-500 opacity-80" />
            <div className="h-6 w-16 rounded-full bg-gray-200" />
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="h-2.5 w-full rounded bg-gray-200" />
          <div className="h-2.5 w-11/12 rounded bg-gray-200" />
        </div>
      </div>
    </div>
  );
}

function CollabMockup() {
  const users = [
    { color: '#7c3aed', name: 'A', label: '张三正在编辑第 3 段...' },
    { color: '#059669', name: 'B', label: '李四正在评论...' },
    { color: '#d97706', name: 'C', label: '王五已查看' },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden w-full max-w-sm mx-auto">
      <div className="flex items-center gap-1.5 px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div className="w-3 h-3 rounded-full bg-red-400" />
        <div className="w-3 h-3 rounded-full bg-yellow-400" />
        <div className="w-3 h-3 rounded-full bg-green-400" />
        <span className="ml-3 text-xs text-gray-400">实时协作 · 3 人在线</span>
        <div className="ml-auto flex -space-x-1">
          {users.map((u) => (
            <div
              key={u.name}
              className="w-5 h-5 rounded-full border-2 border-white text-white text-[8px] font-bold flex items-center justify-center"
              style={{ backgroundColor: u.color }}
            >
              {u.name}
            </div>
          ))}
        </div>
      </div>
      <div className="p-5 space-y-3">
        <div className="h-4 w-3/5 rounded bg-gray-800" />
        <div className="space-y-1.5">
          <div className="h-2.5 w-full rounded bg-gray-200" />
          <div className="h-2.5 w-11/12 rounded bg-gray-200" />
        </div>
        <div className="space-y-2 mt-4">
          {users.map((u) => (
            <div key={u.name} className="flex items-center gap-2">
              <div
                className="w-5 h-5 rounded-full text-white text-[8px] font-bold flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: u.color }}
              >
                {u.name}
              </div>
              <span className="text-xs text-gray-500">{u.label}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-1.5 p-2 bg-green-50 rounded-lg">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-xs text-green-700 font-medium">所有更改已实时同步</span>
        </div>
      </div>
    </div>
  );
}

function SecurityMockup() {
  const rows = [
    { label: '查看权限', on: true },
    { label: '编辑权限', on: true },
    { label: '管理权限', on: false },
    { label: '分享权限', on: false },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden w-full max-w-sm mx-auto">
      <div className="flex items-center gap-1.5 px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div className="w-3 h-3 rounded-full bg-red-400" />
        <div className="w-3 h-3 rounded-full bg-yellow-400" />
        <div className="w-3 h-3 rounded-full bg-green-400" />
        <span className="ml-3 text-xs text-gray-400">权限管理</span>
      </div>
      <div className="p-5 space-y-3">
        {rows.map(({ label, on }) => (
          <div
            key={label}
            className="flex items-center justify-between py-2 border-b border-gray-100"
          >
            <span className="text-sm text-gray-600">{label}</span>
            <div
              className={`w-10 h-5 rounded-full flex items-center px-0.5 ${on ? 'bg-violet-500 justify-end' : 'bg-gray-200 justify-start'}`}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow" />
            </div>
          </div>
        ))}
        <div className="p-2 bg-violet-50 rounded-lg">
          <span className="text-xs text-violet-700 font-medium">🔒 AES-256 加密已启用</span>
        </div>
      </div>
    </div>
  );
}

function HeroMockup() {
  const avatarColors = ['#7c3aed', '#059669', '#d97706'];

  return (
    <div className="relative w-full max-w-sm mx-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
        <div className="flex items-center gap-1.5 px-4 py-3 bg-gray-50 border-b border-gray-200">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
          <span className="ml-3 text-xs text-gray-400">产品需求文档.docflow</span>
        </div>
        <div className="px-6 py-5 space-y-3">
          <div className="h-5 w-4/5 rounded bg-gray-800" />
          <div className="space-y-1.5">
            <div className="h-2.5 w-full rounded bg-gray-200" />
            <div className="h-2.5 w-11/12 rounded bg-gray-200" />
            <div className="h-2.5 w-4/5 rounded bg-gray-200" />
          </div>
          <div className="rounded-lg bg-violet-50 border border-violet-200 p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 rounded-full bg-violet-500 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white" />
              </div>
              <span className="text-xs font-medium text-violet-700">AI 建议</span>
            </div>
            <div className="space-y-1">
              <div className="h-2 w-full rounded bg-violet-200" />
              <div className="h-2 w-3/4 rounded bg-violet-200" />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 px-6 pb-4">
          {avatarColors.map((color, i) => (
            <div
              key={color}
              className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-white text-[9px] font-bold"
              style={{ backgroundColor: color, marginLeft: i > 0 ? '-6px' : undefined }}
            >
              {['A', 'B', 'C'][i]}
            </div>
          ))}
          <span className="ml-2 text-xs text-gray-400">3 人正在协作</span>
        </div>
      </div>
      <div className="absolute -right-4 top-20 bg-white rounded-xl shadow-lg border border-gray-100 px-3 py-2 flex items-center gap-2 text-xs font-medium text-gray-700 whitespace-nowrap">
        <div className="w-2 h-2 rounded-full bg-green-400" />
        已实时同步
      </div>
    </div>
  );
}

// ─── Sections ─────────────────────────────────────────────────────────────────

function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [activeHash, setActiveHash] = useState('');

  useEffect(() => {
    const handleHashChange = () => {
      setActiveHash(window.location.hash);
    };

    handleHashChange();

    window.addEventListener('hashchange', handleHashChange);

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-100">
      <div className="px-5 max-w-7xl mx-auto flex items-center justify-between h-16">
        <a href="/" className="flex items-center gap-2 font-bold text-xl text-gray-900">
          <FileEdit size={24} className="text-violet-600" />
          {SITE.name}
        </a>
        <nav className="hidden md:flex items-center gap-8">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.url}
              href={item.url}
              className={`text-base transition-colors ${
                activeHash === item.url
                  ? 'text-violet-600 font-medium'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {item.text}
            </a>
          ))}
        </nav>
        <div className="hidden md:flex items-center gap-3">
          <a href="/auth" className="text-sm text-gray-600 hover:text-gray-900 px-4 py-2">
            登录
          </a>
          <a
            href="/auth"
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
              className={`text-base transition-colors ${
                activeHash === item.url
                  ? 'text-violet-600 font-medium'
                  : 'text-gray-700 hover:text-violet-600'
              }`}
            >
              {item.text}
            </a>
          ))}
          <div className="flex flex-col gap-3 pt-2 border-t border-gray-100">
            <a href="/auth" className="text-base text-gray-600">
              登录
            </a>
            <a
              href="/auth"
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

function Hero() {
  return (
    <section className="relative pt-28 pb-16 bg-[#F3F3F5] overflow-hidden">
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            'linear-gradient(rgba(124,58,237,.08) 1px,transparent 1px),linear-gradient(90deg,rgba(124,58,237,.08) 1px,transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#F3F3F5] to-transparent" />
      <div className="relative px-5 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
        <div className="flex-1 text-center lg:text-left">
          <h1 className="text-4xl lg:text-6xl font-bold leading-tight text-gray-900">
            智能、高效、简洁的文档协作平台
          </h1>
          <p className="mt-6 text-lg text-gray-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
            基于 Tiptap + Yjs 构建，支持实时多人协作、AI
            智能写作与丰富内容格式，让每一份文档都焕发生命力。
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <a
              href="/auth"
              className="inline-flex items-center justify-center bg-violet-600 text-white font-semibold px-7 py-3.5 rounded-full hover:bg-violet-700 transition-colors"
            >
              免费开始使用
            </a>
            <a
              href="#features"
              className="inline-flex items-center justify-center bg-white text-gray-800 font-semibold px-7 py-3.5 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              了解更多功能
            </a>
          </div>
        </div>
        <div className="flex-1 w-full max-w-md lg:max-w-none">
          <HeroMockup />
        </div>
      </div>
    </section>
  );
}

function Logos() {
  return (
    <section className="py-12 bg-white border-y border-gray-100">
      <div className="px-5 max-w-7xl mx-auto text-center">
        <p className="text-sm font-medium text-gray-400 uppercase tracking-widest mb-8">
          被全球 2000+ 团队与个人创作者信赖
        </p>
        <div className="flex flex-wrap items-center justify-center gap-10">
          {BRANDS.map((b) => (
            <span
              key={b}
              className="text-lg font-bold text-gray-300 hover:text-gray-400 transition-colors tracking-tight"
            >
              {b}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function Benefits() {
  const mockupMap = { editor: EditorMockup, collab: CollabMockup, security: SecurityMockup };

  return (
    <section id="features" className="divide-y divide-gray-100">
      {BENEFITS.map((benefit, i) => {
        const MockupComp = mockupMap[benefit.mockup];

        return (
          <div
            key={benefit.title}
            className={`flex flex-col lg:flex-row items-center gap-12 py-14 ${i % 2 === 0 ? 'lg:flex-row-reverse' : ''}`}
          >
            <div className="flex-1 space-y-6">
              <h3 className="text-3xl lg:text-4xl font-bold text-gray-900">{benefit.title}</h3>
              <p className="text-lg text-gray-600 leading-relaxed">{benefit.description}</p>
              <div className="space-y-5">
                {benefit.bullets.map((b) => (
                  <div key={b.title} className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center">
                      <b.Icon size={22} />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{b.title}</h4>
                      <p className="text-base text-gray-500 mt-0.5">{b.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-1 w-full">
              <MockupComp />
            </div>
          </div>
        );
      })}
    </section>
  );
}

function Pricing() {
  return (
    <section id="pricing" className="py-16">
      <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-3">价格方案</h2>
      <p className="text-lg text-gray-600 mb-10">简单透明，无任何隐藏费用。按需选择，随时升级。</p>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {TIERS.map((tier, i) => {
          const hl = i === 1;
          const label = tier.price === 0 ? '免费注册' : tier.price === -1 ? '联系销售' : '立即升级';
          const priceDisplay =
            tier.price === 0 ? '免费' : tier.price === -1 ? '联系我们' : `¥${tier.price}`;

          return (
            <div
              key={tier.name}
              className={`rounded-2xl border p-8 flex flex-col gap-6 ${hl ? 'bg-violet-600 border-violet-600 shadow-2xl shadow-violet-200 scale-105' : 'bg-white border-gray-200 shadow-sm'}`}
            >
              {hl && (
                <span className="inline-block text-xs font-semibold bg-white/20 text-white px-3 py-1 rounded-full w-fit">
                  最受欢迎
                </span>
              )}
              <h3 className={`text-xl font-bold ${hl ? 'text-white' : 'text-gray-900'}`}>
                {tier.name}
              </h3>
              <div className="flex items-end gap-1">
                <span className={`text-4xl font-bold ${hl ? 'text-white' : 'text-gray-900'}`}>
                  {priceDisplay}
                </span>
                {tier.price > 0 && (
                  <span className={`text-base mb-1 ${hl ? 'text-violet-200' : 'text-gray-400'}`}>
                    /月
                  </span>
                )}
              </div>
              <a
                href={label === '免费注册' ? '/auth' : '#'}
                className={`block text-center py-3 rounded-full font-semibold text-sm transition-colors ${hl ? 'bg-white text-violet-700 hover:bg-violet-50' : 'bg-violet-600 text-white hover:bg-violet-700'}`}
              >
                {label}
              </a>
              <ul className="space-y-3">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <CheckCircle
                      size={18}
                      className={`flex-shrink-0 mt-0.5 ${hl ? 'text-violet-200' : 'text-violet-500'}`}
                    />
                    <span className={`text-sm ${hl ? 'text-violet-100' : 'text-gray-600'}`}>
                      {f}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section id="testimonials" className="py-16">
      <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-3">用户真实评价</h2>
      <p className="text-lg text-gray-600 mb-10">听听已经在使用 DocFlow 的用户怎么说。</p>
      <div className="grid gap-8 lg:grid-cols-3">
        {TESTIMONIALS.map((t) => (
          <div key={t.name} className="flex flex-col gap-4 p-6 bg-gray-50 rounded-2xl">
            <p className="text-base text-gray-600 leading-relaxed">"{t.message}"</p>
            <div className="flex items-center gap-3 mt-auto pt-4 border-t border-gray-200">
              <div className="w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center text-white font-bold text-base flex-shrink-0">
                {t.initials}
              </div>
              <div>
                <p className="font-semibold text-violet-700 text-sm">{t.name}</p>
                <p className="text-xs text-gray-500">{t.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section id="faq" className="py-16">
      <div className="grid lg:grid-cols-2 gap-12 items-start">
        <div>
          <h2 className="text-3xl lg:text-5xl font-bold text-gray-900">常见问题</h2>
          <p className="mt-4 text-lg text-gray-600">
            还有其他问题？随时联系我们：
            <a href="mailto:hello@codecrack.cn" className="text-violet-600 hover:underline ml-1">
              hello@codecrack.cn
            </a>
          </p>
        </div>
        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div key={faq.q} className="border border-gray-200 rounded-xl overflow-hidden">
              <button
                className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-gray-50 transition-colors"
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
              >
                <span className="font-semibold text-gray-900 text-base">{faq.q}</span>
                {openIdx === i ? (
                  <Minus size={18} className="flex-shrink-0 text-violet-600" />
                ) : (
                  <Plus size={18} className="flex-shrink-0 text-gray-500" />
                )}
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${openIdx === i ? 'max-h-48' : 'max-h-0'}`}
              >
                <p className="px-5 pb-4 text-base text-gray-600 leading-relaxed">{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Stats() {
  return (
    <section className="py-16">
      <div className="grid sm:grid-cols-3 gap-8">
        {STATS.map((s) => (
          <div
            key={s.title}
            className="flex flex-col items-center text-center gap-3 p-6 rounded-2xl bg-gray-50"
          >
            <s.Icon size={34} className={s.cls} />
            <h3 className="text-3xl font-semibold text-gray-900">{s.title}</h3>
            <p className="text-base text-gray-500">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="relative py-20 lg:py-28 rounded-3xl overflow-hidden bg-[#050a02] my-10 lg:my-20">
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,.15) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.15) 1px,transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 50%,rgba(124,58,237,.25),transparent)',
        }}
      />
      <div className="relative text-center px-5 max-w-2xl mx-auto">
        <h2 className="text-3xl lg:text-5xl font-bold text-white">
          加入超过 10 万用户，开启智能写作之旅
        </h2>
        <p className="mt-5 text-lg text-gray-300 leading-relaxed">
          你的高效文档创作之路从这里开始。立即免费注册 DocFlow，体验 AI 加持的协作编辑新方式！
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/auth"
            className="inline-flex items-center justify-center bg-violet-600 text-white font-semibold px-8 py-3.5 rounded-full hover:bg-violet-500 transition-colors"
          >
            立即免费注册
          </a>
          <a
            href="#features"
            className="inline-flex items-center justify-center bg-white/10 text-white font-semibold px-8 py-3.5 rounded-full hover:bg-white/20 transition-colors border border-white/20"
          >
            了解功能特性
          </a>
        </div>
      </div>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer className="bg-[#F3F3F5] border-t border-gray-200 pt-14 pb-8">
      <div className="px-5 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pb-10 border-b border-gray-200">
          <div>
            <a href="/" className="flex items-center gap-2 font-bold text-xl text-gray-900 mb-3">
              <FileEdit size={22} className="text-violet-600" />
              {SITE.name}
            </a>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs">{SITE.description}</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">快速导航</h4>
            <ul className="space-y-2">
              {NAV_ITEMS.map((item) => (
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
          <p>© 2025 {SITE.name}. 保留所有权利。</p>
          <p>
            由{' '}
            <a href={SITE.url} className="hover:text-violet-600 transition-colors">
              DocFlow Team
            </a>{' '}
            用心构建 ♥
          </p>
        </div>
      </div>
    </footer>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function Homepage() {
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      <Hero />
      <Logos />
      <div className="px-5 max-w-7xl mx-auto">
        <Benefits />
        <Pricing />
        <Testimonials />
        <FAQ />
        <Stats />
        <CTA />
      </div>
      <SiteFooter />
    </div>
  );
}
