"use client";

import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
  shadow?: "none" | "sm" | "md" | "lg";
  rounded?: "sm" | "md" | "lg" | "xl";
  onClick?: () => void;
}

export function Card({
  children,
  className,
  hover = false,
  padding = "md",
  shadow = "md",
  rounded = "lg",
  onClick,
}: CardProps) {
  const paddings = {
    none: "",
    sm: "p-3",
    md: "p-4 md:p-6",
    lg: "p-6 md:p-8",
  };

  const shadows = {
    none: "",
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-lg",
  };

  const roundeds = {
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-white border border-[#E5E7EB]",
        paddings[padding],
        shadows[shadow],
        roundeds[rounded],
        hover && "transition-all duration-200 hover:shadow-lg hover:-translate-y-1 cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}
