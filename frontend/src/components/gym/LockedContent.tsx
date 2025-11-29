'use client';

import Link from 'next/link';
import { Lock, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PrerequisiteStatus } from './PrerequisiteStatus';
import { PrerequisiteInfo } from '@/types/gym';

interface LockedContentProps {
  type: 'purchase' | 'prerequisite';
  prerequisites?: PrerequisiteInfo[];
  journeyId?: string;
  message?: string;
}

export function LockedContent({
  type,
  prerequisites = [],
  journeyId,
  message,
}: LockedContentProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-8 text-center">
        <Lock className="h-12 w-12 text-muted-foreground mb-4" />
        
        {type === 'purchase' ? (
          <>
            <h3 className="text-lg font-semibold mb-2">
              {message || '購買課程以解鎖'}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              購買此課程後即可開始挑戰道館題目
            </p>
            {journeyId && (
              <Button asChild>
                <Link href={`/journeys/${journeyId}`}>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  前往購買
                </Link>
              </Button>
            )}
          </>
        ) : (
          <>
            <h3 className="text-lg font-semibold mb-2">
              {message || '內容已鎖定'}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              請先完成以下前置條件
            </p>
            <PrerequisiteStatus prerequisites={prerequisites} showLinks />
          </>
        )}
      </CardContent>
    </Card>
  );
}
