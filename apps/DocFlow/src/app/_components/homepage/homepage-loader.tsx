'use client';

import dynamic from 'next/dynamic';

const Homepage = dynamic(() => import('./home'), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-white" />,
});

export default function HomepageLoader() {
  return <Homepage />;
}
