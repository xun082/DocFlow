import { Suspense } from 'react';

import PodcastPageContent from './_components/PodcastPageContent';
import { PodcastListSkeleton } from './_components/PodcastListSkeleton';

const PodcastPage = () => {
  return (
    <Suspense
      fallback={
        <div className="max-w-6xl mx-auto p-4">
          <PodcastListSkeleton />
        </div>
      }
    >
      <PodcastPageContent />
    </Suspense>
  );
};

export default PodcastPage;
