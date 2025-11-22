"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, BarChart, FileText, Menu, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

interface CourseSiderProps {
  courseId: string;
}

function CourseSiderContent({ courseId, collapsed = false }: { courseId: string; collapsed?: boolean }) {
  return (
    <div className="flex flex-col h-full">
      <div className={cn("p-6 border-b flex items-center justify-between", collapsed && "p-4 flex-col gap-2")}>
        <h1 className={cn("text-xl font-bold text-primary", collapsed && "text-center text-lg")}>
          {collapsed ? "W" : "Waterball"}
        </h1>
        {!collapsed && <ThemeToggle />}
      </div>

      <div className="p-4 border-b">
        <Link
          href="/courses"
          className={cn(
            "flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors",
            collapsed && "justify-center"
          )}
          title={collapsed ? "Back to Courses" : undefined}
        >
          <ArrowLeft className="h-4 w-4 flex-shrink-0" />
          {!collapsed && <span>Back to Courses</span>}
        </Link>
      </div>

      <div className={cn("p-4 border-b", collapsed && "p-2")}>
        <h2 className={cn("font-semibold text-lg", collapsed && "text-sm text-center")}>
          {collapsed ? `C${courseId}` : `Course ${courseId}`}
        </h2>
      </div>

      <nav className="flex-1 overflow-auto p-4">
        <div className="space-y-4">
          <div>
            {!collapsed && (
              <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                Course Content
              </h3>
            )}
            <ul className="space-y-1">
              <li>
                <Link
                  href={`/courses/${courseId}`}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                    collapsed && "justify-center"
                  )}
                  title={collapsed ? "Lesson List" : undefined}
                >
                  <BookOpen className="h-4 w-4 flex-shrink-0" />
                  {!collapsed && <span>Lesson List</span>}
                </Link>
              </li>
              <li>
                <Link
                  href={`/courses/${courseId}`}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                    collapsed && "justify-center"
                  )}
                  title={collapsed ? "Course Progress" : undefined}
                >
                  <BarChart className="h-4 w-4 flex-shrink-0" />
                  {!collapsed && <span>Course Progress</span>}
                </Link>
              </li>
              <li>
                <Link
                  href={`/courses/${courseId}`}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                    collapsed && "justify-center"
                  )}
                  title={collapsed ? "Course Resources" : undefined}
                >
                  <FileText className="h-4 w-4 flex-shrink-0" />
                  {!collapsed && <span>Course Resources</span>}
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {collapsed && (
        <div className="p-4 border-t flex justify-center">
          <ThemeToggle />
        </div>
      )}
    </div>
  );
}

export function CourseSider({ courseId }: CourseSiderProps) {
  const [collapsed, setCollapsed] = useState(false);
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
          <CourseSiderContent courseId={courseId} />
        </SheetContent>
      </Sheet>

      <aside className={cn(
        "hidden md:block h-screen border-r bg-background transition-all duration-300 relative",
        collapsed ? "w-[80px]" : "w-[230px]"
      )}>
        <CourseSiderContent courseId={courseId} collapsed={collapsed} />
        
        <Button
          variant="ghost"
          size="icon"
          className="absolute -right-3 top-6 h-6 w-6 rounded-full border bg-background hidden md:flex lg:hidden"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </aside>
    </>
  );
}
