'use client';

import Link from 'next/link';
import { OrderRecord } from '@/types/course-card';

interface OrderRecordSectionProps {
  orders: OrderRecord[];
  isLoading?: boolean;
}

export function OrderRecordSection({ orders, isLoading }: OrderRecordSectionProps) {
  if (isLoading) {
    return <OrderRecordSkeleton />;
  }

  return (
    <div className="bg-muted rounded-lg p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">訂單紀錄</h2>
      {orders.length === 0 ? (
        <p className="text-muted-foreground text-center py-4">目前沒有訂單記錄</p>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-card rounded-lg p-4 flex items-center justify-between"
            >
              <div>
                <p className="font-medium text-foreground">{order.courseTitle}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(order.createdAt).toLocaleDateString('zh-TW')}
                </p>
              </div>
              <div className="text-right flex items-center gap-4">
                <div>
                  <p className="font-medium text-foreground">NT${order.amount}</p>
                  <p className="text-sm text-muted-foreground">
                    {order.status === 'completed'
                      ? '已完成'
                      : order.status === 'pending'
                        ? '處理中'
                        : '已取消'}
                  </p>
                </div>
                {order.status === 'pending' && (
                  <Link
                    href={`/journeys/${order.journeyId}/purchase/${order.id}`}
                    className="text-sm text-[#F17500] hover:underline font-medium"
                  >
                    繼續付款
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function OrderRecordSkeleton() {
  return (
    <div className="bg-muted rounded-lg p-6">
      <div className="h-6 w-24 bg-muted-foreground/20 animate-pulse rounded mb-4" />
      <div className="h-16 bg-muted-foreground/20 animate-pulse rounded" />
    </div>
  );
}
