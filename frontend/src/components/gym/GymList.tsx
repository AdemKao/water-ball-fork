'use client';

import { useGyms } from '@/hooks/useGym';
import { Gym } from '@/types/gym';
import { ProgressBar } from '@/components/course/ProgressBar';
import { Dumbbell } from 'lucide-react';
import Link from 'next/link';

interface GymListProps {
  journeyId: string;
}

export function GymList({ journeyId }: GymListProps) {
  const { gyms, isLoading, error } = useGyms(journeyId);

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading gyms...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">Error loading gyms: {error.message}</div>;
  }

  if (gyms.length === 0) {
    return <div className="text-muted-foreground p-4">No gyms available for this journey.</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Dumbbell className="h-6 w-6" />
        練習道場
      </h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {gyms.map((gym) => (
          <GymCard key={gym.id} gym={gym} />
        ))}
      </div>
    </div>
  );
}

interface GymCardProps {
  gym: Gym;
}

function GymCard({ gym }: GymCardProps) {
  const progress = gym.exerciseCount > 0 
    ? (gym.completedCount / gym.exerciseCount) * 100 
    : 0;

  return (
    <Link href={`/gym/${gym.id}`}>
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-lg">{gym.title}</h3>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground">
              {gym.completedCount}/{gym.exerciseCount}
            </span>
          </div>
          {gym.description && (
            <p className="text-muted-foreground text-sm mb-4">{gym.description}</p>
          )}
          <ProgressBar value={progress} size="sm" />
          <p className="text-xs text-muted-foreground mt-2">
            {progress.toFixed(0)}% 完成
          </p>
        </div>
      </div>
    </Link>
  );
}
