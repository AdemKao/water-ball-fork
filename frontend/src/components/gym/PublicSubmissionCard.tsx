'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { FileText, Download, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PublicSubmission, ReviewStatus } from '@/types/gym';
import { ReviewDisplay } from './ReviewDisplay';

interface PublicSubmissionCardProps {
  submission: PublicSubmission;
  onDownload?: () => void;
  showProblemLink?: boolean;
}

const reviewStatusConfig: Record<ReviewStatus, { icon: typeof CheckCircle; color: string; bgColor: string; label: string }> = {
  APPROVED: { icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-100', label: '通過' },
  NEEDS_REVISION: { icon: AlertCircle, color: 'text-orange-600', bgColor: 'bg-orange-100', label: '需修改' },
};

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

function getInitials(name: string): string {
  return name.charAt(0).toUpperCase();
}

export function PublicSubmissionCard({
  submission,
  onDownload,
  showProblemLink = true,
}: PublicSubmissionCardProps) {
  const reviewConfig = submission.review
    ? reviewStatusConfig[submission.review.status]
    : null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={submission.userAvatarUrl ?? undefined} alt={submission.userName} />
              <AvatarFallback>{getInitials(submission.userName)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{submission.userName}</div>
              <div className="text-sm text-muted-foreground">
                {formatDate(submission.submittedAt)}
              </div>
            </div>
          </div>

          {reviewConfig && (
            <Badge
              variant="secondary"
              className={cn('flex items-center gap-1', reviewConfig.bgColor, reviewConfig.color)}
            >
              <reviewConfig.icon className="h-3 w-3" />
              {reviewConfig.label}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {showProblemLink && (
          <div className="block text-sm">
            <span className="text-muted-foreground">{submission.gymTitle}</span>
            <span className="mx-2 text-muted-foreground">/</span>
            <span className="font-medium">{submission.problemTitle}</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="h-4 w-4" />
            <span className="truncate max-w-[200px]">{submission.fileName}</span>
          </div>

          {onDownload && (
            <Button variant="ghost" size="sm" onClick={onDownload}>
              <Download className="h-4 w-4 mr-1" />
              下載
            </Button>
          )}
        </div>

        {submission.review && (
          <ReviewDisplay
            review={{
              id: '',
              content: submission.review.content,
              status: submission.review.status,
              reviewedAt: submission.review.reviewedAt,
              reviewerName: submission.review.reviewerName,
            }}
          />
        )}
      </CardContent>
    </Card>
  );
}

export function PublicSubmissionCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
            <div className="space-y-1">
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              <div className="h-3 w-16 bg-muted animate-pulse rounded" />
            </div>
          </div>
          <div className="h-5 w-12 bg-muted animate-pulse rounded" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-4 w-48 bg-muted animate-pulse rounded" />
        <div className="h-4 w-32 bg-muted animate-pulse rounded" />
      </CardContent>
    </Card>
  );
}
