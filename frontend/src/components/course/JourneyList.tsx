'use client';

import { useState, useEffect } from 'react';
import { Journey } from '@/types';
import { JourneyCard } from './JourneyCard';
import { purchaseService } from '@/services/purchase.service';
import { useAuth } from '@/hooks/useAuth';

interface JourneyListProps {
  journeys: Journey[];
}

export function JourneyList({ journeys }: JourneyListProps) {
  const { isAuthenticated } = useAuth();
  const [purchasedMap, setPurchasedMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchPurchaseStatus = async () => {
      if (!isAuthenticated) return;
      
      try {
        const result = await purchaseService.getUserPurchases();
        const purchased: Record<string, boolean> = {};
        journeys.forEach((journey) => {
          purchased[journey.id] = result.content.some(
            (p) => p.journeyId === journey.id && p.status === 'COMPLETED'
          );
        });
        setPurchasedMap(purchased);
      } catch {
        journeys.forEach((journey) => {
          setPurchasedMap((prev) => ({ ...prev, [journey.id]: false }));
        });
      }
    };

    if (journeys.length > 0) {
      fetchPurchaseStatus();
    }
  }, [journeys, isAuthenticated]);

  if (journeys.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">目前沒有課程</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {journeys.map((journey) => (
        <JourneyCard
          key={journey.id}
          journey={journey}
          isPurchased={purchasedMap[journey.id] || false}
        />
      ))}
    </div>
  );
}
