'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Trophy, Target, Clock, CheckCircle } from 'lucide-react';
import { GymProgressSummary } from '@/types/gym';
import { GymProgressCard, GymProgressCardSkeleton } from './GymProgressCard';

interface GymProgressProps {
  progress: GymProgressSummary;
  isLoading?: boolean;
}

export function GymProgress({ progress, isLoading = false }: GymProgressProps) {
  if (isLoading) {
    return <GymProgressSkeleton />;
  }

  const overallPercentage =
    progress.totalProblems > 0
      ? Math.round((progress.completedProblems / progress.totalProblems) * 100)
      : 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            總體進度
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard
              icon={Target}
              label="總題數"
              value={progress.totalProblems}
              color="text-blue-500"
            />
            <StatCard
              icon={CheckCircle}
              label="已完成"
              value={progress.completedProblems}
              color="text-green-500"
            />
            <StatCard
              icon={Clock}
              label="待批改"
              value={progress.pendingReviews}
              color="text-yellow-500"
            />
            <StatCard
              icon={Trophy}
              label="完成道場"
              value={`${progress.completedGyms}/${progress.totalGyms}`}
              color="text-amber-500"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">整體完成度</span>
              <span className="font-medium">{overallPercentage}%</span>
            </div>
            <Progress value={overallPercentage} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {progress.gyms.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">各道場進度</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {progress.gyms.map((gym) => (
              <GymProgressCard key={gym.gymId} progress={gym} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface StatCardProps {
  icon: typeof Trophy;
  label: string;
  value: number | string;
  color: string;
}

function StatCard({ icon: Icon, label, value, color }: StatCardProps) {
  return (
    <div className="text-center p-3 rounded-lg bg-muted/50">
      <Icon className={`h-5 w-5 mx-auto mb-1 ${color}`} />
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function GymProgressSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="h-6 w-32 bg-muted animate-pulse rounded" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="text-center p-3 rounded-lg bg-muted/50">
                <div className="h-5 w-5 mx-auto mb-1 bg-muted animate-pulse rounded" />
                <div className="h-8 w-12 mx-auto bg-muted animate-pulse rounded mt-1" />
                <div className="h-3 w-16 mx-auto bg-muted animate-pulse rounded mt-1" />
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <div className="h-4 w-20 bg-muted animate-pulse rounded" />
              <div className="h-4 w-8 bg-muted animate-pulse rounded" />
            </div>
            <div className="h-3 w-full bg-muted animate-pulse rounded" />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="h-6 w-32 bg-muted animate-pulse rounded" />
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <GymProgressCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
