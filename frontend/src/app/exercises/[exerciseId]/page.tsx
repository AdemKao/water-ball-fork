'use client';

import { use } from 'react';
import { useSearchParams } from 'next/navigation';
import { ExerciseDetail } from '@/components/gym';

interface ExercisePageProps {
  params: Promise<{ exerciseId: string }>;
}

export default function ExercisePage({ params }: ExercisePageProps) {
  const { exerciseId } = use(params);
  const exerciseIdNumber = parseInt(exerciseId, 10);
  const searchParams = useSearchParams();
  const gymId = parseInt(searchParams.get('gymId') || '0', 10);

  return (
    <div className="container mx-auto py-8 px-4">
      <ExerciseDetail exerciseId={exerciseIdNumber} gymId={gymId} />
    </div>
  );
}
