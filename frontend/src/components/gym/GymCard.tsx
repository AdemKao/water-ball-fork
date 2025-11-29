'use client';

import Image from 'next/image';
import { Lock, Swords, Map } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Gym } from '@/types/gym';

interface GymCardProps {
  gym: Gym;
  onClick?: () => void;
}

export function GymCard({ gym, onClick }: GymCardProps) {
  const progressPercentage = gym.problemCount > 0
    ? Math.round((gym.completedCount / gym.problemCount) * 100)
    : 0;

  const isMainQuest = gym.type === 'MAIN_QUEST';

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:shadow-md',
        !gym.isPurchased && 'opacity-75'
      )}
      onClick={onClick}
    >
      <CardContent className="p-0">
        <div className="relative aspect-video bg-muted">
          {gym.thumbnailUrl ? (
            <Image
              src={gym.thumbnailUrl}
              alt={gym.title}
              fill
              className="object-cover rounded-t-lg"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Swords className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
          {!gym.isPurchased && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-t-lg">
              <Lock className="h-8 w-8 text-white" />
            </div>
          )}
        </div>

        <div className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold line-clamp-2">{gym.title}</h3>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Map className="h-4 w-4 shrink-0" />
            <span className="truncate">{gym.journeyTitle}</span>
          </div>

          <div className="flex items-center justify-between">
            <Badge variant={isMainQuest ? 'default' : 'secondary'}>
              {isMainQuest ? '主線任務' : '支線任務'}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {gym.completedCount}/{gym.problemCount} 題完成
            </span>
          </div>

          {gym.isPurchased && (
            <div className="space-y-1">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
