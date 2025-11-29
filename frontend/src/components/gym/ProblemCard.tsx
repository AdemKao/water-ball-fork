'use client';

import Link from 'next/link';
import { Lock, Check, Circle, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ProblemSummary, SubmissionStatus } from '@/types/gym';
import { DifficultyStars } from './DifficultyStars';
import { SubmissionTypeIcon } from './SubmissionTypeIcon';

interface ProblemCardProps {
  problem: ProblemSummary;
  gymId: string;
  onClick?: () => void;
}

const statusConfig: Record<SubmissionStatus, { icon: typeof Clock; color: string; label: string }> = {
  PENDING: { icon: Clock, color: 'text-yellow-500', label: '待批改' },
  REVIEWED: { icon: CheckCircle, color: 'text-green-500', label: '已批改' },
  NEEDS_REVISION: { icon: AlertCircle, color: 'text-orange-500', label: '需修改' },
};

export function ProblemCard({ problem, gymId, onClick }: ProblemCardProps) {
  const isAccessible = problem.isUnlocked;

  const content = (
    <Card
      className={cn(
        'transition-all',
        isAccessible && 'cursor-pointer hover:shadow-md',
        !isAccessible && 'opacity-75'
      )}
      onClick={isAccessible ? onClick : undefined}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn(
            'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
            problem.isCompleted
              ? 'bg-green-100 text-green-600'
              : problem.isUnlocked
                ? 'bg-muted text-muted-foreground'
                : 'bg-muted text-muted-foreground'
          )}>
            {problem.isCompleted ? (
              <Check className="h-4 w-4" />
            ) : problem.isUnlocked ? (
              <Circle className="h-4 w-4" />
            ) : (
              <Lock className="h-4 w-4" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-medium">{problem.title}</h3>
              <DifficultyStars difficulty={problem.difficulty} size="sm" />
            </div>

            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-1">
                {problem.submissionTypes.map((type) => (
                  <SubmissionTypeIcon key={type} type={type} size="sm" />
                ))}
              </div>

              {problem.submissionStatus && (
                <Badge
                  variant="secondary"
                  className={cn('text-xs', statusConfig[problem.submissionStatus].color)}
                >
                  {(() => {
                    const StatusIcon = statusConfig[problem.submissionStatus].icon;
                    return <StatusIcon className="h-3 w-3 mr-1" />;
                  })()}
                  {statusConfig[problem.submissionStatus].label}
                </Badge>
              )}

              {!problem.submissionStatus && problem.isUnlocked && !problem.isCompleted && (
                <span className="text-xs text-muted-foreground">尚未提交</span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isAccessible) {
    return (
      <Link href={`/gyms/${gymId}/problems/${problem.id}`}>
        {content}
      </Link>
    );
  }

  return content;
}
