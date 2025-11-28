"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { UserMenu } from "@/components/auth";
import { CTAButton } from "./CTAButton";
import { Container } from "./Container";

const navItems = [
  { label: "首頁", href: "/" },
  { label: "課程", href: "/courses" },
  { label: "排行榜", href: "/leaderboard" },
  { label: "所有單元", href: "/missions" },
  { label: "挑戰地圖", href: "/roadmap" },
  { label: "SOP 寶典", href: "/sop" },
];

export function TopNav() {
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-[#E5E7EB]">
      <Container>
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative h-10 w-10">
              <Image
                src="/world/logo.png"
                alt="水球軟體學院"
                fill
                className="object-contain"
                priority
              />
            </div>
            <span className="font-bold text-xl text-[#1B1B1F] hidden sm:block">
              水球軟體學院
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                  pathname === item.href
                    ? "text-primary bg-primary/10"
                    : "text-[#4B5563] hover:text-[#1B1B1F] hover:bg-[#F3F4F6]"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {isLoading ? (
              <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200" />
            ) : isAuthenticated ? (
              <UserMenu />
            ) : (
              <CTAButton href="/login" size="sm">
                登入
              </CTAButton>
            )}

            <button
              type="button"
              className="lg:hidden p-2 text-[#4B5563] hover:text-[#1B1B1F]"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </Container>

      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#E5E7EB] bg-white">
          <Container>
            <nav className="py-4 flex flex-col gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                    pathname === item.href
                      ? "text-primary bg-primary/10"
                      : "text-[#4B5563] hover:text-[#1B1B1F] hover:bg-[#F3F4F6]"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </Container>
        </div>
      )}
    </header>
  );
}
