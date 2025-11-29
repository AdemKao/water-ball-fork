'use client';

import { use } from 'react';
import { useSearchParams } from 'next/navigation';
import { ExerciseDetail } from '@/components/gym';

interface ExercisePageProps {
  params: Promise<{ exerciseId: string }>;
}

export default function ExercisePage({ params }: ExercisePageProps) {
  const { exerciseId } = use(params);
  const searchParams = useSearchParams();
  const gymId = searchParams.get('gymId') || '0';

  return (
    <div className="container mx-auto py-8 px-4">
      <ExerciseDetail exerciseId={exerciseId} gymId={gymId} />
    </div>
  );
}
