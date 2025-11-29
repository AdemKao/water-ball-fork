'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { FileText, Download, User, Calendar, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { submissionService } from '@/services/submission.service';
import { PublicSubmission, SubmissionStatus } from '@/types/gym';

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

export default function PublicSubmissionPage() {
  const params = useParams();
  const submissionId = params.id as string;
  const [submission, setSubmission] = useState<PublicSubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSubmission() {
      try {
        setLoading(true);
        const data = await submissionService.getPublicSubmission(submissionId);
        setSubmission(data);
        setError(null);
      } catch {
        setError('找不到此作業或作業非公開');
      } finally {
        setLoading(false);
      }
    }

    if (submissionId) {
      fetchSubmission();
    }
  }, [submissionId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">載入中...</p>
        </div>
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="flex items-center justify-center py-20">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">找不到作業</h2>
            <p className="text-muted-foreground">{error || '此作業不存在或非公開'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const config = statusConfig[submission.status];
  const StatusIcon = config.icon;

  return (
    <div className="py-8">
      <div className="container max-w-3xl mx-auto px-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <Badge variant="secondary" className="text-sm">
                {submission.gymTitle}
              </Badge>
              <Badge
                variant="secondary"
                className={cn('flex items-center gap-1', config.bgColor, config.color)}
              >
                <StatusIcon className="h-3 w-3" />
                {config.label}
              </Badge>
            </div>
            <CardTitle className="text-2xl">{submission.problemTitle}</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={submission.userAvatarUrl || undefined} />
                <AvatarFallback>
                  <User className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{submission.userName}</p>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(submission.submittedAt)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">{submission.fileName}</span>
              </div>
              <Button asChild>
                <a href={submission.fileUrl} download target="_blank" rel="noopener noreferrer">
                  <Download className="h-4 w-4 mr-2" />
                  下載
                </a>
              </Button>
            </div>

            {submission.review && (
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">批改回饋</h3>
                  <span className="text-sm text-muted-foreground">
                    {submission.review.reviewerName} - {formatDate(submission.review.reviewedAt)}
                  </span>
                </div>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {submission.review.content}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
