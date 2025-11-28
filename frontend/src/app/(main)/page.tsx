"use client";

import Link from "next/link";
import { ArrowRight, MonitorPlay, BookText, Users, Award } from "lucide-react";
import { Button } from "@/components/ui/button";

function HeroSection() {
  return (
    <section className="py-8">
      <div className="border-t-4 border-primary bg-[#1B1B1F] rounded-lg p-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
          歡迎來到水球軟體學院
        </h1>
        <p className="text-[#9CA3AF] text-lg mb-8 max-w-4xl">
          水球軟體學院提供最先進的軟體設計思路教材，並透過線上 Code Review 來帶你掌握進階軟體架構能力。
          只要每週投資 5 小時，就能打造不平等的優勢，成為硬核的 Coding 實戰高手。
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CourseCard
            title="軟體設計模式精通之旅"
            author="水球潘"
            description="用一趟旅程的時間，成為硬核的 Coding 實戰高手"
            discount="看完課程介紹，立刻折價 3,000 元"
            primaryAction={{ label: "立刻體驗", href: "/courses" }}
          />
          <CourseCard
            title="AI x BDD：規格驅動全自動開發術"
            author="水球潘"
            description="AI Top 1% 工程師必修課，掌握規格驅動的全自動化開發"
            primaryAction={{ label: "立刻購買", href: "/courses" }}
          />
        </div>
      </div>
    </section>
  );
}

interface CourseCardProps {
  title: string;
  author: string;
  description: string;
  discount?: string;
  primaryAction: { label: string; href: string };
}

function CourseCard({
  title,
  author,
  description,
  discount,
  primaryAction,
}: CourseCardProps) {
  return (
    <div className="rounded-lg overflow-hidden">
      <div className="relative h-48 bg-gradient-to-br from-[#1a1a2e] to-[#16213e] flex items-center justify-center">
        <div className="text-center p-4">
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-500/20 rounded-lg flex items-center justify-center">
            <MonitorPlay className="w-8 h-8 text-blue-400" />
          </div>
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <p className="text-sm text-primary mt-1">精通一套能落地的高效率設計思路</p>
        </div>
      </div>
      <div className="bg-[#27272A] p-4">
        <h4 className="text-lg font-semibold text-white">{title}</h4>
        <p className="text-primary font-medium mt-1">{author}</p>
        <p className="text-[#9CA3AF] text-sm mt-2">{description}</p>
        {discount && (
          <p className="text-primary text-sm mt-3">{discount}</p>
        )}
        <Button variant="outline" asChild className="w-full mt-4 border-2 border-[#FACC15] text-[#FACC15] hover:bg-[#FACC15] hover:text-[#1B1B1F]">
          <Link href={primaryAction.href}>
            {primaryAction.label}
          </Link>
        </Button>
      </div>
    </div>
  );
}

function FeatureCardsSection() {
  const features = [
    {
      icon: MonitorPlay,
      title: "軟體設計模式之旅課程",
      description:
        "「用一趟旅程的時間，成為硬核的 Coding 高手」— 精通一套高效率的 OOAD 思路。",
      action: { label: "查看課程", href: "/courses" },
    },
    {
      icon: BookText,
      title: "水球潘的部落格",
      description:
        "觀看水球撰寫的軟體工程師職涯、軟體設計模式及架構學問，以及領域驅動設計等公開文章。",
      action: { label: "閱讀文章", href: "#" },
    },
    {
      icon: Users,
      title: "直接與老師或是其他工程師交流",
      description:
        "加入水球軟體學院的 Discord，直接與老師或是其他工程師交流技術問題。",
      action: { label: "加入社群", href: "#" },
    },
    {
      icon: Award,
      title: "技能評級及證書系統",
      description:
        "透過完成課程和通過評估，獲得技能評級及證書，證明您的專業能力。",
      action: { label: "查看評級", href: "#" },
    },
  ];

  return (
    <section className="py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((feature, index) => (
          <FeatureCard key={index} {...feature} />
        ))}
      </div>
    </section>
  );
}

interface FeatureCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action: { label: string; href: string };
}

function FeatureCard({ icon: Icon, title, description, action }: FeatureCardProps) {
  return (
    <div className="bg-[#27272A] rounded-lg p-6">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
          <p className="text-[#9CA3AF] mb-4">{description}</p>
          <Button variant="outline" asChild className="border-white/30 text-white hover:bg-white/10 group">
            <Link href={action.href}>
              {action.label}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function InstructorSection() {
  const highlights = [
    {
      badge: "經歷",
      text: "10 年軟體開發經驗，專精於物件導向分析與設計",
    },
    {
      badge: "著作",
      text: "《軟體設計模式精通之旅》課程創作者",
    },
    {
      badge: "教學",
      text: "累積超過 3000+ 學員，評價 4.9 顆星",
    },
    {
      badge: "社群",
      text: "Discord 軟體設計交流社群主理人",
    },
  ];

  return (
    <section className="py-8">
      <div className="bg-[#27272A] rounded-lg p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="flex justify-center">
            <div className="w-64 h-64 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
              <div className="w-60 h-60 rounded-full bg-[#1B1B1F] flex items-center justify-center">
                <span className="text-6xl">👨‍💻</span>
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">講師介紹</h2>
            <h3 className="text-3xl font-bold text-primary mb-6">水球潘</h3>
            <div className="space-y-4">
              {highlights.map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <span className="inline-flex items-center justify-center px-3 py-1 text-sm font-medium bg-primary text-primary-foreground rounded">
                    {item.badge}
                  </span>
                  <p className="text-[#9CA3AF]">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FooterCTASection() {
  return (
    <section className="py-8">
      <div className="bg-gradient-to-r from-primary to-primary/80 rounded-lg p-8 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
          準備好開始你的軟體設計之旅了嗎？
        </h2>
        <p className="text-white/90 mb-6 max-w-2xl mx-auto">
          立即加入水球軟體學院，與數千名工程師一起成長，掌握業界最需要的軟體設計能力。
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild className="bg-white text-primary hover:bg-white/90 px-8 py-3 h-auto text-lg font-semibold">
            <Link href="/courses">
              瀏覽課程
            </Link>
          </Button>
          <Button variant="outline" asChild className="border-2 border-white text-white hover:bg-white/10 px-8 py-3 h-auto text-lg font-semibold bg-transparent">
            <Link href="#">
              加入 Discord 社群
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="py-8 border-t border-[#27272A]">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h4 className="font-bold text-white mb-4">水球軟體學院</h4>
          <p className="text-[#9CA3AF] text-sm">
            提供最先進的軟體設計思路教材，培養硬核的 Coding 實戰高手。
          </p>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-4">課程</h4>
          <ul className="space-y-2">
            <li>
              <Link href="/courses" className="text-[#9CA3AF] hover:text-white text-sm">
                軟體設計模式之旅
              </Link>
            </li>
            <li>
              <Link href="/courses" className="text-[#9CA3AF] hover:text-white text-sm">
                AI x BDD 開發術
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-4">資源</h4>
          <ul className="space-y-2">
            <li>
              <Link href="#" className="text-[#9CA3AF] hover:text-white text-sm">
                部落格
              </Link>
            </li>
            <li>
              <Link href="#" className="text-[#9CA3AF] hover:text-white text-sm">
                Discord 社群
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-4">關於</h4>
          <ul className="space-y-2">
            <li>
              <Link href="#" className="text-[#9CA3AF] hover:text-white text-sm">
                隱私政策
              </Link>
            </li>
            <li>
              <Link href="#" className="text-[#9CA3AF] hover:text-white text-sm">
                服務條款
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="mt-8 pt-8 border-t border-[#27272A] text-center">
        <p className="text-[#9CA3AF] text-sm">
          © 2024 水球軟體學院 WATERBALLSA.TW. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <div className="max-w-[1280px] mx-auto">
      <HeroSection />
      <FeatureCardsSection />
      <InstructorSection />
      <FooterCTASection />
      <Footer />
    </div>
  );
}
