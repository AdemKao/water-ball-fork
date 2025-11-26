'use client';

import { useJourneyList } from '@/hooks/useJourneyList';
import { JourneyList } from '@/components/course';

export default function CoursesPage() {
  const { journeys, isLoading, error } = useJourneyList();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-destructive">無法載入課程列表</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">課程列表</h1>
      <JourneyList journeys={journeys} />
    </div>
  );
}
