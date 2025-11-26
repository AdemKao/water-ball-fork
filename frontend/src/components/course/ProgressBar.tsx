import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  max?: number;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
};

export function ProgressBar({
  value,
  max = 100,
  showPercentage = false,
  size = 'md',
  className,
}: ProgressBarProps) {
  const percentage = Math.min(Math.round((value / max) * 100), 100);

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className={cn('flex-1 bg-muted rounded-full overflow-hidden', sizeClasses[size])}>
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showPercentage && <span className="text-xs text-muted-foreground">{percentage}%</span>}
    </div>
  );
}
