'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AccordionItem {
  title: string;
  content: string[];
}

interface OrderAccordionProps {
  items: AccordionItem[];
}

export function OrderAccordion({ items }: OrderAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={index} className="border rounded-lg overflow-hidden">
          <button
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
          >
            <span className="font-medium">{item.title}</span>
            <ChevronDown
              className={cn(
                'h-5 w-5 text-muted-foreground transition-transform',
                openIndex === index && 'rotate-180'
              )}
            />
          </button>
          {openIndex === index && (
            <div className="px-4 pb-4 space-y-2">
              {item.content.map((text, i) => (
                <p key={i} className="text-sm text-muted-foreground">
                  {text}
                </p>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
