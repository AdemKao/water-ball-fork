"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, Trophy, Grid3x3, Map, Book, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";

interface NavigationItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  authRequired?: boolean;
}

const navigationGroups: NavigationItem[][] = [
  [
    { label: "首頁", href: "/", icon: Home },
    { label: "課程", href: "/courses", icon: BookOpen },
    { label: "個人檔案", href: "/profile", icon: User, authRequired: true },
  ],
  [{ label: "排行榜", href: "/leaderboard", icon: Trophy }],
  [
    { label: "所有單元", href: "/missions", icon: Grid3x3 },
    { label: "挑戰地圖", href: "/roadmap", icon: Map },
    { label: "SOP 寶典", href: "/sop", icon: Book },
  ],
];

function SiderContent({ collapsed = false }: { collapsed?: boolean }) {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex flex-col h-full">
      <nav className={cn("flex-1 overflow-auto px-3", collapsed ? "pt-4" : "pt-6")}>
        {navigationGroups.map((group, groupIndex) => {
          const filteredGroup = group.filter(
            (item) => !item.authRequired || isAuthenticated
          );
          if (filteredGroup.length === 0) return null;

          return (
            <div key={groupIndex}>
              {groupIndex > 0 && <Separator className="my-2" />}
              <ul className="space-y-1 py-2">
                {filteredGroup.map((item) => {
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
          );
        })}
      </nav>
    </div>
  );
}

export function Sider({ mobileOpen, onMobileOpenChange }: { mobileOpen?: boolean; onMobileOpenChange?: (open: boolean) => void }) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = mobileOpen ?? internalOpen;
  const setIsOpen = onMobileOpenChange ?? setInternalOpen;

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
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
