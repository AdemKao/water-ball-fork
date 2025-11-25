import Link from 'next/link';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AccessDeniedModalProps {
  journeyId: string;
  journeyTitle?: string;
}

export function AccessDeniedModal({ journeyId }: AccessDeniedModalProps) {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-card border rounded-lg p-8 max-w-md mx-4 text-center space-y-4">
        <div className="mx-auto w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
          <Lock className="h-6 w-6 text-yellow-500" />
        </div>
        <h2 className="text-xl font-semibold">需要購買才能觀看</h2>
        <p className="text-muted-foreground">
          此課程內容需要購買後才能觀看完整內容
        </p>
        <div className="flex gap-3 justify-center pt-4">
          <Link href={`/courses/${journeyId}`}>
            <Button variant="outline">返回課程</Button>
          </Link>
          <Button className="bg-primary text-primary-foreground">
            立即購買
          </Button>
        </div>
      </div>
    </div>
  );
}
