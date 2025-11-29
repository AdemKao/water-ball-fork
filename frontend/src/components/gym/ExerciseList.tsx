'use client';

import { useGymExercises } from '@/hooks/useGymExercise';
import { GymExercise, Difficulty, SubmissionStatus } from '@/types/gym';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, XCircle, FileText } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface ExerciseListProps {
  gymId: number;
}

const difficultyColors: Record<Difficulty, string> = {
  EASY: 'bg-green-100 text-green-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HARD: 'bg-red-100 text-red-800',
};

const difficultyLabels: Record<Difficulty, string> = {
  EASY: '簡單',
  MEDIUM: '中等',
  HARD: '困難',
};

export function ExerciseList({ gymId }: ExerciseListProps) {
  const { exercises, loading, error } = useGymExercises(gymId);

  if (loading) {
    return <div className="flex justify-center p-8">Loading exercises...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">Error: {error.message}</div>;
  }

  if (exercises.length === 0) {
    return <div className="text-muted-foreground p-4">No exercises available.</div>;
  }

  return (
    <div className="space-y-4">
      {exercises.map((exercise) => (
        <ExerciseCard key={exercise.id} exercise={exercise} gymId={gymId} />
      ))}
    </div>
  );
}

interface ExerciseCardProps {
  exercise: GymExercise;
  gymId: number;
}

function ExerciseCard({ exercise, gymId }: ExerciseCardProps) {
  const statusIcon = getStatusIcon(exercise.latestSubmissionStatus);

  return (
    <Link href={`/exercises/${exercise.id}?gymId=${gymId}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-lg">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              <span>{exercise.title}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={cn(difficultyColors[exercise.difficulty])}>
                {difficultyLabels[exercise.difficulty]}
              </Badge>
              {statusIcon}
            </div>
          </CardTitle>
        </CardHeader>
        {exercise.description && (
          <CardContent>
            <p className="text-muted-foreground text-sm">{exercise.description}</p>
          </CardContent>
        )}
      </Card>
    </Link>
  );
}

function getStatusIcon(status?: SubmissionStatus) {
  if (!status) return null;

  switch (status) {
    case 'APPROVED':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'PENDING':
      return <Clock className="h-5 w-5 text-yellow-500" />;
    case 'REJECTED':
      return <XCircle className="h-5 w-5 text-red-500" />;
    default:
      return null;
  }
}
