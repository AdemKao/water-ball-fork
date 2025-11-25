import { use } from "react";
import { CourseSider } from "@/components/layout/course-sider";
import { MainContent } from "@/components/layout/main-content";

export default function CourseLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = use(params);
  return (
    <div className="flex min-h-screen">
      <CourseSider courseId={courseId} />
      <MainContent>{children}</MainContent>
    </div>
  );
}
