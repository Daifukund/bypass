"use client";

import { SimpleTooltip } from "./simple-tooltip";

interface FieldWithTooltipProps {
  children: React.ReactNode;
  label: string;
  tooltip: string;
  required?: boolean;
  htmlFor?: string;
}

export function FieldWithTooltip({
  children,
  label,
  tooltip,
  required = false,
  htmlFor,
}: FieldWithTooltipProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <label htmlFor={htmlFor} className="text-sm font-medium">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <SimpleTooltip content={tooltip} />
      </div>
      {children}
    </div>
  );
}
