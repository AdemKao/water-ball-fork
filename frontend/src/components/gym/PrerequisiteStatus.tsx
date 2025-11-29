'use client';

import Link from 'next/link';
import { Check, X, BookOpen, FileCode } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PrerequisiteInfo } from '@/types/gym';

interface PrerequisiteStatusProps {
  prerequisites: PrerequisiteInfo[];
  showLinks?: boolean;
}

export function PrerequisiteStatus({
  prerequisites,
  showLinks = true,
}: PrerequisiteStatusProps) {
  if (prerequisites.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-muted-foreground">前置條件：</p>
      <ul className="space-y-1">
        {prerequisites.map((prereq) => {
          const Icon = prereq.type === 'LESSON' ? BookOpen : FileCode;
          const href = prereq.type === 'LESSON'
            ? `/lessons/${prereq.id}`
            : `/problems/${prereq.id}`;

          const content = (
            <span
              className={cn(
                'inline-flex items-center gap-2 text-sm',
                prereq.isCompleted ? 'text-muted-foreground' : 'text-foreground'
              )}
            >
              {prereq.isCompleted ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <X className="h-4 w-4 text-red-500" />
              )}
              <Icon className="h-4 w-4" />
              <span>{prereq.title}</span>
            </span>
          );

          return (
            <li key={`${prereq.type}-${prereq.id}`}>
              {showLinks && !prereq.isCompleted ? (
                <Link
                  href={href}
                  className="hover:underline"
                >
                  {content}
                </Link>
              ) : (
                content
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
