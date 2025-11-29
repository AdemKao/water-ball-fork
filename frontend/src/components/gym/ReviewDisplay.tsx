'use client';

import { CheckCircle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ReviewInfo } from '@/types/gym';

interface ReviewDisplayProps {
  review: ReviewInfo;
  showReviewer?: boolean;
}

export function ReviewDisplay({ review, showReviewer = true }: ReviewDisplayProps) {
  const isApproved = review.status === 'APPROVED';
  const formattedDate = new Date(review.reviewedAt).toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Card className={cn(
      'border-l-4',
      isApproved ? 'border-l-green-500' : 'border-l-orange-500'
    )}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <Badge
            variant={isApproved ? 'default' : 'secondary'}
            className={cn(
              isApproved
                ? 'bg-green-100 text-green-800 hover:bg-green-100'
                : 'bg-orange-100 text-orange-800 hover:bg-orange-100'
            )}
          >
            {isApproved ? (
              <>
                <CheckCircle className="h-3 w-3 mr-1" />
                通過
              </>
            ) : (
              <>
                <XCircle className="h-3 w-3 mr-1" />
                需修改
              </>
            )}
          </Badge>
        </div>

        <div className="prose prose-sm max-w-none text-foreground">
          {review.content}
        </div>

        {showReviewer && (
          <div className="mt-3 pt-3 border-t text-sm text-muted-foreground">
            <span>— {review.reviewerName}</span>
            <span className="mx-2">·</span>
            <span>{formattedDate}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
