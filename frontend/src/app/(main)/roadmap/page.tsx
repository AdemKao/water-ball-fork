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
import { useRoadmapData, RoadmapGym } from '@/hooks/useRoadmapData';

const DEFAULT_JOURNEY_ID = 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44';

function gymsToSections(gyms: RoadmapGym[]): ChallengeSection[] {
  return gyms.map((gym) => ({
    title: gym.title,
    challenges: gym.problems.map((problem, index) => ({
      id: problem.id,
      number: `${index + 1}`,
      title: problem.title,
      stars: problem.difficulty,
      isLocked: !gym.isPurchased || !problem.isUnlocked,
      href: `/gyms/${gym.id}/problems/${problem.id}`,
    })),
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

  const { gyms, isLoading: isLoadingGyms } = useRoadmapData(selectedJourneyId);

  const mainQuestGyms = gyms.filter(g => g.type === 'MAIN_QUEST');
  const sideQuestGyms = gyms.filter(g => g.type === 'SIDE_QUEST');

  const mainQuestData = gymsToSections(mainQuestGyms);
  const sideQuestData = gymsToSections(sideQuestGyms);

  const totalProblems = gyms.reduce((acc, gym) => acc + gym.problems.length, 0);
  const completedCount = gyms.reduce((acc, gym) => 
    acc + gym.problems.filter(p => p.isCompleted).length, 0);

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
        cleared={completedCount}
        total={totalProblems}
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
