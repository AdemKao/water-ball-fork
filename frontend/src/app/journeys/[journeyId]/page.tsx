"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { ChevronDown, ChevronUp, Play, Award, Smartphone, Globe, FileText, ClipboardList } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Container } from "@/components/shared/Container";
import { CTAButton } from "@/components/shared/CTAButton";
import { useJourney } from "@/hooks/useJourney";
import { ChapterWithLessons, LessonSummary } from "@/types";

function getLessonIcon(lessonType: string) {
  switch (lessonType) {
    case 'VIDEO':
      return <Play className="w-4 h-4 text-primary" />;
    case 'ARTICLE':
      return <FileText className="w-4 h-4 text-primary" />;
    case 'GOOGLE_FORM':
      return <ClipboardList className="w-4 h-4 text-primary" />;
    default:
      return <Play className="w-4 h-4 text-primary" />;
  }
}

function AccordionSection({ chapter, isOpen, onToggle }: { chapter: ChapterWithLessons; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border border-white/10 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 bg-[#1e293b] hover:bg-[#2d3a4f] transition-colors text-left"
      >
        <span className="text-lg font-semibold text-white">{chapter.title}</span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>
      {isOpen && (
        <div className="p-5 bg-[#0f172a]">
          {chapter.description && (
            <p className="text-gray-300 mb-4">{chapter.description}</p>
          )}
          {chapter.lessons && chapter.lessons.length > 0 && (
            <ul className="space-y-2">
              {chapter.lessons.map((lesson: LessonSummary) => (
                <li key={lesson.id} className="flex items-center gap-2 text-gray-400">
                  {getLessonIcon(lesson.lessonType)}
                  <span>{lesson.title}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function StepIndicator({ step, label, active }: { step: number; label: string; active: boolean }) {
  return (
    <div className="flex flex-col items-center">
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${
          active ? "bg-[#0f172a] text-white border-2 border-white" : "bg-[#0f172a]/50 text-gray-400 border border-gray-500"
        }`}
      >
        {step}
      </div>
      <span className={`mt-2 text-sm ${active ? "text-white" : "text-gray-400"}`}>{label}</span>
    </div>
  );
}

export default function JourneyDetailPage() {
  const params = useParams();
  const journeyId = params.journeyId as string;
  const { journey, isLoading, error } = useJourney(journeyId);
  const [openSections, setOpenSections] = useState<string[]>([]);

  const toggleSection = (id: string) => {
    setOpenSections((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f172a]">
        <Navbar />
        <div className="flex items-center justify-center h-[50vh]">
          <div className="text-white text-xl">載入中...</div>
        </div>
      </div>
    );
  }

  if (error || !journey) {
    return (
      <div className="min-h-screen bg-[#0f172a]">
        <Navbar />
        <div className="flex items-center justify-center h-[50vh]">
          <div className="text-red-400 text-xl">
            {error ? `載入課程時發生錯誤：${error.message}` : '找不到課程'}
          </div>
        </div>
      </div>
    );
  }

  const totalLessons = journey.chapters?.reduce((sum, ch) => sum + (ch.lessons?.length || 0), 0) || journey.lessonCount;

  return (
    <div className="min-h-screen bg-[#0f172a]">
      <Navbar />
      
      <main>
        <section className="bg-[#2563eb] py-12">
          <Container>
            <div className="flex items-center justify-between mb-8">
              <StepIndicator step={1} label="建立訂單" active={true} />
              <div className="flex-1 h-px bg-white/30 mx-4" />
              <StepIndicator step={2} label="完成支付" active={false} />
              <div className="flex-1 h-px bg-white/30 mx-4" />
              <StepIndicator step={3} label="約定開學" active={false} />
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">
              {journey.title}
            </h1>

            {journey.description && (
              <div className="space-y-6 text-white/90 text-lg leading-relaxed">
                <p>{journey.description}</p>
              </div>
            )}
          </Container>
        </section>

        <section className="bg-[#fef3c7] py-4">
          <Container>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#f59e0b] flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-sm">!</span>
              </div>
              <p className="text-[#92400e]">
                課程購買後不會馬上開始，你可以依照自己的狀況，選擇最適合的時間開始學習。無論是下個月，甚至是三個月後，完全不影響你的學習安排。
              </p>
            </div>
          </Container>
        </section>

        <section className="py-16 bg-[#0f172a]">
          <Container>
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="bg-[#1e293b] rounded-xl p-8 flex items-center gap-6">
                <div className="text-5xl font-bold text-primary">{totalLessons}+</div>
                <div className="text-gray-300">
                  <div className="text-xl font-semibold text-white">堂課程</div>
                  <div>完整涵蓋核心知識</div>
                </div>
              </div>
              <div className="bg-[#1e293b] rounded-xl p-8 flex items-center gap-6">
                <div className="text-5xl font-bold text-primary">{journey.chapterCount}</div>
                <div className="text-gray-300">
                  <div className="text-xl font-semibold text-white">個章節</div>
                  <div>循序漸進的學習路徑</div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <CTAButton href={`/courses/${journeyId}/purchase`} variant="primary" size="lg">
                立即加入課程
              </CTAButton>
              <CTAButton href="#" variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                預約 1v1
              </CTAButton>
            </div>
          </Container>
        </section>

        <section className="py-16 bg-[#0f172a]">
          <Container>
            <h2 className="text-2xl font-bold text-white mb-8">課程內容</h2>
            <div className="space-y-4">
              {journey.chapters && journey.chapters.length > 0 ? (
                journey.chapters.map((chapter) => (
                  <AccordionSection
                    key={chapter.id}
                    chapter={chapter}
                    isOpen={openSections.includes(chapter.id)}
                    onToggle={() => toggleSection(chapter.id)}
                  />
                ))
              ) : (
                <p className="text-gray-400">暫無課程內容</p>
              )}
            </div>
          </Container>
        </section>

        <section className="py-16 bg-[#1e293b]">
          <Container>
            <h2 className="text-2xl font-bold text-white text-center mb-12">專業完課認證</h2>
            
            <div className="max-w-3xl mx-auto mb-12">
              <div className="bg-gradient-to-br from-primary to-primary/80 rounded-xl p-8 text-center">
                <Award className="w-16 h-16 mx-auto mb-4 text-white" />
                <h3 className="text-2xl font-bold text-white mb-2">{journey.title} 認證</h3>
                <p className="text-white/80">完成所有課程內容後，獲得專業認證證書</p>
                <div className="mt-6 bg-white/10 rounded-lg p-4">
                  <p className="text-white/60 text-sm">Sample Certificate</p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-[#0f172a] rounded-full flex items-center justify-center">
                  <Globe className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">中文課程</h3>
                <p className="text-gray-400">全中文授課，學習無障礙</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-[#0f172a] rounded-full flex items-center justify-center">
                  <Smartphone className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">支援行動裝置</h3>
                <p className="text-gray-400">隨時隨地，都能學習</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-[#0f172a] rounded-full flex items-center justify-center">
                  <Award className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">專業完課認證</h3>
                <p className="text-gray-400">證明你的專業能力</p>
              </div>
            </div>
          </Container>
        </section>

        <section className="py-16 bg-[#0f172a]">
          <Container>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-6">準備好開始你的 {journey.title} 了嗎？</h2>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <CTAButton href={`/courses/${journeyId}/purchase`} variant="primary" size="lg">
                  立即加入課程
                </CTAButton>
                <CTAButton href="#" variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                  預約 1v1
                </CTAButton>
              </div>
            </div>
          </Container>
        </section>
      </main>

      <footer className="bg-[#0f172a] border-t border-white/10 py-8">
        <Container>
          <div className="text-center text-gray-400">
            <p>&copy; 2024 水球軟體學院. All rights reserved.</p>
          </div>
        </Container>
      </footer>
    </div>
  );
}
