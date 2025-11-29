'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Swords } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { GymCard } from './GymCard';
import { Gym, GymType } from '@/types/gym';

interface GymListProps {
  gyms: Gym[];
  isLoading?: boolean;
  filterType?: 'ALL' | GymType;
  groupByJourney?: boolean;
}

export function GymList({
  gyms,
  isLoading = false,
  filterType = 'ALL',
  groupByJourney = true,
}: GymListProps) {
  const router = useRouter();

  const filteredGyms = useMemo(() => {
    if (filterType === 'ALL') return gyms;
    return gyms.filter((gym) => gym.type === filterType);
  }, [gyms, filterType]);

  const groupedGyms = useMemo(() => {
    if (!groupByJourney) return { '': filteredGyms };

    return filteredGyms.reduce((acc, gym) => {
      const key = gym.journeyTitle;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(gym);
      return acc;
    }, {} as Record<string, Gym[]>);
  }, [filteredGyms, groupByJourney]);

  if (isLoading) {
    return (
      <div className="space-y-8">
        {[1, 2].map((i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="h-6 w-48" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[1, 2, 3, 4].map((j) => (
                <Skeleton key={j} className="h-64 rounded-lg" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (filteredGyms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Swords className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">目前沒有道館</h3>
        <p className="text-sm text-muted-foreground">
          {filterType !== 'ALL' ? '嘗試切換篩選條件' : '尚無可用的道館'}
        </p>
      </div>
    );
  }

  const handleGymClick = (gymId: string) => {
    router.push(`/gyms/${gymId}`);
  };

  return (
    <div className="space-y-8">
      {Object.entries(groupedGyms).map(([journeyTitle, journeyGyms]) => (
        <div key={journeyTitle || 'all'} className="space-y-4">
          {journeyTitle && (
            <h2 className="text-xl font-semibold">{journeyTitle}</h2>
          )}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {journeyGyms.map((gym) => (
              <GymCard
                key={gym.id}
                gym={gym}
                onClick={() => handleGymClick(gym.id)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
