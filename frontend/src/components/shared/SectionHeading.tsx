"use client";

import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  align?: "left" | "center" | "right";
  className?: string;
  titleClassName?: string;
  subtitleClassName?: string;
}

export function SectionHeading({
  title,
  subtitle,
  align = "center",
  className,
  titleClassName,
  subtitleClassName,
}: SectionHeadingProps) {
  const alignments = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  return (
    <div className={cn("mb-8 md:mb-12", alignments[align], className)}>
      <h2
        className={cn(
          "text-2xl md:text-3xl lg:text-4xl font-bold text-[#1B1B1F]",
          titleClassName
        )}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={cn(
            "mt-3 text-base md:text-lg text-[#4B5563] max-w-2xl",
            align === "center" && "mx-auto",
            subtitleClassName
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
