'use client';

import { PublicSubmission } from '@/types/gym';
import { PublicSubmissionCard, PublicSubmissionCardSkeleton } from './PublicSubmissionCard';

interface PublicSubmissionListProps {
  submissions: PublicSubmission[];
  onDownload?: (submission: PublicSubmission) => void;
  showProblemLink?: boolean;
  isLoading?: boolean;
  emptyMessage?: string;
}

export function PublicSubmissionList({
  submissions,
  onDownload,
  showProblemLink = true,
  isLoading = false,
  emptyMessage = '目前沒有公開的作業',
}: PublicSubmissionListProps) {
  if (isLoading) {
    return <PublicSubmissionListSkeleton />;
  }

  if (submissions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {submissions.map((submission) => (
        <PublicSubmissionCard
          key={submission.id}
          submission={submission}
          showProblemLink={showProblemLink}
          onDownload={onDownload ? () => onDownload(submission) : undefined}
        />
      ))}
    </div>
  );
}

function PublicSubmissionListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <PublicSubmissionCardSkeleton key={i} />
      ))}
    </div>
  );
}
