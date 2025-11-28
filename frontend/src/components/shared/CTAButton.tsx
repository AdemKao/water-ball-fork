"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";

interface CTAButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

export function CTAButton({
  children,
  href,
  onClick,
  variant = "primary",
  size = "md",
  className,
  disabled = false,
  type = "button",
}: CTAButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-semibold transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary",
    secondary:
      "bg-[#1B1B1F] text-white hover:bg-[#2D2D33] focus:ring-[#1B1B1F]",
    outline:
      "border-2 border-primary text-primary hover:bg-primary/10 focus:ring-primary",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  const classes = cn(baseStyles, variants[variant], sizes[size], className);

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classes}
    >
      {children}
    </button>
  );
}
