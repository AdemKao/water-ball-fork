"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { ChevronDown, ChevronUp, Play, Award, Smartphone, Globe } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Container } from "@/components/shared/Container";
import { CTAButton } from "@/components/shared/CTAButton";

interface Section {
  id: string;
  title: string;
  description: string;
  items?: string[];
}

const sections: Section[] = [
  {
    id: "intro",
    title: "副本零：軟體設計模式入門",
    description: "從基礎開始，了解什麼是設計模式，為什麼需要學習設計模式，以及如何在實際開發中應用。",
    items: ["設計模式概論", "SOLID 原則", "UML 類別圖基礎"],
  },
  {
    id: "creational",
    title: "副本一：創建型模式",
    description: "學習物件創建的最佳實踐，包括單例、工廠、建造者等模式。",
    items: ["Singleton Pattern", "Factory Pattern", "Builder Pattern", "Prototype Pattern"],
  },
  {
    id: "structural",
    title: "副本二：結構型模式",
    description: "掌握如何組合類別和物件，形成更大的結構。",
    items: ["Adapter Pattern", "Decorator Pattern", "Facade Pattern", "Composite Pattern"],
  },
  {
    id: "behavioral",
    title: "副本三：行為型模式",
    description: "了解物件之間的職責分配和演算法封裝。",
    items: ["Strategy Pattern", "Observer Pattern", "Command Pattern", "State Pattern"],
  },
  {
    id: "framework",
    title: "副本四：框架開發實戰",
    description: "將所學模式應用於實際框架開發，包括 Logging Framework、IoC Framework。",
    items: ["Logging Framework", "IoC Container", "Plugin Architecture"],
  },
  {
    id: "web",
    title: "副本五：Web Framework 開發",
    description: "挑戰開發一個完整的 Web Framework，整合所有設計模式知識。",
    items: ["Routing Engine", "Middleware Pattern", "Request/Response Pipeline"],
  },
  {
    id: "bonus",
    title: "附加內容：進階主題與實戰題庫",
    description: "額外的進階內容和大量實戰練習題，幫助你鞏固所學。",
    items: ["實戰題庫", "Code Review 練習", "架構設計案例"],
  },
];

function AccordionSection({ section, isOpen, onToggle }: { section: Section; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border border-white/10 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 bg-[#1e293b] hover:bg-[#2d3a4f] transition-colors text-left"
      >
        <span className="text-lg font-semibold text-white">{section.title}</span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>
      {isOpen && (
        <div className="p-5 bg-[#0f172a]">
          <p className="text-gray-300 mb-4">{section.description}</p>
          {section.items && (
            <ul className="space-y-2">
              {section.items.map((item, index) => (
                <li key={index} className="flex items-center gap-2 text-gray-400">
                  <Play className="w-4 h-4 text-[#F17500]" />
                  <span>{item}</span>
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
  const [openSections, setOpenSections] = useState<string[]>(["intro"]);

  const toggleSection = (id: string) => {
    setOpenSections((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

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
              軟體設計模式精通之旅 (半年特訓)
            </h1>

            <div className="space-y-6 text-white/90 text-lg leading-relaxed">
              <p>
                這門課旨在讓你「用一趟旅程的時間，成為硬核的 Coding 高手」，在軟體設計方面「徹底變強、並享受變強後的職涯好處」，上完課後便能游刃有餘地把系統做大做精。
              </p>
              <p>
                在這趟旅程中，你將從小的題目開始練起 OOAD 和設計模式，由淺入深不斷地套用設計模式、到了副本四之後就會鼓勵你將所學落地到規模大一些的框架、如：Logging Framework、IoC Framework 以及 Web Framework。
              </p>
              <p>
                只要你努力學習，我保證你能在半年內學會如何分析、精準套用設計模式和開發出大型系統（如：Web Framework / Engine），開發完之後還能留下模式語言，來佐證你的設計既合理又充分。這是八成的工程師都做不到的事，甚至許多架構師也未有機會能鍛鍊到類似的能力。
              </p>
            </div>
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
                <div className="text-5xl font-bold text-[#F17500]">100+</div>
                <div className="text-gray-300">
                  <div className="text-xl font-semibold text-white">部影片</div>
                  <div>完整涵蓋設計模式核心知識</div>
                </div>
              </div>
              <div className="bg-[#1e293b] rounded-xl p-8 flex items-center gap-6">
                <div className="text-5xl font-bold text-[#F17500]">50+</div>
                <div className="text-gray-300">
                  <div className="text-xl font-semibold text-white">大量實戰題</div>
                  <div>從練習中深化理解與應用能力</div>
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
              {sections.map((section) => (
                <AccordionSection
                  key={section.id}
                  section={section}
                  isOpen={openSections.includes(section.id)}
                  onToggle={() => toggleSection(section.id)}
                />
              ))}
            </div>
          </Container>
        </section>

        <section className="py-16 bg-[#1e293b]">
          <Container>
            <h2 className="text-2xl font-bold text-white text-center mb-12">專業完課認證</h2>
            
            <div className="max-w-3xl mx-auto mb-12">
              <div className="bg-gradient-to-br from-[#F17500] to-[#d96a00] rounded-xl p-8 text-center">
                <Award className="w-16 h-16 mx-auto mb-4 text-white" />
                <h3 className="text-2xl font-bold text-white mb-2">軟體設計模式精通認證</h3>
                <p className="text-white/80">完成所有課程內容後，獲得專業認證證書</p>
                <div className="mt-6 bg-white/10 rounded-lg p-4">
                  <p className="text-white/60 text-sm">Sample Certificate</p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-[#0f172a] rounded-full flex items-center justify-center">
                  <Globe className="w-8 h-8 text-[#F17500]" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">中文課程</h3>
                <p className="text-gray-400">全中文授課，學習無障礙</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-[#0f172a] rounded-full flex items-center justify-center">
                  <Smartphone className="w-8 h-8 text-[#F17500]" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">支援行動裝置</h3>
                <p className="text-gray-400">隨時隨地，都能學習</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-[#0f172a] rounded-full flex items-center justify-center">
                  <Award className="w-8 h-8 text-[#F17500]" />
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
              <h2 className="text-2xl font-bold text-white mb-6">準備好開始你的設計模式之旅了嗎？</h2>
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
