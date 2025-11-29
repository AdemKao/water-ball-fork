'use client';

import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DifficultyStarsProps {
  difficulty: number;
  maxStars?: number;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
};

export function DifficultyStars({
  difficulty,
  maxStars = 5,
  size = 'md',
}: DifficultyStarsProps) {
  const stars = Array.from({ length: maxStars }, (_, i) => i + 1);

  return (
    <div className="flex items-center gap-0.5">
      {stars.map((star) => (
        <Star
          key={star}
          className={cn(
            sizeClasses[size],
            star <= difficulty
              ? 'fill-yellow-400 text-yellow-400'
              : 'fill-muted text-muted'
          )}
        />
      ))}
    </div>
  );
}
