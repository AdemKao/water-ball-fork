'use client';

interface PricingCardProps {
  price: number;
  currency?: string;
  installmentInfo?: {
    months: number;
    monthlyPayment: number;
  };
}

export function PricingCard({
  price,
  currency = 'NT$',
  installmentInfo,
}: PricingCardProps) {
  const formattedPrice = price.toLocaleString();

  return (
    <div className="bg-card border rounded-xl p-6 space-y-4">
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-1">課程售價</p>
        <p className="text-3xl font-bold text-primary">
          {currency} {formattedPrice}
        </p>
      </div>
      {installmentInfo && (
        <div className="border-t pt-4">
          <p className="text-sm text-muted-foreground text-center">
            可分 {installmentInfo.months} 期，每期約{' '}
            <span className="font-semibold text-foreground">
              {currency} {installmentInfo.monthlyPayment.toLocaleString()}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
