'use client';

import Link from 'next/link';
import { Lock, Unlock, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { StageSummary } from '@/types/gym';
import { DifficultyStars } from './DifficultyStars';
import { PrerequisiteStatus } from './PrerequisiteStatus';

interface StageCardProps {
  stage: StageSummary;
  gymId: string;
  isPurchased: boolean;
  onClick?: () => void;
}

export function StageCard({ stage, gymId, isPurchased, onClick }: StageCardProps) {
  const isCompleted = stage.completedCount >= stage.problemCount && stage.problemCount > 0;
  const canAccess = isPurchased && stage.isUnlocked;

  const content = (
    <Card
      className={cn(
        'transition-all',
        canAccess && 'cursor-pointer hover:shadow-md',
        !canAccess && 'opacity-75'
      )}
      onClick={canAccess ? onClick : undefined}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn(
            'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
            isCompleted
              ? 'bg-green-100 text-green-600'
              : stage.isUnlocked
                ? 'bg-primary/10 text-primary'
                : 'bg-muted text-muted-foreground'
          )}>
            {isCompleted ? (
              <Check className="h-5 w-5" />
            ) : stage.isUnlocked ? (
              <Unlock className="h-5 w-5" />
            ) : (
              <Lock className="h-5 w-5" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold">{stage.title}</h3>
              <DifficultyStars difficulty={stage.difficulty} size="sm" />
            </div>

            {stage.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {stage.description}
              </p>
            )}

            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span>{stage.problemCount} 題</span>
              {isPurchased && stage.isUnlocked && (
                <span>{stage.completedCount}/{stage.problemCount} 完成</span>
              )}
            </div>

            {!stage.isUnlocked && stage.prerequisites.length > 0 && (
              <div className="mt-3">
                <PrerequisiteStatus prerequisites={stage.prerequisites} showLinks={isPurchased} />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (canAccess) {
    return (
      <Link href={`/gyms/${gymId}/stages/${stage.id}`}>
        {content}
      </Link>
    );
  }

  return content;
}
