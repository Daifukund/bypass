"use client";

import { useState, useRef, useEffect } from "react";
import { Building2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { POPULAR_INDUSTRIES } from "@/constants/industries";

interface IndustryComboboxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function IndustryCombobox({
  value,
  onChange,
  placeholder = "Select or type industry...",
}: IndustryComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Smart filtering and sorting
  const getFilteredIndustries = (searchTerm: string) => {
    if (!searchTerm) {
      // When no search term, show most popular industries first
      return [
        "Technology",
        "Finance",
        "Consulting",
        "Marketing",
        "Sales",
        "Healthcare",
        "E-commerce",
        "Banking",
        "Software",
        "Legal",
      ];
    }

    const search = searchTerm.toLowerCase();

    // Filter industries that match
    const matches = POPULAR_INDUSTRIES.filter((industry) =>
      industry.toLowerCase().includes(search)
    );

    // Smart sorting: exact matches first, then starts with, then contains
    const exactMatches = matches.filter((industry) => industry.toLowerCase() === search);

    const startsWithMatches = matches.filter(
      (industry) => industry.toLowerCase().startsWith(search) && !exactMatches.includes(industry)
    );

    const containsMatches = matches.filter(
      (industry) =>
        industry.toLowerCase().includes(search) &&
        !exactMatches.includes(industry) &&
        !startsWithMatches.includes(industry)
    );

    // Combine in priority order
    return [...exactMatches, ...startsWithMatches.sort(), ...containsMatches.sort()].slice(0, 10);
  };

  const filteredIndustries = getFilteredIndustries(inputValue);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
    setIsOpen(true);
  };

  const handleSelect = (industry: string) => {
    setInputValue(industry);
    onChange(industry);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          className="pl-10 pr-10"
        />
        <ChevronDown
          className={cn(
            "absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </div>

      {isOpen && filteredIndustries.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border border-gray-200 bg-white shadow-lg"
        >
          {filteredIndustries.map((industry, index) => (
            <button
              key={industry}
              onClick={() => handleSelect(industry)}
              className={cn(
                "w-full px-3 py-2 text-left text-sm hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-50 last:border-b-0",
                index === 0 && inputValue && "bg-blue-50 font-medium" // Highlight best match
              )}
            >
              {industry}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
