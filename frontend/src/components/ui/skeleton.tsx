import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('animate-pulse rounded-md bg-muted', className)} />
  );
}

export function JourneyCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <Skeleton className="w-full h-40" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex gap-4 pt-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  );
}

export function JourneyListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <JourneyCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ChapterAccordionSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-5 w-5 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-4 w-1/4" />
            </div>
            <Skeleton className="h-5 w-5" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CourseDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-9 w-2/3" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-3/4" />
      </div>
      <div className="rounded-lg border bg-card p-4 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-2 w-full" />
      </div>
      <ChapterAccordionSkeleton count={4} />
    </div>
  );
}

export function LessonPageSkeleton() {
  return (
    <div className="h-screen flex">
      <div className="flex-1 p-4 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-4">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="aspect-video w-full rounded-lg" />
          <div className="flex justify-between pt-4">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
      </div>
      <div className="hidden lg:block w-80 border-l">
        <div className="p-4 border-b">
          <Skeleton className="h-6 w-3/4" />
        </div>
        <div className="p-4 space-y-2">
          <ChapterAccordionSkeleton count={3} />
        </div>
      </div>
    </div>
  );
}
