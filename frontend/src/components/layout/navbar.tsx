"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Bell, Menu } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/hooks/useAuth";
import { UserMenu } from "@/components/auth";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  journeyId?: string;
  onMenuClick?: () => void;
}

export function Navbar({ journeyId, onMenuClick }: NavbarProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();

  const loginUrl = `/login?redirect=${encodeURIComponent(pathname)}`;

  return (
    <header className="sticky top-0 z-50 w-full h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-full items-center justify-between px-4 py-4 md:px-8">
        <div className="flex items-center gap-2">
          {onMenuClick && (
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={onMenuClick}
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <Link href="/" className="flex items-center gap-2">
          <Image
            src="/waterball.png"
            alt="水球軟體學院"
            width={32}
            height={32}
            className="h-8 w-8"
          />
          <div className="hidden sm:block">
            <p className="text-sm font-semibold">水球軟體學院</p>
            <p className="text-xs text-muted-foreground uppercase">WATERBALLSA.TW</p>
          </div>
        </Link>
        </div>

        <div className="flex items-center gap-4">
          {journeyId && (
            <Link href={`/journeys/${journeyId}/roadmap`}>
              <Button
                variant="outline"
                className="border-primary text-primary hover:bg-primary/10 hidden sm:flex"
              >
                <span className="mr-2">🏛️</span>
                前往挑戰
              </Button>
            </Link>
          )}
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
          <ThemeToggle />
          {isLoading ? (
            <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
          ) : isAuthenticated ? (
            <UserMenu />
          ) : (
            <Button asChild variant="outline" size="sm">
              <Link href={loginUrl}>登入</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
