'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Menu, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

interface CourseHeaderProps {
  onMenuClick?: () => void;
  journeyId?: string;
}

export function CourseHeader({ onMenuClick, journeyId }: CourseHeaderProps) {
  const { user } = useAuth();

  return (
    <header className="h-16 border-b bg-background flex items-center justify-between px-4">
      <div className="flex items-center gap-4">
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
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex items-center gap-2">
        {journeyId && (
          <Link href={`/journeys/${journeyId}/roadmap`}>
            <Button
              variant="outline"
              className="border-[#F17500] text-[#F17500] hover:bg-[#F17500]/10 hidden sm:flex"
            >
              <span className="mr-2">🏛️</span>
              前往挑戰
            </Button>
          </Link>
        )}
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>
        {user ? (
          <div className="w-9 h-9 rounded-full border-2 border-[#F17500] bg-muted flex items-center justify-center">
            <span className="text-sm font-medium">
              {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
            </span>
          </div>
        ) : (
          <Link href="/login">
            <Button variant="ghost" size="sm">登入</Button>
          </Link>
        )}
      </div>
    </header>
  );
}
