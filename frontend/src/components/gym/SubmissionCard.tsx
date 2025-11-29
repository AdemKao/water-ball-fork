'use client';

import { FileText, Download, Eye, EyeOff, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Submission, SubmissionStatus } from '@/types/gym';
import { ReviewDisplay } from './ReviewDisplay';

interface SubmissionCardProps {
  submission: Submission;
  onVisibilityChange?: (isPublic: boolean) => void;
  onDownload?: () => void;
  showVisibilityToggle?: boolean;
}

const statusConfig: Record<SubmissionStatus, { icon: typeof Clock; color: string; bgColor: string; label: string }> = {
  PENDING: { icon: Clock, color: 'text-yellow-600', bgColor: 'bg-yellow-100', label: '待批改' },
  REVIEWED: { icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-100', label: '已批改' },
  NEEDS_REVISION: { icon: AlertCircle, color: 'text-orange-600', bgColor: 'bg-orange-100', label: '需修改' },
};

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function SubmissionCard({
  submission,
  onVisibilityChange,
  onDownload,
  showVisibilityToggle = true,
}: SubmissionCardProps) {
  const config = statusConfig[submission.status];
  const StatusIcon = config.icon;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">版本 {submission.version}</span>
            </div>
            <Badge
              variant="secondary"
              className={cn('flex items-center gap-1', config.bgColor, config.color)}
            >
              <StatusIcon className="h-3 w-3" />
              {config.label}
            </Badge>
          </div>

          {showVisibilityToggle && submission.status !== 'PENDING' && onVisibilityChange && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onVisibilityChange(!submission.isPublic)}
              className="gap-2"
            >
              {submission.isPublic ? (
                <>
                  <Eye className="h-4 w-4" />
                  公開中
                </>
              ) : (
                <>
                  <EyeOff className="h-4 w-4" />
                  設為公開
                </>
              )}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>{formatDate(submission.submittedAt)}</span>
            <span className="truncate max-w-[200px]">{submission.fileName}</span>
            <span>{formatFileSize(submission.fileSizeBytes)}</span>
          </div>

          {onDownload && (
            <Button variant="ghost" size="sm" onClick={onDownload}>
              <Download className="h-4 w-4 mr-1" />
              下載
            </Button>
          )}
        </div>

        {submission.review && (
          <ReviewDisplay review={submission.review} />
        )}
      </CardContent>
    </Card>
  );
}
