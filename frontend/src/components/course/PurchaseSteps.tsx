'use client';

interface PurchaseStepsProps {
  currentStep: number;
}

const steps = [
  { id: 1, label: '建立訂單' },
  { id: 2, label: '完成支付' },
  { id: 3, label: '開始上課！' },
];

export function PurchaseSteps({ currentStep }: PurchaseStepsProps) {
  return (
    <div className="flex items-center justify-center py-4">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                step.id <= currentStep
                  ? 'bg-white text-[#0066CC]'
                  : 'bg-white/20 text-white'
              }`}
            >
              {step.id}
            </div>
            <span
              className={`mt-2 text-sm ${
                step.id <= currentStep ? 'text-white' : 'text-white/60'
              }`}
            >
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`w-32 h-0.5 mx-2 ${
                step.id < currentStep ? 'bg-white' : 'bg-white/20'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
