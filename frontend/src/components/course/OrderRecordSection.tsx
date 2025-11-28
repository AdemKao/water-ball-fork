'use client';

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
    <div className="bg-gray-100 rounded-lg p-6">
      <h2 className="text-lg font-semibold text-[#1B1B1F] mb-4">訂單紀錄</h2>
      {orders.length === 0 ? (
        <p className="text-[#4B5563] text-center py-4">目前沒有訂單記錄</p>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-lg p-4 flex items-center justify-between"
            >
              <div>
                <p className="font-medium text-[#1B1B1F]">{order.courseTitle}</p>
                <p className="text-sm text-[#4B5563]">
                  {new Date(order.createdAt).toLocaleDateString('zh-TW')}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium text-[#1B1B1F]">NT${order.amount}</p>
                <p className="text-sm text-[#4B5563]">
                  {order.status === 'completed'
                    ? '已完成'
                    : order.status === 'pending'
                      ? '處理中'
                      : '已取消'}
                </p>
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
    <div className="bg-gray-100 rounded-lg p-6">
      <div className="h-6 w-24 bg-muted animate-pulse rounded mb-4" />
      <div className="h-16 bg-muted animate-pulse rounded" />
    </div>
  );
}
