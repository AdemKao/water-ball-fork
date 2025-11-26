'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Purchase } from '@/types';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Sparkles } from 'lucide-react';

interface PurchaseSuccessProps {
  purchase: Purchase;
  journey: {
    id: string;
    title: string;
    thumbnailUrl: string | null;
  };
}

export function PurchaseSuccess({ purchase, journey }: PurchaseSuccessProps) {
  const router = useRouter();

  const formattedAmount = new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: purchase.currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(purchase.amount);

  const formattedDate = new Date(purchase.completedAt || purchase.createdAt).toLocaleString(
    'zh-TW',
    {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }
  );

  return (
    <div className="mx-auto max-w-md text-center" data-testid="purchase-success">
      <div className="mb-6 flex justify-center">
        <div className="relative">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <Sparkles className="absolute -right-2 -top-2 h-6 w-6 text-yellow-500" />
        </div>
      </div>

      <h1 className="mb-2 text-2xl font-bold">購買成功！</h1>
      <p className="mb-8 text-muted-foreground">
        恭喜您成功購買課程，現在就開始學習吧！
      </p>

      <div className="mb-8 rounded-lg border bg-card p-6 text-left">
        <div className="mb-4 flex gap-4">
          <div className="relative h-16 w-24 overflow-hidden rounded-md bg-muted">
            {journey.thumbnailUrl ? (
              <Image
                src={journey.thumbnailUrl}
                alt={journey.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                無圖片
              </div>
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-medium">{journey.title}</h3>
            <p className="text-sm text-muted-foreground">課程已解鎖</p>
          </div>
        </div>

        <div className="space-y-2 border-t pt-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">訂單編號</span>
            <span className="font-mono">{purchase.id.slice(0, 8).toUpperCase()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">付款金額</span>
            <span>{formattedAmount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">完成時間</span>
            <span>{formattedDate}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Button
          onClick={() => router.push(`/courses/${journey.id}`)}
          className="w-full"
          data-testid="start-learning-button"
        >
          開始學習
        </Button>
        <Button
          variant="outline"
          onClick={() => router.push('/courses')}
          className="w-full"
        >
          返回課程列表
        </Button>
      </div>
    </div>
  );
}
