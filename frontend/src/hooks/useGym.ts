'use client';

import { useState, useEffect, useCallback } from 'react';
import { gymService } from '@/services/gym.service';
import { Gym, GymExercise, GymExerciseDetail, GymSubmission } from '@/types/gym';

export function useGyms(journeyId: string | undefined) {
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchGyms = useCallback(async () => {
    if (!journeyId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await gymService.getGymsByJourney(journeyId);
      setGyms(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch gyms'));
    } finally {
      setIsLoading(false);
    }
  }, [journeyId]);

  useEffect(() => {
    fetchGyms();
  }, [fetchGyms]);

  return { gyms, isLoading, error, refetch: fetchGyms };
}

export function useGymExercises(gymId: number | undefined) {
  const [exercises, setExercises] = useState<GymExercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchExercises = useCallback(async () => {
    if (!gymId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await gymService.getExercises(gymId);
      setExercises(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch exercises'));
    } finally {
      setIsLoading(false);
    }
  }, [gymId]);

  useEffect(() => {
    fetchExercises();
  }, [fetchExercises]);

  return { exercises, isLoading, error, refetch: fetchExercises };
}

export function useExerciseDetail(exerciseId: number | undefined) {
  const [exercise, setExercise] = useState<GymExerciseDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchExercise = useCallback(async () => {
    if (!exerciseId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await gymService.getExerciseDetail(exerciseId);
      setExercise(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch exercise detail'));
    } finally {
      setIsLoading(false);
    }
  }, [exerciseId]);

  useEffect(() => {
    fetchExercise();
  }, [fetchExercise]);

  return { exercise, isLoading, error, refetch: fetchExercise };
}

export function useMySubmissions(exerciseId: number | undefined) {
  const [submissions, setSubmissions] = useState<GymSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSubmissions = useCallback(async () => {
    if (!exerciseId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await gymService.getMySubmissions(exerciseId);
      setSubmissions(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch submissions'));
    } finally {
      setIsLoading(false);
    }
  }, [exerciseId]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  return { submissions, isLoading, error, refetch: fetchSubmissions };
}
