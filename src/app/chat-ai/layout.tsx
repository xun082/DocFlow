import type { Metadata } from 'next';

/**
 * Chat AI 页面布局
 *
 * 关于 Next.js App Router 中的 layout 和 page:
 *
 * 【Layout 的作用】
 * - layout.tsx 是该路由及其所有子路由的共享布局
 * - 它在导航时保持状态，不会重新渲染
 * - 适合放置导航栏、侧边栏等持久性 UI 元素
 *
 * 【Page 的作用】
 * - page.tsx 是该路由的实际页面内容
 * - 每次导航到该路由时都会重新渲染
 *
 * 【嵌套规则】
 * - Layout 会自动包裹同级的 page.tsx 和所有子文件夹的内容
 * - 子文件夹可以有自己的 layout.tsx，会嵌套在父 layout 内部
 *
 * 【本项目结构示例】
 * src/app/chat-ai/
 * ├── layout.tsx     <- 当前文件，定义 chat-ai 的布局
 * ├── page.tsx       <- 主聊天页面
 * └── components/    <- 页面组件
 *
 * 【如何新建子路由】
 * 如果要创建 /chat-ai/history 路由：
 * 1. 创建 src/app/chat-ai/history/page.tsx
 * 2. （可选）创建 src/app/chat-ai/history/layout.tsx 作为子布局
 */

export const metadata: Metadata = {
  title: 'AI 聊天助手 | DocFlow',
  description: '使用 AI 模型进行智能对话，支持多模型对比',
};

interface ChatAILayoutProps {
  children: React.ReactNode;
}

export default function ChatAILayout({ children }: ChatAILayoutProps) {
  return (
    <div className="h-full w-full bg-white" suppressHydrationWarning>
      {children}
    </div>
  );
}
