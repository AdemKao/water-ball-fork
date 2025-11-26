import { Video, FileText, ClipboardList } from 'lucide-react';
import { LessonType } from '@/types';
import { cn } from '@/lib/utils';

interface LessonTypeIconProps {
  type: LessonType;
  className?: string;
}

export function LessonTypeIcon({ type, className }: LessonTypeIconProps) {
  const iconClass = cn('h-4 w-4', className);

  switch (type) {
    case 'VIDEO':
      return <Video className={iconClass} />;
    case 'ARTICLE':
      return <FileText className={iconClass} />;
    case 'GOOGLE_FORM':
      return <ClipboardList className={iconClass} />;
    default:
      return <FileText className={iconClass} />;
  }
}
