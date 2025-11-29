'use client';

import { cn } from '@/lib/utils';

export type RoadmapTabType = 'main' | 'side' | 'gym';

interface RoadmapTabsProps {
  activeTab: RoadmapTabType;
  onTabChange: (tab: RoadmapTabType) => void;
}

export function RoadmapTabs({ activeTab, onTabChange }: RoadmapTabsProps) {
  return (
    <div className="flex rounded-lg overflow-hidden border">
      <button
        onClick={() => onTabChange('main')}
        className={cn(
          'flex-1 py-3 px-6 text-center font-medium transition-colors',
          activeTab === 'main'
            ? 'bg-[#FFD700] text-black'
            : 'bg-card hover:bg-muted'
        )}
      >
        主線
      </button>
      <button
        onClick={() => onTabChange('side')}
        className={cn(
          'flex-1 py-3 px-6 text-center font-medium transition-colors',
          activeTab === 'side'
            ? 'bg-[#FFD700] text-black'
            : 'bg-card hover:bg-muted'
        )}
      >
        支線
      </button>
      <button
        onClick={() => onTabChange('gym')}
        className={cn(
          'flex-1 py-3 px-6 text-center font-medium transition-colors',
          activeTab === 'gym'
            ? 'bg-[#FFD700] text-black'
            : 'bg-card hover:bg-muted'
        )}
      >
        道場
      </button>
    </div>
  );
}
