"use client";

import { useState, useEffect } from "react";
import { Users, Search, Globe, CheckCircle } from "lucide-react";

interface EmployeeSearchProgressProps {
  isVisible: boolean;
  companyName?: string;
  apiProgress?: number;
  onComplete?: () => void;
}

const PROGRESS_STEPS = [
  {
    id: 1,
    text: "Analyzing company structure...",
    icon: Search,
    minProgress: 0,
    maxProgress: 25,
  },
  {
    id: 2,
    text: "Searching for relevant employees...",
    icon: Globe,
    minProgress: 25,
    maxProgress: 70,
  },
  {
    id: 3,
    text: "Identifying key contacts...",
    icon: Users,
    minProgress: 70,
    maxProgress: 95,
  },
  {
    id: 4,
    text: "Ready! Redirecting to contacts...",
    icon: CheckCircle,
    minProgress: 95,
    maxProgress: 100,
  },
];

// Inline Progress component to avoid import issues
function InlineProgress({ value = 0 }: { value: number }) {
  return (
    <div className="relative h-3 w-full overflow-hidden rounded-full bg-gray-200">
      <div
        className="h-full bg-blue-600 transition-all duration-500 ease-out"
        style={{
          width: `${Math.min(Math.max(value, 0), 100)}%`,
        }}
      />
    </div>
  );
}

export function EmployeeSearchProgress({
  isVisible,
  companyName,
  apiProgress = 0,
  onComplete,
}: EmployeeSearchProgressProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [displayProgress, setDisplayProgress] = useState(0);

  useEffect(() => {
    if (!isVisible) {
      setCurrentStep(0);
      setDisplayProgress(0);
      return;
    }

    const stepIndex = PROGRESS_STEPS.findIndex(
      (step) => apiProgress >= step.minProgress && apiProgress <= step.maxProgress
    );

    if (stepIndex !== -1) {
      setCurrentStep(stepIndex);
    }

    setDisplayProgress(apiProgress);

    if (apiProgress >= 100) {
      setTimeout(() => {
        onComplete?.();
      }, 500);
    }
  }, [isVisible, apiProgress, onComplete]);

  if (!isVisible) return null;

  const currentStepData = PROGRESS_STEPS[currentStep];
  const IconComponent = currentStepData?.icon || Search;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4">
        <div className="text-center space-y-6">
          {/* Icon with animation */}
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <IconComponent className="h-8 w-8 text-blue-600" />
          </div>

          {/* Linear Progress Bar */}
          <div className="space-y-3">
            <InlineProgress value={displayProgress} />
            <div className="flex justify-between text-xs text-gray-500">
              <span>0%</span>
              <span className="font-medium text-blue-600">{Math.round(displayProgress)}%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Current Step Text */}
          <div className="space-y-2">
            <p className="text-lg font-medium text-gray-900">
              {currentStepData?.text || "Processing..."}
            </p>
            {companyName && (
              <p className="text-sm text-gray-600">
                Finding contacts at <span className="font-semibold">{companyName}</span>
              </p>
            )}
            <p className="text-sm text-gray-500">
              {displayProgress < 100
                ? "This usually takes 5-10 seconds"
                : "Complete! Redirecting now..."}
            </p>
          </div>

          {/* Step Indicators (dots) */}
          <div className="flex justify-center space-x-2">
            {PROGRESS_STEPS.slice(0, -1).map((step, index) => (
              <div
                key={step.id}
                className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                  index <= currentStep ? "bg-blue-600" : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
