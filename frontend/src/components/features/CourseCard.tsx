import React from "react";
import Image from "next/image";

export interface CourseCardProps {
  title: string;
  description: string;
  imageUrl: string;
  author?: string;
  statusLabel?: string; // 狀態標籤
  coupon?: string; // 折價券
  canTry?: boolean; // 是否可試聽
  canBuy?: boolean; // 是否可購買
  tryDisabled?: boolean; // 試聽按鈕是否 disabled
  buyDisabled?: boolean; // 購買按鈕是否 disabled
}

export const CourseCard: React.FC<CourseCardProps> = ({
  title,
  description,
  imageUrl,
  author,
  statusLabel,
  coupon,
  canTry,
  canBuy,
  tryDisabled,
  buyDisabled,
}) => (
  <div className="rounded-lg border bg-card text-card-foreground shadow-sm flex flex-col h-full w-full max-w-xs mx-auto cursor-pointer select-none transition-transform hover:scale-105 border-primary relative overflow-hidden">
    <div className="relative w-full h-40 bg-muted shrink-0">
      <Image src={imageUrl} alt={title} fill className="object-cover" />
    </div>
    <div className="space-y-2 p-4 grow">
      <h3 className="text-base font-semibold leading-tight">{title}</h3>
      <div className="flex justify-between items-center">
        {author && (
          <div className="text-base font-bold text-yellow-400">{author}</div>
        )}
        {statusLabel && (
          <div className="inline-flex items-center rounded-full border transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent hover:bg-primary/80 text-xs font-bold px-3 py-1 bg-yellow-500 text-black">
            {statusLabel}
          </div>
        )}
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
    <div className="flex items-center p-4 pt-0 shrink-0 mt-auto">
      <div className="w-full space-y-3">
        {coupon && (
          <div className="bg-primary text-black p-2 text-center rounded-md">
            <div className="font-bold text-sm">{coupon}</div>
          </div>
        )}
        <div className="flex gap-2">
          {canTry && (
            <button
              className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-bold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border hover:text-accent-foreground dark:text-input hover:dark:text-accent-foreground h-10 px-4 py-2 flex-1 bg-primary hover:bg-yellow-600 text-black border-primary ${
                tryDisabled ? "opacity-50 cursor-not-allowed" : ""
              }`}
              type="button"
              disabled={tryDisabled}
            >
              試聽課程
            </button>
          )}
          {canBuy && (
            <button
              className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-bold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 flex-1 bg-transparent hover:bg-yellow-500/10 text-primary border border-primary ${
                buyDisabled ? "opacity-50 cursor-not-allowed" : ""
              }`}
              type="button"
              disabled={buyDisabled}
            >
              立刻購買
            </button>
          )}
        </div>
      </div>
    </div>
  </div>
);
