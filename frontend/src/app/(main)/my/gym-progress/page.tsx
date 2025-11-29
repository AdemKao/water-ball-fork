'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useGymProgress } from '@/hooks/useGymProgress';
import { GymProgress } from '@/components/gym';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GymProgressPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { progress, isLoading, error, refetch } = useGymProgress();

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/login?redirect=/my/gym-progress');
    }
  }, [user, isAuthLoading, router]);

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">我的道場進度</h1>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <p className="text-lg font-medium mb-2">無法載入進度資料</p>
            <p className="text-muted-foreground mb-4">{error.message}</p>
            <Button onClick={refetch}>重試</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading || !progress) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">我的道場進度</h1>
        <GymProgress
          progress={{
            totalGyms: 0,
            completedGyms: 0,
            totalProblems: 0,
            completedProblems: 0,
            pendingReviews: 0,
            gyms: [],
          }}
          isLoading={true}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">我的道場進度</h1>
      <GymProgress progress={progress} />
    </div>
  );
}
