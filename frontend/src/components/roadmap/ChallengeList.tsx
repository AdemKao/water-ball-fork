'use client';

import { Lock, Star } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface Challenge {
  id: string;
  number: string;
  title: string;
  stars: number;
  isLocked?: boolean;
  href: string;
}

export interface ChallengeSection {
  title: string;
  challenges: Challenge[];
}

interface ChallengeListProps {
  sections: ChallengeSection[];
}

function StarRating({ count, max = 3 }: { count: number; max?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            'h-4 w-4',
            i < count ? 'fill-[#FFD700] text-[#FFD700]' : 'text-muted-foreground'
          )}
        />
      ))}
    </div>
  );
}

export function ChallengeList({ sections }: ChallengeListProps) {
  return (
    <div className="space-y-8">
      {sections.map((section) => (
        <div key={section.title}>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 h-px bg-border" />
            <h3 className="text-lg font-semibold">{section.title}</h3>
            <div className="flex-1 h-px bg-border" />
          </div>
          <div className="space-y-3">
            {section.challenges.map((challenge) => (
              <Link
                key={challenge.id}
                href={challenge.isLocked ? '#' : challenge.href}
                className={cn(
                  'flex items-center gap-4 p-4 rounded-lg border transition-colors',
                  challenge.isLocked
                    ? 'bg-muted/50 cursor-not-allowed'
                    : 'hover:bg-muted/50'
                )}
              >
                <div className="relative">
                  <div
                    className={cn(
                      'w-12 h-12 rounded-full border-2 flex items-center justify-center',
                      challenge.isLocked
                        ? 'border-muted-foreground bg-muted'
                        : 'border-primary'
                    )}
                  >
                    <span className="text-sm font-medium">{challenge.number}</span>
                  </div>
                  {challenge.isLocked && (
                    <Lock className="absolute -top-1 -right-1 h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <p
                    className={cn(
                      'font-medium',
                      challenge.isLocked && 'text-muted-foreground'
                    )}
                  >
                    {challenge.title}
                  </p>
                </div>
                <StarRating count={challenge.stars} />
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
