"use client";

import { useState } from "react";
import { HelpCircle } from "lucide-react";

interface SimpleTooltipProps {
  content: string;
  children?: React.ReactNode;
}

export function SimpleTooltip({ content, children }: SimpleTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="cursor-help"
      >
        {children || <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600" />}
      </div>

      {isVisible && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap z-50 max-w-xs">
          {content}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
}
