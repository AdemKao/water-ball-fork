'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

interface PurchaseHeaderProps {
  backHref?: string;
  backLabel?: string;
}

export function PurchaseHeader({ 
  backHref = '/courses', 
  backLabel = '返回課程列表' 
}: PurchaseHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link
          href={backHref}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{backLabel}</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-xl font-bold text-primary hover:opacity-80 transition-opacity">
            Waterball
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
