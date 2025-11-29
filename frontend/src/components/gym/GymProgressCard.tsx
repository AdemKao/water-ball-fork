'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, CheckCircle, Swords, Map } from 'lucide-react';
import { GymProgressItem } from '@/types/gym';

interface GymProgressCardProps {
  progress: GymProgressItem;
}

export function GymProgressCard({ progress }: GymProgressCardProps) {
  const isMainQuest = progress.type === 'MAIN_QUEST';

  return (
    <Link href={`/gym/${progress.gymId}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              {isMainQuest ? (
                <Map className="h-4 w-4 text-primary" />
              ) : (
                <Swords className="h-4 w-4 text-amber-500" />
              )}
              <span className="line-clamp-1">{progress.gymTitle}</span>
            </CardTitle>
            <Badge variant={isMainQuest ? 'default' : 'secondary'}>
              {isMainQuest ? '主線' : '支線'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">進度</span>
              <span className="font-medium">
                {progress.completedCount} / {progress.problemCount}
              </span>
            </div>
            <Progress value={progress.progressPercentage} />
          </div>

          <div className="flex items-center gap-4 text-sm">
            {progress.completedCount > 0 && (
              <div className="flex items-center gap-1 text-green-600">
                <CheckCircle className="h-3.5 w-3.5" />
                <span>{progress.completedCount} 完成</span>
              </div>
            )}
            {progress.pendingCount > 0 && (
              <div className="flex items-center gap-1 text-yellow-600">
                <Clock className="h-3.5 w-3.5" />
                <span>{progress.pendingCount} 待批改</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export function GymProgressCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between">
          <div className="h-5 w-32 bg-muted animate-pulse rounded" />
          <div className="h-5 w-12 bg-muted animate-pulse rounded" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <div className="flex justify-between">
            <div className="h-4 w-8 bg-muted animate-pulse rounded" />
            <div className="h-4 w-12 bg-muted animate-pulse rounded" />
          </div>
          <div className="h-2 w-full bg-muted animate-pulse rounded" />
        </div>
        <div className="flex gap-4">
          <div className="h-4 w-16 bg-muted animate-pulse rounded" />
          <div className="h-4 w-16 bg-muted animate-pulse rounded" />
        </div>
      </CardContent>
    </Card>
  );
}
