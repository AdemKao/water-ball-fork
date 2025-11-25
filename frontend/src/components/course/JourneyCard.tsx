import Link from 'next/link';
import { Journey, JourneyProgress } from '@/types';
import { ProgressBar } from './ProgressBar';

interface JourneyCardProps {
  journey: Journey;
  progress?: JourneyProgress;
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
}

export function JourneyCard({ journey, progress }: JourneyCardProps) {
  return (
    <Link href={`/courses/${journey.id}`}>
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
        <div className="relative w-full h-40 bg-muted">
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
        <div className="p-4 space-y-3">
          <h3 className="font-semibold text-lg line-clamp-2">{journey.title}</h3>
          {journey.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">{journey.description}</p>
          )}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{journey.chapterCount} 章節</span>
            <span>{journey.lessonCount} 課程</span>
            <span>{formatDuration(journey.totalDurationSeconds)}</span>
          </div>
          {progress && (
            <div className="pt-2">
              <ProgressBar value={progress.progressPercentage} showPercentage size="sm" />
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
