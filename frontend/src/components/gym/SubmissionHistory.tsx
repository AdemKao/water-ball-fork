'use client';

import { Submission } from '@/types/gym';
import { SubmissionCard } from './SubmissionCard';
import { Skeleton } from '@/components/ui/skeleton';

interface SubmissionHistoryProps {
  submissions: Submission[];
  onVisibilityChange?: (submissionId: string, isPublic: boolean) => void;
  onDownload?: (submission: Submission) => void;
  showVisibilityToggle?: boolean;
  isLoading?: boolean;
}

export function SubmissionHistory({
  submissions,
  onVisibilityChange,
  onDownload,
  showVisibilityToggle = true,
  isLoading = false,
}: SubmissionHistoryProps) {
  if (isLoading) {
    return <SubmissionHistorySkeleton />;
  }

  if (submissions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        尚未提交任何作業
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">提交歷史 ({submissions.length})</h3>
      <div className="space-y-3">
        {submissions.map((submission) => (
          <SubmissionCard
            key={submission.id}
            submission={submission}
            showVisibilityToggle={showVisibilityToggle}
            onVisibilityChange={
              onVisibilityChange
                ? (isPublic) => onVisibilityChange(submission.id, isPublic)
                : undefined
            }
            onDownload={onDownload ? () => onDownload(submission) : undefined}
          />
        ))}
      </div>
    </div>
  );
}

function SubmissionHistorySkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-7 w-32" />
      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="border rounded-lg p-4 space-y-3">
            <div className="flex justify-between">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-16" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    </div>
  );
}
