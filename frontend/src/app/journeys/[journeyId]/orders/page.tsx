'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  OrderStepper,
  CourseDescription,
  PricingCard,
  OrderAccordion,
} from '@/components/order';

const courseData = {
  title: '軟體設計模式精通之旅 (半年特訓)',
  description: [
    '這門課旨在讓你「用一趟旅程的時間，成為硬核的 Coding 高手」，在軟體設計方面「徹底變強、並享受變強後的職涯好處」，上完課後便能游刃有餘地把系統做大做精。',
    '在這趟旅程中，你將從小的題目開始練起 OOAD 和設計模式，由淺入深不斷地套用設計模式、到了副本四之後就會鼓勵你將所學落地到規模大一些的框架、如：Logging Framework、 IoC Framework 以及 Web Framework。',
  ],
  guarantee:
    '只要你努力學習，我保證你能在半年內學會如何分析、精準套用設計模式和開發出大型系統（如：Web Framework / Engine），開發完之後還能留下模式語言，來佐證你的設計既合理又充分。這是八成的工程師都做不到的事，甚至許多架構師也未有機會能鍛鍊到類似的能力。',
  notice:
    '課程購買後不會馬上開始，你可以依照自己的狀況，選擇最適合的時間開始學習。無論是下個月，甚至是三個月後，完全不影響你的學習安排。',
  price: 36000,
  installmentInfo: {
    months: 12,
    monthlyPayment: 3000,
  },
};

const accordionItems = [
  {
    title: '副本內容',
    content: [
      '副本一：OOAD 入門 - 物件導向分析與設計基礎',
      '副本二：設計模式入門 - 23 種經典設計模式',
      '副本三：進階設計模式 - 複合模式與架構模式',
      '副本四：框架開發 - Logging / IoC / Web Framework',
    ],
  },
  {
    title: '服務內容',
    content: [
      '半年內無限次觀看所有課程影片',
      '專屬 Discord 社群討論區',
      '每週直播 Q&A 答疑',
      '作業批改與程式碼審查',
    ],
  },
];

export default function OrdersPage({
  params,
}: {
  params: Promise<{ journeyId: string }>;
}) {
  const { journeyId } = use(params);
  const router = useRouter();

  const handleNextStep = () => {
    router.push(`/courses/${journeyId}/purchase`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="rounded-xl overflow-hidden shadow-lg">
          <OrderStepper currentStep={1} />
          <CourseDescription
            title={courseData.title}
            description={courseData.description}
            guarantee={courseData.guarantee}
            notice={courseData.notice}
          />
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <PricingCard
            price={courseData.price}
            installmentInfo={courseData.installmentInfo}
          />
          <div className="space-y-4">
            <OrderAccordion items={accordionItems} />
          </div>
        </div>

        <div className="mt-8">
          <Button
            onClick={handleNextStep}
            className="w-full h-12 text-lg bg-primary hover:bg-primary/90"
          >
            下一步：選取付款方式
          </Button>
        </div>
      </div>
    </div>
  );
}
