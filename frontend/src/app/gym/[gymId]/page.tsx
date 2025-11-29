'use client';

import { use, useState } from 'react';
import { useGym } from '@/hooks/useGym';
import { useStage } from '@/hooks/useStage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ExerciseList } from '@/components/gym';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface GymPageProps {
  params: Promise<{ gymId: string }>;
}

export default function GymPage({ params }: GymPageProps) {
  const { gymId } = use(params);
  const { gym, isLoading, error } = useGym(gymId);
  const [activeStageId, setActiveStageId] = useState<string | null>(null);

  const currentStageId = activeStageId || gym?.stages[0]?.id || null;

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !gym) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-red-500">無法載入道場資訊</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <h1 className="text-2xl font-bold">{gym.title}</h1>
          <Badge variant={gym.type === 'MAIN_QUEST' ? 'default' : 'secondary'}>
            {gym.type === 'MAIN_QUEST' ? '主線' : '支線'}
          </Badge>
        </div>
        {gym.description && (
          <p className="text-muted-foreground">{gym.description}</p>
        )}
        <p className="text-sm text-muted-foreground mt-2">
          進度: {gym.completedCount} / {gym.problemCount} 題
        </p>
      </div>

      {gym.stages.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {gym.stages.map((stage) => (
              <Button
                key={stage.id}
                variant={currentStageId === stage.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveStageId(stage.id)}
                className={cn(
                  'flex items-center gap-2',
                  !stage.isUnlocked && 'opacity-50'
                )}
              >
                {stage.title}
                <span className="text-xs opacity-70">
                  ({stage.completedCount}/{stage.problemCount})
                </span>
              </Button>
            ))}
          </div>
          {currentStageId && (
            <StageContent gymId={gymId} stageId={currentStageId} isPurchased={gym.isPurchased} />
          )}
        </div>
      )}
    </div>
  );
}

function StageContent({ gymId, stageId, isPurchased }: { gymId: string; stageId: string; isPurchased: boolean }) {
  const { stage, isLoading, error } = useStage(gymId, stageId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  if (error || !stage) {
    return <div className="text-red-500">無法載入關卡資訊</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{stage.title}</CardTitle>
        {stage.description && (
          <p className="text-muted-foreground text-sm">{stage.description}</p>
        )}
      </CardHeader>
      <CardContent>
        <ExerciseList
          gymId={gymId}
          problems={stage.problems}
          isPurchased={isPurchased}
        />
      </CardContent>
    </Card>
  );
}
