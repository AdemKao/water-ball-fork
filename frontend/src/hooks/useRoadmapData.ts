'use client';

import { useState, useEffect, useCallback } from 'react';
import { gymService } from '@/services/gym.service';
import { GymType } from '@/types/gym';

export interface RoadmapProblem {
  id: string;
  title: string;
  difficulty: number;
  isUnlocked: boolean;
  isCompleted: boolean;
  gymId: string;
  gymTitle: string;
  stageId: string;
  stageTitle: string;
}

export interface RoadmapGym {
  id: string;
  title: string;
  type: GymType;
  problems: RoadmapProblem[];
  isPurchased: boolean;
}

export function useRoadmapData(journeyId: string) {
  const [gyms, setGyms] = useState<RoadmapGym[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!journeyId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const gymList = await gymService.getGyms({ journeyId });
      
      const gymDataPromises = gymList.map(async (gym) => {
        const gymDetail = await gymService.getGym(gym.id);
        
        const stagePromises = gymDetail.stages.map(stage => 
          gymService.getStage(gym.id, stage.id)
        );
        const stageDetails = await Promise.all(stagePromises);
        
        const problems: RoadmapProblem[] = stageDetails.flatMap(stage =>
          stage.problems.map(problem => ({
            id: problem.id,
            title: problem.title,
            difficulty: problem.difficulty,
            isUnlocked: problem.isUnlocked,
            isCompleted: problem.isCompleted,
            gymId: gym.id,
            gymTitle: gym.title,
            stageId: stage.id,
            stageTitle: stage.title,
          }))
        );
        
        return {
          id: gym.id,
          title: gym.title,
          type: gym.type,
          problems,
          isPurchased: gym.isPurchased,
        };
      });
      
      const gymData = await Promise.all(gymDataPromises);
      setGyms(gymData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch roadmap data'));
    } finally {
      setIsLoading(false);
    }
  }, [journeyId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { gyms, isLoading, error, refetch: fetchData };
}
