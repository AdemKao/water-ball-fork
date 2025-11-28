'use client';

import { useState } from 'react';
import {
  RoadmapHeader,
  RoadmapTabs,
  ChallengeList,
  SideQuestList,
  type ChallengeSection,
  type SideQuest,
} from '@/components/roadmap';

const mainQuestData: ChallengeSection[] = [
  {
    title: '白段道館',
    challenges: [
      {
        id: '1',
        number: '4.A',
        title: '責任鏈模式練習：碰撞偵測 & 處理',
        stars: 1,
        isLocked: true,
        href: '/courses/software-design-pattern/lessons/4a',
      },
      {
        id: '2',
        number: '4.B',
        title: '狀態模式練習：角色狀態機',
        stars: 2,
        isLocked: true,
        href: '/courses/software-design-pattern/lessons/4b',
      },
      {
        id: '3',
        number: '4.C',
        title: '策略模式練習：攻擊策略切換',
        stars: 1,
        isLocked: true,
        href: '/courses/software-design-pattern/lessons/4c',
      },
    ],
  },
  {
    title: '黑段道館',
    challenges: [
      {
        id: '4',
        number: '5.A',
        title: '複合模式練習：遊戲物件組合',
        stars: 3,
        isLocked: true,
        href: '/courses/software-design-pattern/lessons/5a',
      },
      {
        id: '5',
        number: '5.B',
        title: '工廠模式練習：物件工廠',
        stars: 2,
        isLocked: true,
        href: '/courses/software-design-pattern/lessons/5b',
      },
    ],
  },
];

const sideQuestData: SideQuest[] = [
  {
    id: 's1',
    category: 'A',
    title: '單例模式：設定檔管理器',
    stars: 1,
    href: '/courses/software-design-pattern/lessons/side-a1',
  },
  {
    id: 's2',
    category: 'A',
    title: '原型模式：物件複製',
    stars: 1,
    href: '/courses/software-design-pattern/lessons/side-a2',
  },
  {
    id: 's3',
    category: 'B',
    title: '裝飾者模式：功能擴展',
    stars: 2,
    href: '/courses/software-design-pattern/lessons/side-b1',
  },
  {
    id: 's4',
    category: 'B',
    title: '代理模式：延遲載入',
    stars: 2,
    href: '/courses/software-design-pattern/lessons/side-b2',
  },
  {
    id: 's5',
    category: 'C',
    title: '命令模式：操作撤銷',
    stars: 3,
    href: '/courses/software-design-pattern/lessons/side-c1',
  },
];

export default function RoadmapPage() {
  const [activeTab, setActiveTab] = useState<'main' | 'side'>('side');

  const totalChallenges =
    mainQuestData.reduce((acc, section) => acc + section.challenges.length, 0) +
    sideQuestData.length;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <RoadmapHeader
        title="軟體設計模式精通之旅"
        daysLeft={0}
        cleared={0}
        total={totalChallenges}
        xp={0}
      />

      <div className="mt-8">
        <RoadmapTabs activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      <div className="mt-8">
        {activeTab === 'main' ? (
          <ChallengeList sections={mainQuestData} />
        ) : (
          <SideQuestList quests={sideQuestData} />
        )}
      </div>
    </div>
  );
}
