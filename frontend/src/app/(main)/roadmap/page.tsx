'use client';

import { useState, useMemo } from 'react';
import {
  RoadmapHeader,
  RoadmapTabs,
  ChallengeList,
  type ChallengeSection,
  type RoadmapTabType,
} from '@/components/roadmap';
import { useJourneyList } from '@/hooks/useJourneyList';
import { useGyms } from '@/hooks/useGym';
import { Gym } from '@/types/gym';

const DEFAULT_JOURNEY_ID = 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44';

function gymsToSections(gyms: Gym[]): ChallengeSection[] {
  return gyms.map((gym, gymIndex) => ({
    title: gym.title,
    challenges: [{
      id: gym.id,
      number: `${gymIndex + 1}`,
      title: `${gym.problemCount} 題 (${gym.completedCount} 完成)`,
      stars: 1,
      isLocked: !gym.isPurchased,
      href: `/gym/${gym.id}`,
    }],
  }));
}

export default function RoadmapPage() {
  const [activeTab, setActiveTab] = useState<RoadmapTabType>('main');
  const [selectedJourneyIdOverride, setSelectedJourneyIdOverride] = useState<string | null>(null);
  
  const { journeys, isLoading: isLoadingJourneys } = useJourneyList();

  const selectedJourneyId = useMemo(() => {
    if (selectedJourneyIdOverride && journeys.find(j => j.id === selectedJourneyIdOverride)) {
      return selectedJourneyIdOverride;
    }
    const defaultExists = journeys.find(j => j.id === DEFAULT_JOURNEY_ID);
    if (defaultExists) {
      return DEFAULT_JOURNEY_ID;
    }
    return journeys[0]?.id ?? DEFAULT_JOURNEY_ID;
  }, [journeys, selectedJourneyIdOverride]);

  const { gyms, isLoading: isLoadingGyms } = useGyms(selectedJourneyId);

  const mainQuestGyms = gyms.filter(g => g.type === 'MAIN_QUEST');
  const sideQuestGyms = gyms.filter(g => g.type === 'SIDE_QUEST');

  const mainQuestData = gymsToSections(mainQuestGyms);
  const sideQuestData = gymsToSections(sideQuestGyms);

  const mainChallengeCount = mainQuestGyms.reduce((acc, gym) => acc + gym.problemCount, 0);
  const sideChallengeCount = sideQuestGyms.reduce((acc, gym) => acc + gym.problemCount, 0);
  const totalChallenges = mainChallengeCount + sideChallengeCount;

  const clearedCount = gyms.reduce((acc, gym) => acc + gym.completedCount, 0);

  const selectedJourney = journeys.find(j => j.id === selectedJourneyId);
  const title = selectedJourney?.title ?? '挑戰地圖';

  if (isLoadingJourneys || isLoadingGyms) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-64 mx-auto mb-4" />
            <div className="h-4 bg-muted rounded w-32 mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <RoadmapHeader
        title={title}
        daysLeft={0}
        cleared={clearedCount}
        total={totalChallenges}
        xp={0}
        journeys={journeys}
        selectedJourneyId={selectedJourneyId}
        onJourneyChange={setSelectedJourneyIdOverride}
      />

      <div className="mt-8">
        <RoadmapTabs activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      <div className="mt-8">
        {activeTab === 'main' && <ChallengeList sections={mainQuestData} />}
        {activeTab === 'side' && (
          sideQuestData.length > 0 
            ? <ChallengeList sections={sideQuestData} />
            : <div className="text-center text-muted-foreground py-8">目前沒有支線任務</div>
        )}
      </div>
    </div>
  );
}
