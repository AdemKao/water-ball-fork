'use client';

import { AlertCircle } from 'lucide-react';

interface CourseDescriptionProps {
  title: string;
  description: string[];
  guarantee: string;
  notice: string;
}

export function CourseDescription({
  title,
  description,
  guarantee,
  notice,
}: CourseDescriptionProps) {
  return (
    <div className="bg-[#2563EB] text-white rounded-b-xl">
      <div className="p-6 md:p-8 space-y-6">
        <h1 className="text-2xl md:text-3xl font-bold text-[#FFD700]">{title}</h1>
        <div className="space-y-4 text-white/90 leading-relaxed">
          {description.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
        <p className="text-white/90 leading-relaxed">{guarantee}</p>
      </div>
      <div className="bg-[#FEF3C7] text-[#92400E] p-4 mx-4 mb-4 rounded-lg flex gap-3">
        <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
        <p className="text-sm">{notice}</p>
      </div>
    </div>
  );
}
