'use client';

import { useState, useEffect } from 'react';
import { Journey, JourneyPricing } from '@/types';
import { JourneyCard } from './JourneyCard';
import { purchaseService } from '@/services/purchase.service';
import { useAuth } from '@/hooks/useAuth';

interface JourneyListProps {
  journeys: Journey[];
}

export function JourneyList({ journeys }: JourneyListProps) {
  const { isAuthenticated } = useAuth();
  const [pricingMap, setPricingMap] = useState<Record<string, JourneyPricing>>({});
  const [purchasedMap, setPurchasedMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchPricingAndPurchaseStatus = async () => {
      const pricings: Record<string, JourneyPricing> = {};
      const purchased: Record<string, boolean> = {};

      await Promise.all(
        journeys.map(async (journey) => {
          try {
            const pricing = await purchaseService.getJourneyPricing(journey.id);
            pricings[journey.id] = pricing;
          } catch {
            pricings[journey.id] = {
              journeyId: journey.id,
              price: 0,
              currency: 'TWD',
            };
          }

          if (isAuthenticated) {
            try {
              const userPurchases = await purchaseService.getUserPurchases();
              const isPurchased = userPurchases.some(
                (p) => p.journeyId === journey.id && p.status === 'COMPLETED'
              );
              purchased[journey.id] = isPurchased;
            } catch {
              purchased[journey.id] = false;
            }
          }
        })
      );

      setPricingMap(pricings);
      setPurchasedMap(purchased);
    };

    if (journeys.length > 0) {
      fetchPricingAndPurchaseStatus();
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
          pricing={pricingMap[journey.id]}
        />
      ))}
    </div>
  );
}
