'use client';

import { ProblemSummary } from '@/types/gym';
import { ProblemCard } from './ProblemCard';

interface ExerciseListProps {
  gymId: string;
  problems: ProblemSummary[];
  isPurchased?: boolean;
}

export function ExerciseList({ gymId, problems, isPurchased = false }: ExerciseListProps) {
  if (problems.length === 0) {
    return <div className="text-muted-foreground p-4">No exercises available.</div>;
  }

  return (
    <div className="space-y-4">
      {problems.map((problem) => (
        <ProblemCard
          key={problem.id}
          problem={problem}
          gymId={gymId}
          isPurchased={isPurchased}
        />
      ))}
    </div>
  );
}
