"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, BookOpen, BarChart, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface RightSidebarProps {
  courseId: string;
}

export function RightSidebar({ courseId }: RightSidebarProps) {
  const [isOpen, setIsOpen] = useState(true);
  const pathname = usePathname();

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-20 right-4 z-40"
      >
        {isOpen ? (
          <>
            <ChevronRight className="h-4 w-4 mr-2" />
            收合側邊欄
          </>
        ) : (
          <>
            <ChevronLeft className="h-4 w-4 mr-2" />
            展開側邊欄
          </>
        )}
      </Button>

      <aside
        className={cn(
          "fixed top-16 right-0 h-[calc(100vh-4rem)] border-l bg-background transition-all duration-300 overflow-auto",
          isOpen ? "w-[280px]" : "w-0 border-l-0"
        )}
      >
        <div className={cn("p-4", !isOpen && "hidden")}>
          <div className="mb-4 pb-4 border-b">
            <Link
              href="/courses"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>返回課程列表</span>
            </Link>
          </div>

          <div className="mb-4 pb-4 border-b">
            <h2 className="font-semibold text-lg">課程 {courseId}</h2>
          </div>

          <nav>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-3">
              課程內容
            </h3>
            <ul className="space-y-1">
              <li>
                <Link
                  href={`/courses/${courseId}`}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                    pathname === `/courses/${courseId}` && "bg-accent"
                  )}
                >
                  <BookOpen className="h-4 w-4" />
                  <span>所有單元</span>
                </Link>
              </li>
              <li>
                <Link
                  href={`/courses/${courseId}`}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                    "hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <BarChart className="h-4 w-4" />
                  <span>學習進度</span>
                </Link>
              </li>
              <li>
                <Link
                  href={`/courses/${courseId}`}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                    "hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <FileText className="h-4 w-4" />
                  <span>Prompt 寶典</span>
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </aside>
    </>
  );
}
