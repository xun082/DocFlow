import type { Metadata } from 'next';

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
