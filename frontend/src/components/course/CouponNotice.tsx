'use client';

interface CouponNoticeProps {
  hasDiscount?: boolean;
  discountCourses?: string[];
}

export function CouponNotice({ hasDiscount, discountCourses }: CouponNoticeProps) {
  return (
    <div className="bg-[#F17500]/10 border border-[#F17500]/30 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <svg
            className="w-5 h-5 text-[#F17500]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div className="text-sm text-foreground">
          {hasDiscount && discountCourses && discountCourses.length > 0 ? (
            <p>
              若你曾購買過《{discountCourses.join('》或者《')}》，請私訊{' '}
              <a href="#" className="text-[#F17500] underline hover:no-underline">
                LINE 客服
              </a>
              ，將提供您專屬折價券！
            </p>
          ) : (
            <p>
              若你曾購買過《軟體設計模式精通之旅》或者《AI x BDD 行為驅動開發工作坊》，請私訊{' '}
              <a href="#" className="text-[#F17500] underline hover:no-underline">
                LINE 客服
              </a>
              ，將提供您專屬折價券！
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function CouponNoticeSkeleton() {
  return (
    <div className="bg-muted rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div className="w-5 h-5 bg-muted-foreground/20 animate-pulse rounded-full" />
        <div className="flex-1 h-4 bg-muted-foreground/20 animate-pulse rounded" />
      </div>
    </div>
  );
}
