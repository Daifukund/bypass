"use client";

import { useState, useEffect, useRef } from "react";
import { Ban, X, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { COMMON_EXCLUSIONS } from "@/constants/exclude-companies";

interface ExcludeCompaniesSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function ExcludeCompaniesSelector({ value, onChange }: ExcludeCompaniesSelectorProps) {
  const [selectedExclusions, setSelectedExclusions] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Parse string to array on mount and value change
  useEffect(() => {
    const exclusions = value ? value.split(", ").filter(Boolean) : [];
    setSelectedExclusions(exclusions);
  }, [value]);

  // Filter suggestions based on input and exclude already selected
  const filteredSuggestions = COMMON_EXCLUSIONS.filter(
    (exclusion) =>
      exclusion.toLowerCase().includes(inputValue.toLowerCase()) &&
      !selectedExclusions.includes(exclusion)
  ).slice(0, 8);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const addExclusion = (exclusion: string) => {
    if (exclusion.trim() && !selectedExclusions.includes(exclusion.trim())) {
      const newExclusions = [...selectedExclusions, exclusion.trim()];
      setSelectedExclusions(newExclusions);
      onChange(newExclusions.join(", "));
      setInputValue("");
      setIsOpen(false);
    }
  };

  const removeExclusion = (exclusionToRemove: string) => {
    const newExclusions = selectedExclusions.filter((e) => e !== exclusionToRemove);
    setSelectedExclusions(newExclusions);
    onChange(newExclusions.join(", "));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setIsOpen(newValue.length > 0);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      addExclusion(inputValue);
    } else if (e.key === "Backspace" && !inputValue && selectedExclusions.length > 0) {
      removeExclusion(selectedExclusions[selectedExclusions.length - 1]);
    }
  };

  const handleInputFocus = () => {
    if (inputValue) setIsOpen(true);
  };

  return (
    <div className="space-y-3">
      {/* Selected Exclusions Tags */}
      {selectedExclusions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedExclusions.map((exclusion) => (
            <span
              key={exclusion}
              className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full"
            >
              <Ban className="h-3 w-3" />
              {exclusion}
              <button
                type="button"
                onClick={() => removeExclusion(exclusion)}
                className="hover:bg-red-200 rounded-full p-0.5 ml-1"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input with Dropdown */}
      <div className="relative">
        <div className="relative">
          <Ban className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            onFocus={handleInputFocus}
            placeholder={
              selectedExclusions.length > 0
                ? "Add another exclusion..."
                : "Type company names or types to exclude..."
            }
            className="pl-10"
          />
        </div>

        {/* Dropdown with suggestions */}
        {isOpen && filteredSuggestions.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border border-gray-200 bg-white shadow-lg"
          >
            {filteredSuggestions.map((exclusion) => (
              <button
                key={exclusion}
                type="button"
                onClick={() => addExclusion(exclusion)}
                className="w-full px-3 py-2 text-left text-sm hover:bg-red-50 focus:bg-red-50 focus:outline-none border-b border-gray-50 last:border-b-0 flex items-center gap-2"
              >
                <Plus className="h-3 w-3 text-gray-400" />
                {exclusion}
              </button>
            ))}

            {/* Custom exclusion option */}
            {inputValue &&
              !filteredSuggestions.some((s) => s.toLowerCase() === inputValue.toLowerCase()) && (
                <button
                  type="button"
                  onClick={() => addExclusion(inputValue)}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-red-50 focus:bg-red-50 focus:outline-none border-t border-gray-200 flex items-center gap-2 font-medium text-red-600"
                >
                  <Plus className="h-3 w-3" />
                  Exclude "{inputValue}"
                </button>
              )}
          </div>
        )}
      </div>
    </div>
  );
}
