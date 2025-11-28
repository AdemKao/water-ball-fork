'use client';

import { useMemo } from 'react';
import {
  WBCourseCard,
  WBCourseCardSkeleton,
  OrderRecordSection,
  CouponNotice,
  CouponNoticeSkeleton,
  PendingPurchaseNotice,
  PendingPurchaseNoticeSkeleton,
} from '@/components/course';
import { CourseCardData, OrderRecord } from '@/types/course-card';
import { useJourneyList } from '@/hooks/useJourneyList';
import { useAuth } from '@/hooks/useAuth';
import { usePurchaseHistory } from '@/hooks/usePurchaseHistory';
import { usePendingPurchases } from '@/hooks/usePendingPurchases';
import { Journey, Purchase } from '@/types';

function mapJourneyToCourseCard(journey: Journey, purchasedJourneyIds: Set<string>): CourseCardData {
  return {
    id: journey.id,
    title: journey.title,
    instructor: '水球學院',
    description: journey.description || '',
    isOwned: purchasedJourneyIds.has(journey.id),
    isPaidOnly: journey.price > 0,
    price: journey.price,
    originalPrice: journey.originalPrice,
    thumbnailUrl: journey.thumbnailUrl || undefined,
  };
}

function mapPurchaseToOrderRecord(purchase: Purchase): OrderRecord {
  return {
    id: purchase.id,
    journeyId: purchase.journeyId,
    courseTitle: purchase.journeyTitle,
    amount: purchase.amount,
    status: purchase.status === 'COMPLETED' ? 'completed' : purchase.status === 'PENDING' ? 'pending' : 'cancelled',
    createdAt: purchase.createdAt,
  };
}

export default function CoursesPage() {
  const { journeys, isLoading, error } = useJourneyList();
  const { user } = useAuth();
  const { purchases: allPurchases, isLoading: isLoadingOrders } = usePurchaseHistory(!!user);
  const { pendingPurchases, isLoading: isLoadingPending } = usePendingPurchases();

  const purchasedJourneyIds = useMemo(() => {
    return new Set(allPurchases.filter((p) => p.status === 'COMPLETED').map((p) => p.journeyId));
  }, [allPurchases]);

  const courses = useMemo(() => {
    return journeys.map((j) => mapJourneyToCourseCard(j, purchasedJourneyIds));
  }, [journeys, purchasedJourneyIds]);

  const orders = useMemo(() => {
    return allPurchases.map(mapPurchaseToOrderRecord);
  }, [allPurchases]);

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6 text-foreground">課程列表</h1>
        <div className="text-red-500">載入課程時發生錯誤：{error.message}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6 text-foreground">課程列表</h1>

      {isLoading ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {[...Array(3)].map((_, i) => (
              <WBCourseCardSkeleton key={i} />
            ))}
          </div>
          <div className="mt-6">
            <CouponNoticeSkeleton />
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {courses.map((course) => (
              <WBCourseCard
                key={course.id}
                course={course}
              />
            ))}
          </div>
          <OrderRecordSection orders={orders} isLoading={isLoadingOrders} />
          <div className="mt-6">
            <CouponNotice
              hasDiscount={true}
              discountCourses={['軟體設計模式精通之旅', 'AI x BDD 行為驅動開發工作坊']}
            />
          </div>
        </>
      )}
    </div>
  );
}
