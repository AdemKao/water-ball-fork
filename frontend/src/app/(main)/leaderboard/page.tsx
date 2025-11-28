'use client';

import { useState, Suspense } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface LeaderboardUser {
  rank: number;
  name: string;
  avatar: string;
  title?: string;
  level?: number;
  xp: number;
}

const mockLearningData: LeaderboardUser[] = [
  { rank: 1, name: 'CHIA-WEI Liu', avatar: '/avatars/1.png', xp: 15200 },
  { rank: 2, name: 'Han', avatar: '/avatars/2.png', xp: 12800 },
  { rank: 3, name: 'HCC', avatar: '/avatars/3.png', title: 'Engineer', xp: 11500 },
  { rank: 4, name: 'Abe Hsiao', avatar: '/avatars/4.png', title: '初級工程師', xp: 9800 },
  { rank: 5, name: 'John Doe', avatar: '/avatars/5.png', title: '中級工程師', xp: 8500 },
  { rank: 6, name: 'Jane Smith', avatar: '/avatars/6.png', xp: 7200 },
  { rank: 7, name: 'Alex Chen', avatar: '/avatars/7.png', title: '高級工程師', xp: 6100 },
  { rank: 8, name: 'Mike Wang', avatar: '/avatars/8.png', xp: 5500 },
];

const mockWeeklyData: LeaderboardUser[] = [
  { rank: 1, name: 'CHIA-WEI Liu', avatar: '/avatars/1.png', xp: 2300 },
  { rank: 2, name: 'Han', avatar: '/avatars/2.png', xp: 2105 },
  { rank: 3, name: 'HCC', avatar: '/avatars/3.png', title: 'Engineer', xp: 2050 },
  { rank: 4, name: 'Abe Hsiao', avatar: '/avatars/4.png', title: '初級工程師', xp: 620 },
  { rank: 5, name: 'John Doe', avatar: '/avatars/5.png', xp: 580 },
  { rank: 6, name: 'Jane Smith', avatar: '/avatars/6.png', title: '資深工程師', xp: 450 },
];

function LeaderboardRowSkeleton() {
  return (
    <div className="flex items-center gap-4 bg-[#1a2332] rounded-lg px-6 py-4">
      <Skeleton className="w-8 h-8 bg-gray-700" />
      <Skeleton className="w-14 h-14 rounded-full bg-gray-700" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-32 bg-gray-700" />
        <Skeleton className="h-4 w-20 bg-gray-700" />
      </div>
      <Skeleton className="h-6 w-16 bg-gray-700" />
    </div>
  );
}

function LeaderboardSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <LeaderboardRowSkeleton key={i} />
      ))}
    </div>
  );
}

function LeaderboardRow({ user }: { user: LeaderboardUser }) {
  return (
    <div className="flex items-center gap-4 bg-[#1a2332] rounded-lg px-6 py-4 hover:bg-[#1f2a3d] transition-colors">
      <span className="text-3xl font-bold text-white w-10 text-center">
        {user.rank}
      </span>
      <div className="relative w-14 h-14 rounded-full overflow-hidden bg-gray-600 flex-shrink-0">
        <Image
          src={user.avatar}
          alt={user.name}
          fill
          className="object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`;
          }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white font-medium truncate">{user.name}</p>
        {user.title && (
          <p className="text-gray-400 text-sm truncate">{user.title}</p>
        )}
      </div>
      <span className="text-white text-xl font-semibold tabular-nums">
        {user.xp.toLocaleString()}
      </span>
    </div>
  );
}

function LeaderboardList({ data }: { data: LeaderboardUser[] }) {
  return (
    <div className="space-y-3 overflow-x-auto">
      <div className="min-w-[500px] md:min-w-0 space-y-3">
        {data.map((user) => (
          <LeaderboardRow key={user.rank} user={user} />
        ))}
      </div>
    </div>
  );
}

function GuestRow() {
  return (
    <div className="flex items-center gap-4 bg-[#1a2332] rounded-lg px-6 py-4 mt-4 border-2 border-dashed border-gray-600">
      <span className="text-3xl font-bold text-gray-500 w-10 text-center">-</span>
      <div className="relative w-14 h-14 rounded-full overflow-hidden bg-gray-600 flex-shrink-0 flex items-center justify-center">
        <Image
          src="https://ui-avatars.com/api/?name=Guest&background=4a5568&color=fff"
          alt="訪客"
          fill
          className="object-cover"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-gray-400 font-medium">訪客</p>
        <p className="text-gray-500 text-sm">初級工程師</p>
      </div>
      <span className="text-gray-500 text-xl font-semibold">0</span>
    </div>
  );
}

type TabType = 'learning' | 'weekly';

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState<TabType>('learning');

  const tabs: { id: TabType; label: string }[] = [
    { id: 'learning', label: '學習排行榜' },
    { id: 'weekly', label: '本週成長榜' },
  ];

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div
        role="tablist"
        aria-label="排行榜類型"
        className="inline-flex gap-2 mb-6"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={activeTab === tab.id}
            aria-controls={`tabpanel-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'px-6 py-2 rounded-full text-sm font-medium transition-colors',
              activeTab === tab.id
                ? 'bg-[#F17500] text-white'
                : 'bg-[#2a3544] text-gray-300 hover:bg-[#3a4554]'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {tabs.map((tab) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`tabpanel-${tab.id}`}
          aria-labelledby={`tab-${tab.id}`}
          hidden={activeTab !== tab.id}
        >
          {activeTab === tab.id && (
            <Suspense fallback={<LeaderboardSkeleton />}>
              <LeaderboardList
                data={tab.id === 'learning' ? mockLearningData : mockWeeklyData}
              />
            </Suspense>
          )}
        </div>
      ))}

      <GuestRow />
    </div>
  );
}
