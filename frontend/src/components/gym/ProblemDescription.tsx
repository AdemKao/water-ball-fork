'use client';

import { cn } from '@/lib/utils';

interface ProblemDescriptionProps {
  content: string;
  className?: string;
}

export function ProblemDescription({ content, className }: ProblemDescriptionProps) {
  return (
    <div
      className={cn(
        'prose prose-sm dark:prose-invert max-w-none',
        'prose-headings:font-semibold prose-headings:text-foreground',
        'prose-p:text-foreground prose-p:leading-relaxed',
        'prose-strong:text-foreground prose-strong:font-semibold',
        'prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm',
        'prose-pre:bg-muted prose-pre:p-4 prose-pre:rounded-lg',
        'prose-ul:list-disc prose-ul:pl-6',
        'prose-ol:list-decimal prose-ol:pl-6',
        'prose-li:text-foreground',
        className
      )}
    >
      <div className="whitespace-pre-wrap">{content}</div>
    </div>
  );
}
