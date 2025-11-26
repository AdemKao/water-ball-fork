import Link from 'next/link';
import { Journey, JourneyProgress, JourneyPricing } from '@/types';
import { ProgressBar } from './ProgressBar';
import { PurchaseButton } from '@/components/purchase';
import { Button } from '@/components/ui/button';

interface JourneyCardProps {
  journey: Journey;
  progress?: JourneyProgress;
  isPurchased?: boolean;
  pricing?: JourneyPricing;
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
}

export function JourneyCard({ journey, progress, isPurchased = false, pricing }: JourneyCardProps) {
  const hasStarted = progress && progress.completedLessons > 0;

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <Link href={`/courses/${journey.id}`}>
        <div className="relative w-full h-40 bg-muted cursor-pointer">
          {journey.thumbnailUrl ? (
            <img
              src={journey.thumbnailUrl}
              alt={journey.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-muted-foreground">
              No Image
            </div>
          )}
        </div>
      </Link>
      <div className="p-4 space-y-3">
        <Link href={`/courses/${journey.id}`}>
          <h3 className="font-semibold text-lg line-clamp-2 hover:text-primary cursor-pointer">
            {journey.title}
          </h3>
        </Link>
        {journey.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{journey.description}</p>
        )}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{journey.chapterCount} 章節</span>
          <span>{journey.lessonCount} 課程</span>
          <span>{formatDuration(journey.totalDurationSeconds)}</span>
        </div>
        {progress && isPurchased && (
          <div className="pt-2">
            <ProgressBar value={progress.progressPercentage} showPercentage size="sm" />
          </div>
        )}
        <div className="pt-2">
          {isPurchased ? (
            <Link href={`/courses/${journey.id}`}>
              <Button variant="outline" className="w-full">
                {hasStarted ? '繼續學習' : '開始學習'}
              </Button>
            </Link>
          ) : pricing ? (
            <PurchaseButton
              journeyId={journey.id}
              price={pricing.price}
              currency={pricing.currency}
              className="w-full"
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
