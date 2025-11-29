'use client';

import { useRouter } from 'next/navigation';
import { StageSummary } from '@/types/gym';
import { StageCard } from './StageCard';
import { Skeleton } from '@/components/ui/skeleton';

interface StageListProps {
  stages: StageSummary[];
  gymId: string;
  isPurchased: boolean;
  isLoading?: boolean;
}

export function StageList({ stages, gymId, isPurchased, isLoading }: StageListProps) {
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  if (stages.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        尚無關卡
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {stages.map((stage) => (
        <StageCard
          key={stage.id}
          stage={stage}
          gymId={gymId}
          isPurchased={isPurchased}
          onClick={() => router.push(`/gyms/${gymId}/stages/${stage.id}`)}
        />
      ))}
    </div>
  );
}
