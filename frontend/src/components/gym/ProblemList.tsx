'use client';

import { useRouter } from 'next/navigation';
import { ProblemSummary } from '@/types/gym';
import { ProblemCard } from './ProblemCard';
import { Skeleton } from '@/components/ui/skeleton';

interface ProblemListProps {
  problems: ProblemSummary[];
  gymId: string;
  isLoading?: boolean;
}

export function ProblemList({ problems, gymId, isLoading }: ProblemListProps) {
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  if (problems.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        尚無題目
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {problems.map((problem) => (
        <ProblemCard
          key={problem.id}
          problem={problem}
          gymId={gymId}
          onClick={() => router.push(`/gyms/${gymId}/problems/${problem.id}`)}
        />
      ))}
    </div>
  );
}
