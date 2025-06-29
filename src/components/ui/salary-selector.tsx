"use client";

import { useState, useEffect } from "react";
import { DollarSign } from "lucide-react";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SALARY_RANGES } from "@/constants/salary-ranges";

interface SalarySelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function SalarySelector({ value, onChange }: SalarySelectorProps) {
  const [selectedRange, setSelectedRange] = useState("");
  const [customValue, setCustomValue] = useState("");

  useEffect(() => {
    // Check if current value matches a predefined range
    const matchingRange = SALARY_RANGES.find((range) => range.value === value);
    if (matchingRange) {
      setSelectedRange(value);
      setCustomValue("");
    } else if (value) {
      // It's a custom value
      setSelectedRange("custom");
      setCustomValue(value);
    } else {
      setSelectedRange("");
      setCustomValue("");
    }
  }, [value]);

  const handleRangeChange = (newRange: string) => {
    setSelectedRange(newRange);
    if (newRange === "custom") {
      onChange(customValue);
    } else {
      setCustomValue("");
      onChange(newRange);
    }
  };

  const handleCustomChange = (newCustom: string) => {
    setCustomValue(newCustom);
    if (selectedRange === "custom") {
      onChange(newCustom);
    }
  };

  return (
    <div className="space-y-3">
      <Select
        value={selectedRange}
        onChange={handleRangeChange}
        options={SALARY_RANGES}
        placeholder="Select salary expectation..."
      />

      {selectedRange === "custom" && (
        <div className="space-y-1.5">
          <Label htmlFor="customSalary" className="text-sm text-gray-600">
            Specify your expected salary
          </Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              id="customSalary"
              placeholder="e.g., €2,200/month, $65K/year, €25/hour"
              value={customValue}
              onChange={(e) => handleCustomChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      )}
    </div>
  );
}
