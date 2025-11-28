'use client';

import { cn } from '@/lib/utils';

interface Step {
  number: number;
  label: string;
}

interface OrderStepperProps {
  currentStep: number;
  steps?: Step[];
}

const defaultSteps: Step[] = [
  { number: 1, label: '建立訂單' },
  { number: 2, label: '完成支付' },
  { number: 3, label: '約定開學' },
];

export function OrderStepper({ currentStep, steps = defaultSteps }: OrderStepperProps) {
  return (
    <div className="w-full bg-[#2563EB] rounded-t-xl py-6 px-4 md:px-12">
      <div className="flex items-center justify-between max-w-3xl mx-auto">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center text-lg font-semibold',
                  currentStep >= step.number
                    ? 'bg-[#1E3A5F] text-white'
                    : 'bg-[#1E3A5F]/50 text-white/70'
                )}
              >
                {step.number}
              </div>
              <span
                className={cn(
                  'mt-2 text-sm whitespace-nowrap',
                  currentStep >= step.number ? 'text-white' : 'text-white/70'
                )}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className="flex-1 mx-4">
                <div
                  className={cn(
                    'h-0.5',
                    currentStep > step.number ? 'bg-white' : 'bg-white/30'
                  )}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
