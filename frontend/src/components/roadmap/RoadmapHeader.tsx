'use client';

import { Clock, Star, TrendingUp } from 'lucide-react';

interface RoadmapHeaderProps {
  title: string;
  daysLeft: number;
  cleared: number;
  total: number;
  xp: number;
}

export function RoadmapHeader({
  title,
  daysLeft,
  cleared,
  total,
  xp,
}: RoadmapHeaderProps) {
  return (
    <div className="text-center space-y-4">
      <h1 className="text-2xl md:text-3xl font-bold text-primary">{title}</h1>
      <p className="text-muted-foreground">挑戰地圖</p>
      <div className="flex items-center justify-center gap-8 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>{daysLeft} days left</span>
        </div>
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 text-muted-foreground" />
          <span>
            {cleared}/{total} cleared
          </span>
        </div>
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
          <span>{xp} XP</span>
        </div>
      </div>
    </div>
  );
}
