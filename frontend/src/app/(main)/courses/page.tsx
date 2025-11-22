import { CourseCard } from "@/components/features/CourseCard";

const mockCourses = [
  {
    title: "軟體設計模式精通之旅",
    description: "用一趟旅程的時間，成為硬核的 Coding 實戰高手",
    imageUrl: "/assets/courses-1.png",
    author: "水球潘",
    statusLabel: "尚未擁有",
    coupon: "你有一張 3,000 折價券",
    canTry: true,
    canBuy: true,
    tryDisabled: false,
    buyDisabled: false,
  },
  {
    title: "AI x BDD：規格驅動全自動開發術",
    description: "AI Top 1% 工程師必修課，掌握規格驅動的全自動化開發",
    imageUrl: "/assets/courses-journey-3.png",
    author: "水球潘",
    statusLabel: "尚未擁有",
    canTry: false,
    canBuy: true,
    tryDisabled: true,
    buyDisabled: false,
  },
  {
    title: "Next.js 實戰",
    description: "前端 SSR 與 SSG 實作。",
    imageUrl: "/assets/courses-lesson-9.png",
    author: "水球老師",
    statusLabel: "僅限付費",
    canTry: false,
    canBuy: true,
    tryDisabled: true,
    buyDisabled: false,
  },
];

export default function CoursesPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-20 py-6 md:py-12 max-w-[1920px] space-y-8">
      {/* 課程列表區塊 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
        {mockCourses.map((course, idx) => (
          <CourseCard key={idx} {...course} />
        ))}
      </div>

      {/* 訂單紀錄區塊（預留） */}
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm w-full mx-auto">
        <div className="flex flex-col space-y-1.5 p-6">
          <div className="flex items-center space-x-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-receipt h-6 w-6"
            >
              <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"></path>
              <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"></path>
              <path d="M12 17.5v-11"></path>
            </svg>
            <h3 className="text-2xl font-semibold leading-none tracking-tight text-primary">
              訂單紀錄
            </h3>
          </div>
        </div>
        <div className="p-6 pt-0">
          <div className="text-center text-muted-foreground py-8">
            目前沒有訂單記錄
          </div>
        </div>
      </div>
    </div>
  );
}
