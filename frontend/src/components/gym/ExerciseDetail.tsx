'use client';

import { useProblem } from '@/hooks/useProblem';
import { useSubmissionHistory } from '@/hooks/useSubmissionHistory';
import { SubmissionUpload } from './SubmissionUpload';
import { SubmissionHistory } from './SubmissionHistory';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Submission } from '@/types/gym';

interface ExerciseDetailProps {
  exerciseId: string;
  gymId: string;
}

const difficultyColors: Record<number, string> = {
  1: 'bg-green-100 text-green-800',
  2: 'bg-yellow-100 text-yellow-800',
  3: 'bg-red-100 text-red-800',
};

const difficultyLabels: Record<number, string> = {
  1: '簡單',
  2: '中等',
  3: '困難',
};

export function ExerciseDetail({ exerciseId, gymId }: ExerciseDetailProps) {
  const { problem, isLoading, error, refetch } = useProblem(exerciseId);
  const { submissions, refetch: refetchSubmissions } = useSubmissionHistory(exerciseId);

  const handleUploadSuccess = () => {
    refetch();
    refetchSubmissions();
  };

  const handleDownload = async (submission: Submission) => {
    try {
      window.open(submission.fileUrl, '_blank');
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  if (isLoading) {
    return <ExerciseDetailSkeleton />;
  }

  if (error || !problem) {
    return (
      <div className="text-red-500 p-4">
        Error loading exercise: {error?.message || 'Not found'}
      </div>
    );
  }

  const actualGymId = gymId || problem.gymId;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/gyms/${actualGymId}`}>
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
              {problem.title}
            </CardTitle>
            <Badge className={cn(difficultyColors[problem.difficulty] || 'bg-gray-100 text-gray-800')}>
              {difficultyLabels[problem.difficulty] || '未知'}
            </Badge>
          </div>
          {problem.description && (
            <CardDescription className="mt-2 whitespace-pre-wrap">
              {problem.description}
            </CardDescription>
          )}
        </CardHeader>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <SubmissionUpload
          problemId={exerciseId}
          submissionTypes={problem.submissionTypes}
          onSuccess={handleUploadSuccess}
        />
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
