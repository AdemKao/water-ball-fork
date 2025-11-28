'use client';

import Link from 'next/link';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SideQuest {
  id: string;
  category: string;
  title: string;
  stars: number;
  href: string;
}

interface SideQuestListProps {
  quests: SideQuest[];
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

export function SideQuestList({ quests }: SideQuestListProps) {
  const groupedQuests = quests.reduce(
    (acc, quest) => {
      if (!acc[quest.category]) {
        acc[quest.category] = [];
      }
      acc[quest.category].push(quest);
      return acc;
    },
    {} as Record<string, SideQuest[]>
  );

  return (
    <div className="space-y-6">
      {Object.entries(groupedQuests).map(([category, categoryQuests]) => (
        <div key={category}>
          <h3 className="text-lg font-semibold mb-3">{category} 類題目</h3>
          <div className="space-y-2">
            {categoryQuests.map((quest) => (
              <Link
                key={quest.id}
                href={quest.href}
                className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <span className="font-medium">{quest.title}</span>
                <StarRating count={quest.stars} />
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
