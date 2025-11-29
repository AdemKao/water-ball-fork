'use client';

import { useState } from 'react';
import { ChevronRight, Lightbulb } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { Hint } from '@/types/gym';

interface HintAccordionProps {
  hints: Hint[];
}

export function HintAccordion({ hints }: HintAccordionProps) {
  const [openHints, setOpenHints] = useState<Set<number>>(new Set());

  const toggleHint = (order: number) => {
    setOpenHints((prev) => {
      const next = new Set(prev);
      if (next.has(order)) {
        next.delete(order);
      } else {
        next.add(order);
      }
      return next;
    });
  };

  if (hints.length === 0) {
    return null;
  }

  const sortedHints = [...hints].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Lightbulb className="h-4 w-4" />
        <span>提示</span>
      </div>
      <div className="space-y-2">
        {sortedHints.map((hint) => {
          const isOpen = openHints.has(hint.order);

          return (
            <Collapsible
              key={hint.order}
              open={isOpen}
              onOpenChange={() => toggleHint(hint.order)}
            >
              <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border bg-card px-4 py-2 text-left text-sm font-medium hover:bg-accent transition-colors">
                <span>提示 {hint.order}</span>
                <ChevronRight
                  className={cn(
                    'h-4 w-4 text-muted-foreground transition-transform',
                    isOpen && 'rotate-90'
                  )}
                />
              </CollapsibleTrigger>
              <CollapsibleContent className="px-4 py-3 text-sm text-muted-foreground border-x border-b rounded-b-lg bg-muted/50">
                {hint.content}
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </div>
    </div>
  );
}
