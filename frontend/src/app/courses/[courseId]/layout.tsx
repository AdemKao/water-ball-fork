import { CourseSider } from "@/components/layout/course-sider";
import { MainContent } from "@/components/layout/main-content";

export default function CourseLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { courseId: string };
}) {
  return (
    <div className="flex min-h-screen">
      <CourseSider courseId={params.courseId} />
      <MainContent>{children}</MainContent>
    </div>
  );
}
