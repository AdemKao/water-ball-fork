"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Sider } from "@/components/layout/sider";
import { MainContent } from "@/components/layout/main-content";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar onMenuClick={() => setMobileOpen(true)} />
      <div className="flex flex-1">
        <Sider mobileOpen={mobileOpen} onMobileOpenChange={setMobileOpen} />
        <MainContent>{children}</MainContent>
      </div>
    </div>
  );
}
