import { Navbar } from "@/components/layout/navbar";
import { Sider } from "@/components/layout/sider";
import { MainContent } from "@/components/layout/main-content";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex flex-1">
        <Sider />
        <MainContent>{children}</MainContent>
      </div>
    </div>
  );
}
