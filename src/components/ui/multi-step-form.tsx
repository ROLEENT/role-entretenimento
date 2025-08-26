import React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface Step {
  id: string;
  title: string;
  description?: string;
}

interface MultiStepFormProps {
  steps: Step[];
  currentStep: number;
  onStepChange?: (step: number) => void;
  className?: string;
}

export function MultiStepForm({ steps, currentStep, onStepChange, className }: MultiStepFormProps) {
  return (
    <div className={cn("w-full", className)}>
      <nav aria-label="Progress">
        <ol className="flex items-center justify-between space-x-5">
          {steps.map((step, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            
            return (
              <li key={step.id} className="flex items-center">
                <button
                  onClick={() => onStepChange?.(index)}
                  disabled={index > currentStep}
                  className={cn(
                    "group flex items-center",
                    index > currentStep && "cursor-not-allowed"
                  )}
                >
                  <span className="flex items-center px-6 py-4 text-sm font-medium">
                    <span
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                        isCompleted && "border-primary bg-primary text-primary-foreground",
                        isCurrent && "border-primary text-primary",
                        !isCompleted && !isCurrent && "border-muted-foreground text-muted-foreground"
                      )}
                    >
                      {isCompleted ? (
                        <Check className="h-6 w-6" />
                      ) : (
                        <span>{index + 1}</span>
                      )}
                    </span>
                    <span className="ml-4 min-w-0 flex flex-col text-left">
                      <span
                        className={cn(
                          "text-sm font-medium transition-colors",
                          isCompleted && "text-primary",
                          isCurrent && "text-primary",
                          !isCompleted && !isCurrent && "text-muted-foreground"
                        )}
                      >
                        {step.title}
                      </span>
                      {step.description && (
                        <span className="text-sm text-muted-foreground">
                          {step.description}
                        </span>
                      )}
                    </span>
                  </span>
                </button>
                
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "hidden sm:block w-5 h-0.5 ml-4 transition-colors",
                      isCompleted ? "bg-primary" : "bg-muted"
                    )}
                  />
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}