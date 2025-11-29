'use client';

import { use } from 'react';
import { ExerciseDetail } from '@/components/gym';

interface ProblemPageProps {
  params: Promise<{ gymId: string; problemId: string }>;
}

export default function ProblemPage({ params }: ProblemPageProps) {
  const { gymId, problemId } = use(params);

  return (
    <div className="container mx-auto py-8 px-4">
      <ExerciseDetail exerciseId={problemId} gymId={gymId} />
    </div>
  );
}
