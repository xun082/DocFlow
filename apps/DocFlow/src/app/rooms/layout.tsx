import './styles/globals.css';
import '@livekit/components-styles';
import '@livekit/components-styles/prefabs';
import type { Metadata, Viewport } from 'next';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: {
    default: 'FlowSync Video | Real-time video collaboration',
    template: '%s',
  },
  description: 'FlowSync Video - Real-time video collaboration powered by LiveKit and NestJS',
  icons: {
    icon: {
      rel: 'icon',
      url: '/favicon.ico',
    },
  },
};

export const viewport: Viewport = {
  themeColor: '#070707',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full">
      <Toaster />
      {children}
    </div>
  );
}
