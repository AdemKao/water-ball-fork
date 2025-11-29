'use client';

import { useExerciseDetail, useMySubmissions } from '@/hooks/useGym';
import { SubmissionUpload } from './SubmissionUpload';
import { SubmissionHistory } from './SubmissionHistory';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Difficulty } from '@/types/gym';
import { gymService } from '@/services/gym.service';

interface ExerciseDetailProps {
  exerciseId: number;
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

export function ExerciseDetail({ exerciseId, gymId }: ExerciseDetailProps) {
  const { exercise, isLoading, error, refetch } = useExerciseDetail(exerciseId);
  const { submissions, refetch: refetchSubmissions } = useMySubmissions(exerciseId);

  const handleUploadSuccess = () => {
    refetch();
    refetchSubmissions();
  };

  const handleDownload = async (submissionId: number) => {
    try {
      const blob = await gymService.downloadSubmission(submissionId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'submission';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  if (isLoading) {
    return <ExerciseDetailSkeleton />;
  }

  if (error || !exercise) {
    return (
      <div className="text-red-500 p-4">
        Error loading exercise: {error?.message || 'Not found'}
      </div>
    );
  }

  const actualGymId = gymId || exercise.gymId;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/gym/${actualGymId}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {exercise.title}
            </CardTitle>
            <Badge className={cn(difficultyColors[exercise.difficulty])}>
              {difficultyLabels[exercise.difficulty]}
            </Badge>
          </div>
          {exercise.description && (
            <CardDescription className="mt-2 whitespace-pre-wrap">
              {exercise.description}
            </CardDescription>
          )}
        </CardHeader>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <SubmissionUpload exerciseId={exerciseId} onSuccess={handleUploadSuccess} />
        <SubmissionHistory submissions={submissions} onDownload={handleDownload} />
      </div>
    </div>
  );
}

function ExerciseDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-32" />
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-4 w-full mt-2" />
        </CardHeader>
      </Card>
      <div className="grid gap-6 md:grid-cols-2">
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    </div>
  );
}
