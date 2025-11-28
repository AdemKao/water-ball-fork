'use client';

import Link from 'next/link';
import { PendingPurchase } from '@/types';

interface PendingPurchaseNoticeProps {
  pendingPurchases: PendingPurchase[];
}

export function PendingPurchaseNotice({ pendingPurchases }: PendingPurchaseNoticeProps) {
  if (pendingPurchases.length === 0) return null;

  return (
    <div className="bg-[#FEF3CD] border border-[#FFC107] rounded-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <svg
            className="w-5 h-5 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-[#4B5563] mb-2">
            您有 {pendingPurchases.length} 筆待付款的訂單
          </p>
          <div className="space-y-2">
            {pendingPurchases.map((purchase) => (
              <div key={purchase.id} className="flex items-center justify-between text-sm">
                <span className="text-[#4B5563]">{purchase.journeyTitle}</span>
                <Link
                  href={`/journeys/${purchase.journeyId}/purchase/${purchase.id}`}
                  className="text-primary underline hover:no-underline"
                >
                  前往付款
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function PendingPurchaseNoticeSkeleton() {
  return (
    <div className="bg-gray-100 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        <div className="w-5 h-5 bg-muted animate-pulse rounded-full" />
        <div className="flex-1">
          <div className="h-4 w-48 bg-muted animate-pulse rounded mb-2" />
          <div className="h-4 w-32 bg-muted animate-pulse rounded" />
        </div>
      </div>
    </div>
  );
}
