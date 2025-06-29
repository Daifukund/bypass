"use client";

import { useState, useEffect, useRef } from "react";
import { Globe, ChevronDown, X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { JOB_PLATFORMS } from "@/constants/job-platforms";

interface JobPlatformsSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function JobPlatformsSelector({ value, onChange }: JobPlatformsSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Parse the incoming value string into array
  useEffect(() => {
    if (value) {
      const platforms = value.split(", ").filter(Boolean);
      setSelectedPlatforms(platforms);
    } else {
      setSelectedPlatforms([]);
    }
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !triggerRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = (platformLabel: string) => {
    let newSelected: string[];

    if (selectedPlatforms.includes(platformLabel)) {
      // Remove if already selected
      newSelected = selectedPlatforms.filter((p) => p !== platformLabel);
    } else {
      // Add if not selected
      newSelected = [...selectedPlatforms, platformLabel];
    }

    setSelectedPlatforms(newSelected);
    onChange(newSelected.join(", "));
  };

  const handleRemove = (platformLabel: string) => {
    const newSelected = selectedPlatforms.filter((p) => p !== platformLabel);
    setSelectedPlatforms(newSelected);
    onChange(newSelected.join(", "));
  };

  const popularPlatforms = JOB_PLATFORMS.filter((p) => p.popular);
  const otherPlatforms = JOB_PLATFORMS.filter((p) => !p.popular);

  return (
    <div className="relative w-full">
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          selectedPlatforms.length > 0 ? "text-foreground" : "text-muted-foreground"
        )}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Globe className="h-4 w-4 text-gray-400 flex-shrink-0" />
          <span className="truncate">
            {selectedPlatforms.length > 0
              ? `${selectedPlatforms.length} platform${selectedPlatforms.length > 1 ? "s" : ""} selected`
              : "Select job platforms..."}
          </span>
        </div>
        <ChevronDown
          className={cn("h-4 w-4 shrink-0 opacity-50 transition-transform", isOpen && "rotate-180")}
        />
      </button>

      {/* Selected Tags */}
      {selectedPlatforms.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {selectedPlatforms.map((platform) => (
            <span
              key={platform}
              className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
            >
              {platform}
              <button
                type="button"
                onClick={() => handleRemove(platform)}
                className="hover:bg-blue-200 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border border-gray-200 bg-white shadow-lg"
        >
          {/* Popular Platforms */}
          <div>
            <div className="px-3 py-2 text-xs font-medium text-gray-500 bg-blue-50 sticky top-0">
              Popular Platforms
            </div>
            {popularPlatforms.map((platform) => {
              const isSelected = selectedPlatforms.includes(platform.label);
              return (
                <button
                  key={platform.id}
                  type="button"
                  onClick={() => handleToggle(platform.label)}
                  className={cn(
                    "w-full px-3 py-2 text-left text-sm hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-50 last:border-b-0 flex items-center justify-between",
                    isSelected && "bg-blue-50 text-blue-900"
                  )}
                >
                  <span>{platform.label}</span>
                  {isSelected && (
                    <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Other Platforms */}
          <div>
            <div className="px-3 py-2 text-xs font-medium text-gray-500 bg-gray-50 sticky top-0">
              Other Platforms
            </div>
            {otherPlatforms.map((platform) => {
              const isSelected = selectedPlatforms.includes(platform.label);
              return (
                <button
                  key={platform.id}
                  type="button"
                  onClick={() => handleToggle(platform.label)}
                  className={cn(
                    "w-full px-3 py-2 text-left text-sm hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-50 last:border-b-0 flex items-center justify-between",
                    isSelected && "bg-blue-50 text-blue-900"
                  )}
                >
                  <span>{platform.label}</span>
                  {isSelected && (
                    <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
