'use client';

import { GymSubmission, SubmissionStatus } from '@/types/gym';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, Clock, CheckCircle, XCircle, FileText, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface SubmissionHistoryProps {
  submissions: GymSubmission[];
  onDownload?: (submissionId: number) => void;
}

const statusConfig: Record<SubmissionStatus, { icon: typeof CheckCircle; color: string; label: string }> = {
  APPROVED: { icon: CheckCircle, color: 'text-green-500', label: '已通過' },
  PENDING: { icon: Clock, color: 'text-yellow-500', label: '審核中' },
  REJECTED: { icon: XCircle, color: 'text-red-500', label: '需修改' },
};

export function SubmissionHistory({ submissions, onDownload }: SubmissionHistoryProps) {
  if (submissions.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          尚未提交任何作業
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">提交歷史</h3>
      {submissions.map((submission) => (
        <SubmissionCard 
          key={submission.id} 
          submission={submission}
          onDownload={onDownload}
        />
      ))}
    </div>
  );
}

interface SubmissionCardProps {
  submission: GymSubmission;
  onDownload?: (submissionId: number) => void;
}

function SubmissionCard({ submission, onDownload }: SubmissionCardProps) {
  const config = statusConfig[submission.status];
  const StatusIcon = config.icon;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="truncate max-w-[200px]">{submission.fileName}</span>
          </div>
          <Badge className={cn('flex items-center gap-1', config.color)}>
            <StatusIcon className="h-3 w-3" />
            {config.label}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            提交於 {formatDistanceToNow(new Date(submission.submittedAt), { 
              addSuffix: true, 
              locale: zhTW 
            })}
          </span>
          <span>{(submission.fileSize / 1024).toFixed(1)} KB</span>
        </div>

        {submission.feedback && (
          <div className="bg-muted p-3 rounded-lg">
            <div className="flex items-center gap-2 text-sm font-medium mb-1">
              <MessageSquare className="h-4 w-4" />
              審核回饋
            </div>
            <p className="text-sm">{submission.feedback}</p>
          </div>
        )}

        {onDownload && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onDownload(submission.id)}
            className="w-full"
          >
            <Download className="h-4 w-4 mr-2" />
            下載檔案
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
