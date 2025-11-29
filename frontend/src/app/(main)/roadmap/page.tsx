'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  RoadmapHeader,
  RoadmapTabs,
  ChallengeList,
  type ChallengeSection,
  type RoadmapTabType,
} from '@/components/roadmap';
import { useJourneyList } from '@/hooks/useJourneyList';
import { useGyms } from '@/hooks/useGym';
import { Gym, GymExercise, Difficulty } from '@/types/gym';

const DEFAULT_JOURNEY_ID = 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44';

const sideQuestSections: ChallengeSection[] = [
  {
    title: 'A 類題目',
    challenges: [
      {
        id: 's1',
        number: 'A.1',
        title: '單例模式：設定檔管理器',
        stars: 1,
        isLocked: false,
        href: '/courses/software-design-pattern/lessons/side-a1',
      },
      {
        id: 's2',
        number: 'A.2',
        title: '原型模式：物件複製',
        stars: 1,
        isLocked: false,
        href: '/courses/software-design-pattern/lessons/side-a2',
      },
    ],
  },
  {
    title: 'B 類題目',
    challenges: [
      {
        id: 's3',
        number: 'B.1',
        title: '裝飾者模式：功能擴展',
        stars: 2,
        isLocked: false,
        href: '/courses/software-design-pattern/lessons/side-b1',
      },
      {
        id: 's4',
        number: 'B.2',
        title: '代理模式：延遲載入',
        stars: 2,
        isLocked: false,
        href: '/courses/software-design-pattern/lessons/side-b2',
      },
    ],
  },
  {
    title: 'C 類題目',
    challenges: [
      {
        id: 's5',
        number: 'C.1',
        title: '命令模式：操作撤銷',
        stars: 3,
        isLocked: false,
        href: '/courses/software-design-pattern/lessons/side-c1',
      },
    ],
  },
];

function difficultyToStars(difficulty: Difficulty): number {
  switch (difficulty) {
    case 'EASY': return 1;
    case 'MEDIUM': return 2;
    case 'HARD': return 3;
    default: return 1;
  }
}

interface GymWithExercises extends Gym {
  exercises: GymExercise[];
}

function useGymsWithExercises(journeyId: string | undefined) {
  const { gyms, isLoading: isLoadingGyms, error: gymsError } = useGyms(journeyId);
  const [gymsWithExercises, setGymsWithExercises] = useState<GymWithExercises[]>([]);
  const [isLoadingExercises, setIsLoadingExercises] = useState(false);
  const [exercisesError, setExercisesError] = useState<Error | null>(null);

  useEffect(() => {
    if (gyms.length === 0) {
      setGymsWithExercises([]);
      return;
    }

    const fetchAllExercises = async () => {
      setIsLoadingExercises(true);
      setExercisesError(null);
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL;
        const results = await Promise.all(
          gyms.map(async (gym) => {
            const response = await fetch(`${API_URL}/api/gyms/${gym.id}/exercises`, {
              credentials: 'include',
            });
            if (!response.ok) throw new Error(`Failed to fetch exercises for gym ${gym.id}`);
            const data = await response.json();
            return { ...gym, exercises: data.exercises || [] };
          })
        );
        setGymsWithExercises(results);
      } catch (err) {
        setExercisesError(err instanceof Error ? err : new Error('Failed to fetch exercises'));
      } finally {
        setIsLoadingExercises(false);
      }
    };

    fetchAllExercises();
  }, [gyms]);

  return {
    gymsWithExercises,
    isLoading: isLoadingGyms || isLoadingExercises,
    error: gymsError || exercisesError,
  };
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

  const { gymsWithExercises, isLoading: isLoadingGyms } = useGymsWithExercises(selectedJourneyId);

  const mainQuestData: ChallengeSection[] = gymsWithExercises.map((gym, gymIndex) => ({
    title: gym.title,
    challenges: gym.exercises.map((exercise, exerciseIndex) => ({
      id: String(exercise.id),
      number: `${gymIndex + 1}.${String.fromCharCode(65 + exerciseIndex)}`,
      title: exercise.title,
      stars: difficultyToStars(exercise.difficulty),
      isLocked: false,
      href: `/exercises/${exercise.id}?gymId=${gym.id}`,
    })),
  }));

  const mainChallengeCount = mainQuestData.reduce((acc, section) => acc + section.challenges.length, 0);
  const sideChallengeCount = sideQuestSections.reduce((acc, section) => acc + section.challenges.length, 0);
  const totalChallenges = mainChallengeCount + sideChallengeCount;

  const clearedCount = gymsWithExercises.reduce((acc, gym) => acc + gym.completedCount, 0);

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
        {activeTab === 'side' && <ChallengeList sections={sideQuestSections} />}
      </div>
    </div>
  );
}
