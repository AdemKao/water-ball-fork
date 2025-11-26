import { JourneyProgress } from '@/types';
import { ProgressBar } from './ProgressBar';

interface CourseProgressProps {
  progress: JourneyProgress;
}

export function CourseProgress({ progress }: CourseProgressProps) {
  return (
    <div className="rounded-lg border bg-card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">學習進度</h3>
        <span className="text-sm text-muted-foreground">
          {progress.completedLessons}/{progress.totalLessons} 課程完成
        </span>
      </div>
      <ProgressBar value={progress.progressPercentage} showPercentage />
    </div>
  );
}
