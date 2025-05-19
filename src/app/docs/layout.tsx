'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const DynamicTabSidebar = dynamic(() => import('@/components/layout/TabSidebar'), {
  ssr: false,
});

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  if (!mounted) {
    return (
      <div className="flex h-screen" suppressHydrationWarning>
        <div className="flex-1 overflow-hidden">{children}</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen" suppressHydrationWarning>
      {mounted && <DynamicTabSidebar isOpen={isSidebarOpen} onClose={toggleSidebar} />}
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
