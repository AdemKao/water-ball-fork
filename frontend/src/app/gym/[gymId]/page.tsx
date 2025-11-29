'use client';

import { use } from 'react';
import { ExerciseList } from '@/components/gym';

interface GymPageProps {
  params: Promise<{ gymId: string }>;
}

export default function GymPage({ params }: GymPageProps) {
  const { gymId } = use(params);
  const gymIdNumber = parseInt(gymId, 10);

  return (
    <div className="container mx-auto py-8 px-4">
      <ExerciseList gymId={gymIdNumber} />
    </div>
  );
}
