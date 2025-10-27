import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface StepperProps {
  steps: Array<{
    title: string;
    icon: string;
    value: string;
  }>;
  currentStep: string;
  className?: string;
}

export function Stepper({ steps, currentStep, className }: StepperProps) {
  const currentIndex = steps.findIndex(step => step.value === currentStep);

  return (
    <div className={cn("flex items-center justify-between", className)}>
      {steps.map((step, index) => {
        const isActive = step.value === currentStep;
        const isCompleted = index < currentIndex;
        const isLast = index === steps.length - 1;

        return (
          <div key={step.value} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                  isActive && "border-red-700 bg-red-700 text-white",
                  isCompleted && "border-red-700 bg-red-700 text-white",
                  !isActive && !isCompleted && "border-gray-300 bg-gray-100 text-gray-500"
                )}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </div>
              <span
                className={cn(
                  "mt-2 text-xs font-medium",
                  isActive && "text-red-700",
                  isCompleted && "text-red-700",
                  !isActive && !isCompleted && "text-gray-500"
                )}
              >
                {step.title}
              </span>
            </div>
            {!isLast && (
              <div
                className={cn(
                  "mx-4 h-0.5 w-16",
                  index < currentIndex ? "bg-red-700" : "bg-gray-300"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
