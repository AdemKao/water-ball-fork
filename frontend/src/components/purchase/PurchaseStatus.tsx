'use client';

import { PurchaseStatus as PurchaseStatusType } from '@/types';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Clock, AlertTriangle, Loader2 } from 'lucide-react';

interface PurchaseStatusProps {
  status: PurchaseStatusType;
  failureReason?: string | null;
  onRetry?: () => void;
  onBackToCourse?: () => void;
}

export function PurchaseStatus({
  status,
  failureReason,
  onRetry,
  onBackToCourse,
}: PurchaseStatusProps) {
  const statusConfig: Record<PurchaseStatusType, {
    icon: React.ReactNode;
    title: string;
    description: string;
    color: string;
  }> = {
    PENDING: {
      icon: <Loader2 className="h-12 w-12 animate-spin" />,
      title: '正在確認付款結果...',
      description: '請稍候，我們正在確認您的付款狀態',
      color: 'text-blue-500',
    },
    COMPLETED: {
      icon: <CheckCircle2 className="h-12 w-12" />,
      title: '付款成功',
      description: '您的購買已完成',
      color: 'text-green-500',
    },
    FAILED: {
      icon: <XCircle className="h-12 w-12" />,
      title: '付款失敗',
      description: failureReason || '付款處理時發生錯誤，請重新嘗試',
      color: 'text-red-500',
    },
    CANCELLED: {
      icon: <AlertTriangle className="h-12 w-12" />,
      title: '購買已取消',
      description: '您已取消此次購買',
      color: 'text-yellow-500',
    },
    EXPIRED: {
      icon: <Clock className="h-12 w-12" />,
      title: '訂單已過期',
      description: '此訂單已超過付款期限，請重新購買',
      color: 'text-gray-500',
    },
  };

  const config = statusConfig[status];

  return (
    <div className="mx-auto max-w-md text-center" data-testid={`purchase-status-${status.toLowerCase()}`}>
      <div className={`mb-6 flex justify-center ${config.color}`}>
        {config.icon}
      </div>

      <h1 className="mb-2 text-2xl font-bold">{config.title}</h1>
      <p className="mb-8 text-muted-foreground">{config.description}</p>

      {(status === 'FAILED' || status === 'CANCELLED' || status === 'EXPIRED') && (
        <div className="flex flex-col gap-3">
          {onRetry && (
            <Button onClick={onRetry} className="w-full" data-testid="retry-button">
              {status === 'EXPIRED' ? '重新購買' : '重新嘗試'}
            </Button>
          )}
          {onBackToCourse && (
            <Button 
              variant="outline" 
              onClick={onBackToCourse} 
              className="w-full"
              data-testid="back-to-course-button"
            >
              返回課程
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
