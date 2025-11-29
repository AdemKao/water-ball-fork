'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { GymType } from '@/types/gym';

type FilterType = 'ALL' | GymType;

interface GymTypeFilterProps {
  value: FilterType;
  onChange: (value: FilterType) => void;
}

const filterOptions: { value: FilterType; label: string }[] = [
  { value: 'ALL', label: '全部' },
  { value: 'MAIN_QUEST', label: '主線任務' },
  { value: 'SIDE_QUEST', label: '支線任務' },
];

export function GymTypeFilter({ value, onChange }: GymTypeFilterProps) {
  return (
    <div className="flex gap-2">
      {filterOptions.map((option) => (
        <Button
          key={option.value}
          variant={value === option.value ? 'default' : 'outline'}
          size="sm"
          onClick={() => onChange(option.value)}
          className={cn(
            value !== option.value && 'text-muted-foreground'
          )}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}
