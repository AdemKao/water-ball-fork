'use client';

import { Clock, Star, TrendingUp, ChevronDown } from 'lucide-react';
import { Journey } from '@/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface RoadmapHeaderProps {
  title: string;
  daysLeft: number;
  cleared: number;
  total: number;
  xp: number;
  journeys?: Journey[];
  selectedJourneyId?: string;
  onJourneyChange?: (journeyId: string) => void;
}

export function RoadmapHeader({
  title,
  daysLeft,
  cleared,
  total,
  xp,
  journeys,
  selectedJourneyId,
  onJourneyChange,
}: RoadmapHeaderProps) {
  const showSelector = journeys && journeys.length > 0 && onJourneyChange;

  return (
    <div className="text-center space-y-4">
      {showSelector ? (
        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex items-center gap-2 text-2xl md:text-3xl font-bold text-primary hover:opacity-80 transition-opacity">
            {title}
            <ChevronDown className="h-6 w-6" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center">
            {journeys.map((journey) => (
              <DropdownMenuItem
                key={journey.id}
                onClick={() => onJourneyChange(journey.id)}
                className={selectedJourneyId === journey.id ? 'bg-accent' : ''}
              >
                {journey.title}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <h1 className="text-2xl md:text-3xl font-bold text-primary">{title}</h1>
      )}
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
