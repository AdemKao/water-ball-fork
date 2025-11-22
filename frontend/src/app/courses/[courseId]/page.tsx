export default function CourseJourneyPage({
  params,
}: {
  params: { courseId: string };
}) {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Course Journey</h1>
      <p className="text-muted-foreground mb-2">
        Course ID: {params.courseId}
      </p>
      <p className="text-muted-foreground">
        View course outline and progress
      </p>
    </div>
  );
}
