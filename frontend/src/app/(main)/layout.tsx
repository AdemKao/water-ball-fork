import { Sider } from "@/components/layout/sider";
import { MainContent } from "@/components/layout/main-content";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sider />
      <MainContent>{children}</MainContent>
    </div>
  );
}
