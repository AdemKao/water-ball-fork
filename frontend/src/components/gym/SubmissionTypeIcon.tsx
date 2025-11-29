'use client';

import { FileText, Video, Code, Image } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { SubmissionType, SUBMISSION_TYPE_CONFIG } from '@/types/gym';

interface SubmissionTypeIconProps {
  type: SubmissionType;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
}

const iconMap = {
  PDF: FileText,
  MP4: Video,
  CODE: Code,
  IMAGE: Image,
};

const sizeClasses = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
};

export function SubmissionTypeIcon({
  type,
  size = 'md',
  showTooltip = true,
}: SubmissionTypeIconProps) {
  const Icon = iconMap[type];
  const config = SUBMISSION_TYPE_CONFIG[type];

  const icon = (
    <Icon
      className={cn(
        sizeClasses[size],
        'text-muted-foreground'
      )}
    />
  );

  if (!showTooltip) {
    return icon;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex">{icon}</span>
        </TooltipTrigger>
        <TooltipContent>
          <p>{config.label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
