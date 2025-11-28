'use client';

import Image from 'next/image';
import { CourseCardData } from '@/types/course-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface WBCourseCardProps {
  course: CourseCardData;
  onPurchase?: (courseId: string) => void;
  onPreview?: (courseId: string) => void;
}

export function WBCourseCard({ course, onPurchase, onPreview }: WBCourseCardProps) {
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
      <div className="relative w-full h-48 bg-[#1B3A5F]">
        {course.thumbnailUrl ? (
          <Image
            src={course.thumbnailUrl}
            alt={course.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-[#2A5A8F] flex items-center justify-center">
              <svg
                className="w-8 h-8 text-white/60"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        )}
      </div>
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          {!course.isOwned && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground">
              尚未擁有
            </span>
          )}
          {course.isPaidOnly && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#F17500]/10 text-[#F17500]">
              僅限付費
            </span>
          )}
        </div>
        <h3 className="font-semibold text-lg text-foreground line-clamp-2">
          {course.title}
        </h3>
        <p className="text-sm text-muted-foreground">{course.instructor}</p>
        <div className="flex gap-2 pt-2">
          {course.isOwned ? (
            <Link href={`/courses/${course.id}`} className="flex-1">
              <Button
                className="w-full bg-[#F17500] hover:bg-[#D96800] text-white"
              >
                上課去
              </Button>
            </Link>
          ) : (
            <>
              <Link href={`/courses/${course.id}`} className="flex-1">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => onPreview?.(course.id)}
                >
                  試聽課程
                </Button>
              </Link>
              <Link href={`/journeys/${course.id}/orders`} className="flex-1">
                <Button
                  className="w-full bg-[#F17500] hover:bg-[#D96800] text-white"
                  onClick={() => onPurchase?.(course.id)}
                >
                  立刻購買
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function WBCourseCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
      <div className="h-48 bg-muted animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="flex gap-2">
          <div className="h-5 w-16 bg-muted animate-pulse rounded" />
          <div className="h-5 w-16 bg-muted animate-pulse rounded" />
        </div>
        <div className="h-6 w-3/4 bg-muted animate-pulse rounded" />
        <div className="h-4 w-1/2 bg-muted animate-pulse rounded" />
        <div className="flex gap-2 pt-2">
          <div className="h-9 flex-1 bg-muted animate-pulse rounded" />
          <div className="h-9 flex-1 bg-muted animate-pulse rounded" />
        </div>
      </div>
    </div>
  );
}
