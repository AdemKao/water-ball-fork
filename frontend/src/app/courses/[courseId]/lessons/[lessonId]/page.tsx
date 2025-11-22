export default function LessonPage({
  params,
}: {
  params: { courseId: string; lessonId: string };
}) {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Lesson Content</h1>
      <p className="text-muted-foreground mb-2">
        Course ID: {params.courseId}
      </p>
      <p className="text-muted-foreground mb-4">
        Lesson ID: {params.lessonId}
      </p>
      <div className="border rounded-lg p-6 bg-card">
        <p className="text-muted-foreground">
          Lesson content will be displayed here
        </p>
      </div>
    </div>
  );
}
