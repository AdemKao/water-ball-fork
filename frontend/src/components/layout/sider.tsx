"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, Trophy, Grid3x3, Map, Book, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";

interface NavigationItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navigationGroups: NavigationItem[][] = [
  [
    { label: "首頁", href: "/", icon: Home },
    { label: "課程", href: "/courses", icon: BookOpen },
  ],
  [{ label: "排行榜", href: "/leaderboard", icon: Trophy }],
  [
    { label: "所有單元", href: "/missions", icon: Grid3x3 },
    { label: "挑戰地圖", href: "/roadmap", icon: Map },
    { label: "SOP 寶典", href: "/sop", icon: Book },
  ],
];

function WaterballLogo() {
  return (
    <svg
      viewBox="0 0 180 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-8 w-auto"
    >
      <circle
        cx="20"
        cy="20"
        r="18"
        fill="currentColor"
        className="text-primary"
      />
      <text
        x="45"
        y="27"
        className="fill-foreground"
        style={{ fontSize: "16px", fontWeight: "bold" }}
      >
        水球軟體學院
      </text>
    </svg>
  );
}

function SiderContent({ collapsed = false }: { collapsed?: boolean }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full">
      <div
        className={cn(
          "p-6 border-b flex items-center justify-between",
          collapsed && "p-4 flex-col gap-2"
        )}
      >
        <WaterballLogo />
        {!collapsed && <ThemeToggle />}
      </div>

      <nav className="flex-1 overflow-auto px-3">
        {navigationGroups.map((group, groupIndex) => (
          <div key={groupIndex}>
            {groupIndex > 0 && <Separator className="my-2" />}
            <ul className="space-y-1 py-2">
              {group.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm",
                        "hover:bg-accent hover:text-accent-foreground",
                        isActive &&
                          "bg-primary text-primary-foreground hover:bg-primary/90"
                      )}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </div>
  );
}

export function Sider() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden fixed top-4 left-4 z-40"
        onClick={() => setMobileOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[230px] p-0">
          <SiderContent />
        </SheetContent>
      </Sheet>

      <aside className="hidden lg:block h-screen w-[230px] border-r bg-background">
        <SiderContent />
      </aside>
    </>
  );
}
