'use client';

import { useState, useEffect, useCallback } from 'react';
import { gymService } from '@/services/gym.service';
import { GymExercise, GymExerciseDetail, GymSubmission } from '@/types/gym';

export function useGymExercises(gymId: number | undefined) {
  const [exercises, setExercises] = useState<GymExercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchExercises = useCallback(async () => {
    if (!gymId) return;

    try {
      setLoading(true);
      const data = await gymService.getExercises(gymId);
      setExercises(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch exercises'));
    } finally {
      setLoading(false);
    }
  }, [gymId]);

  useEffect(() => {
    fetchExercises();
  }, [fetchExercises]);

  return { exercises, loading, error, refetch: fetchExercises };
}

export function useGymExerciseDetail(exerciseId: number | undefined) {
  const [exercise, setExercise] = useState<GymExerciseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchExercise = useCallback(async () => {
    if (!exerciseId) return;

    try {
      setLoading(true);
      const data = await gymService.getExerciseDetail(exerciseId);
      setExercise(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch exercise'));
    } finally {
      setLoading(false);
    }
  }, [exerciseId]);

  useEffect(() => {
    fetchExercise();
  }, [fetchExercise]);

  return { exercise, loading, error, refetch: fetchExercise };
}

export function useSubmitExercise() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const submitExercise = useCallback(async (exerciseId: number, file: File): Promise<GymSubmission | null> => {
    try {
      setSubmitting(true);
      setError(null);
      const submission = await gymService.submitExercise(exerciseId, file);
      return submission;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to submit exercise'));
      return null;
    } finally {
      setSubmitting(false);
    }
  }, []);

  return { submitExercise, submitting, error };
}
