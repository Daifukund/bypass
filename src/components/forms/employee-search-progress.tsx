'use client';

import { useState, useEffect } from 'react';
import { Users, Search, Globe, CheckCircle } from 'lucide-react';

interface EmployeeSearchProgressProps {
  isVisible: boolean;
  companyName?: string;
  onComplete?: () => void;
}

const PROGRESS_STEPS = [
  {
    id: 1,
    text: "Analyzing company structure...",
    icon: Search,
    duration: 1000,
    progress: 20
  },
  {
    id: 2,
    text: "Searching for relevant employees...",
    icon: Globe,
    duration: 3500,
    progress: 65
  },
  {
    id: 3,
    text: "Identifying key contacts...",
    icon: Users,
    duration: 2000,
    progress: 90
  },
  {
    id: 4,
    text: "Ready! Redirecting to contacts...",
    icon: CheckCircle,
    duration: 500,
    progress: 100
  }
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

export function EmployeeSearchProgress({ isVisible, companyName, onComplete }: EmployeeSearchProgressProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isVisible) {
      setCurrentStep(0);
      setProgress(0);
      return;
    }

    let timeoutId: NodeJS.Timeout;
    let currentStepIndex = 0;

    const runStep = () => {
      if (currentStepIndex >= PROGRESS_STEPS.length) {
        onComplete?.();
        return;
      }

      const step = PROGRESS_STEPS[currentStepIndex];
      setCurrentStep(currentStepIndex);
      
      // Animate progress bar smoothly
      const startProgress = currentStepIndex === 0 ? 0 : PROGRESS_STEPS[currentStepIndex - 1].progress;
      const endProgress = step.progress;
      const duration = step.duration;
      const startTime = Date.now();

      const animateProgress = () => {
        const elapsed = Date.now() - startTime;
        const progressRatio = Math.min(elapsed / duration, 1);
        const currentProgress = startProgress + (endProgress - startProgress) * progressRatio;
        
        setProgress(currentProgress);

        if (progressRatio < 1) {
          requestAnimationFrame(animateProgress);
        } else {
          // Move to next step after a short delay
          currentStepIndex++;
          timeoutId = setTimeout(runStep, 200);
        }
      };

      animateProgress();
    };

    runStep();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isVisible, onComplete]);

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
            <InlineProgress value={progress} />
            <div className="flex justify-between text-xs text-gray-500">
              <span>0%</span>
              <span className="font-medium text-blue-600">{Math.round(progress)}%</span>
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
              This usually takes 5-10 seconds
            </p>
          </div>

          {/* Step Indicators (dots) */}
          <div className="flex justify-center space-x-2">
            {PROGRESS_STEPS.slice(0, -1).map((step, index) => (
              <div
                key={step.id}
                className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                  index <= currentStep ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}