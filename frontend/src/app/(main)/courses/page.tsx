'use client';

import { useState, useEffect } from 'react';
import {
  WBCourseCard,
  WBCourseCardSkeleton,
  OrderRecordSection,
  OrderRecordSkeleton,
  CouponNotice,
  CouponNoticeSkeleton,
  PurchaseSteps,
} from '@/components/course';
import { CourseCardData, OrderRecord } from '@/types/course-card';

const MOCK_COURSES: CourseCardData[] = [
  {
    id: 'software-design-pattern',
    title: '軟體設計模式精通之旅',
    instructor: '水球學院',
    description:
      '這門課程要帶你「用半年的時間，徹底學會如何結合 TDD、BDD 與 AI，實現 100% 全自動化、高精準度的程式開發」。',
    isOwned: false,
    isPaidOnly: true,
  },
  {
    id: 'ai-x-bdd',
    title: 'AI x BDD：規格驅動全自動開發術',
    instructor: '水球學院',
    description:
      '這門課程要帶你「用半年的時間，徹底學會如何結合 TDD、BDD 與 AI，實現 100% 全自動化、高精準度的程式開發」。',
    isOwned: false,
    isPaidOnly: true,
    price: 7799,
    originalPrice: 15999,
  },
];

export default function CoursesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [courses, setCourses] = useState<CourseCardData[]>([]);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<CourseCardData | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCourses(MOCK_COURSES);
      setOrders([]);
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handlePurchase = (courseId: string) => {
    const course = courses.find((c) => c.id === courseId);
    if (course) {
      setSelectedCourse(course);
    }
  };

  if (selectedCourse) {
    return (
      <div className="min-h-screen bg-[#1B2838]">
        <div className="bg-[#0066CC] py-6">
          <div className="container mx-auto px-4">
            <PurchaseSteps currentStep={1} />
          </div>
        </div>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-[#0066CC] rounded-lg p-8 text-white">
            <h1 className="text-2xl font-bold mb-6">{selectedCourse.title}</h1>
            <p className="mb-4 leading-relaxed">
              這門課程要帶你「用半年的時間，徹底學會如何結合 TDD、BDD 與
              AI，實現 100% 全自動化、高精準度的程式開發」。上完課後，你不只是理解方法，更能真正把
              AI 落實到專案裡，從此不再困在無止盡的 Debug 與
              Review，而是成為團隊裡能制定規格與標準的工程師。
            </p>
            <p className="mb-4 leading-relaxed">
              在這趟學習過程中，你將透過影音課程、專屬社群、每週研討會與實戰演練，逐步掌握如何用規格驅動開發，讓
              AI 自動完成從測試到程式修正的一整套流程。本課程將自 9/22
              起每週陸續上架新單元，確保你能循序學習、穩定進步。現在購買僅需
              NT$7,799（原價 NT$15,999），未來隨著開課內容愈完整，價格也會逐步上漲。
            </p>
            <p className="leading-relaxed">
              只要你願意跟著每週內容踏實學習，我能保證在半年內，你將能真正掌握 AI x BDD
              的核心思維與實作方法，做到規格驅動、全自動化、高精準度的開發。這是大多數工程師甚至許多架構師都未曾系統性鍛鍊過的能力，而你將是那少數能用
              AI 驅動專案的人。
            </p>
          </div>
          <div className="mt-6">
            <CouponNotice
              hasDiscount={true}
              discountCourses={['軟體設計模式精通之旅', 'AI x BDD 行為驅動開發工作坊']}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-[#1B1B1F]">課程列表</h1>

      {isLoading ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {[...Array(2)].map((_, i) => (
              <WBCourseCardSkeleton key={i} />
            ))}
          </div>
          <OrderRecordSkeleton />
          <div className="mt-6">
            <CouponNoticeSkeleton />
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {courses.map((course) => (
              <WBCourseCard
                key={course.id}
                course={course}
                onPurchase={handlePurchase}
              />
            ))}
          </div>
          <OrderRecordSection orders={orders} />
          <div className="mt-6">
            <CouponNotice
              hasDiscount={true}
              discountCourses={['軟體設計模式精通之旅', 'AI x BDD 行為驅動開發工作坊']}
            />
          </div>
        </>
      )}
    </div>
  );
}
