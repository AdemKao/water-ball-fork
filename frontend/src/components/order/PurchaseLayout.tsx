'use client';

import { PurchaseHeader } from './PurchaseHeader';
import { OrderStepper } from './OrderStepper';

interface PurchaseLayoutProps {
  children: React.ReactNode;
  currentStep: 1 | 2 | 3;
  backHref?: string;
  backLabel?: string;
}

export function PurchaseLayout({
  children,
  currentStep,
  backHref = '/courses',
  backLabel = '返回課程列表',
}: PurchaseLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <PurchaseHeader backHref={backHref} backLabel={backLabel} />

      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="rounded-xl overflow-hidden shadow-lg mb-8">
          <OrderStepper currentStep={currentStep} />
        </div>

        {children}
      </div>
    </div>
  );
}
