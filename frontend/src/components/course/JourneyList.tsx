import { Journey } from '@/types';
import { JourneyCard } from './JourneyCard';

interface JourneyListProps {
  journeys: Journey[];
}

export function JourneyList({ journeys }: JourneyListProps) {
  if (journeys.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">目前沒有課程</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {journeys.map((journey) => (
        <JourneyCard key={journey.id} journey={journey} />
      ))}
    </div>
  );
}
