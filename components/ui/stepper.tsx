import { cn } from "@/lib/utils";
import { Check, Scissors, UserCheck, CalendarDays, Info, CheckCircle } from "lucide-react";

interface StepperProps {
  steps: Array<{
    title: string;
    icon: string;
    value: string;
  }>;
  currentStep: string;
  className?: string;
}

const getIcon = (iconName: string) => {
  switch (iconName) {
    case 'scissors': return Scissors;
    case 'user-check': return UserCheck;
    case 'calendar-days': return CalendarDays;
    case 'info': return Info;
    case 'check-circle': return CheckCircle;
    default: return Scissors;
  }
};

export function Stepper({ steps, currentStep, className }: StepperProps) {
  const currentIndex = steps.findIndex(step => step.value === currentStep);

  return (
    <div className={cn("flex items-center justify-between w-full max-w-4xl mx-auto", className)}>
      {steps.map((step, index) => {
        const isActive = step.value === currentStep;
        const isCompleted = index < currentIndex;

        return (
          <div key={step.value} className="flex flex-col items-center flex-1">
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                isActive && "border-orange-primary bg-orange-primary text-white",
                isCompleted && "border-orange-primary bg-orange-primary text-white",
                !isActive && !isCompleted && "border-gray-300 bg-gray-100 text-orange-primary"
              )}
            >
              {isCompleted ? (
                <Check className="h-5 w-5" />
              ) : (
                (() => {
                  const IconComponent = getIcon(step.icon);
                  return <IconComponent className="h-5 w-5" />;
                })()
              )}
            </div>
            <span
              className={cn(
                "mt-2 text-xs font-medium text-center",
                isActive && "text-orange-primary",
                isCompleted && "text-orange-primary",
                !isActive && !isCompleted && "text-gray-500"
              )}
            >
              {step.title}
            </span>
          </div>
        );
      })}
    </div>
  );
}
