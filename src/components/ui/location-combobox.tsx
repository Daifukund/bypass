"use client";

import { useState, useRef, useEffect } from "react";
import { MapPin, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { POPULAR_LOCATIONS } from "@/constants/locations";

interface LocationComboboxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function LocationCombobox({
  value,
  onChange,
  placeholder = "Select or type location...",
}: LocationComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter locations based on input
  const filteredLocations = POPULAR_LOCATIONS.filter((location) =>
    location.toLowerCase().includes(inputValue.toLowerCase())
  ).slice(0, 15); // Increased to 15 results

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

  const handleSelect = (location: string) => {
    setInputValue(location);
    onChange(location);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  // Organize filtered locations by type
  const cities = filteredLocations.filter(
    (location) => location.includes(",") && !location.includes("Remote")
  );
  const remoteOptions = filteredLocations.filter(
    (location) =>
      location.includes("Remote") || location === "Hybrid" || location.includes("Hybrid")
  );
  const regions = filteredLocations.filter(
    (location) =>
      !location.includes(",") && !location.includes("Remote") && !location.includes("Hybrid")
  );

  return (
    <div className="relative w-full">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
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

      {isOpen && filteredLocations.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 z-50 mt-1 max-h-80 overflow-auto rounded-md border border-gray-200 bg-white shadow-lg"
        >
          {/* Cities First */}
          {cities.length > 0 && (
            <div>
              <div className="px-3 py-2 text-xs font-medium text-gray-500 bg-gray-50 sticky top-0">
                Cities
              </div>
              {cities.map((location) => (
                <button
                  key={location}
                  onClick={() => handleSelect(location)}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-blue-50 focus:bg-blue-50 focus:outline-none border-b border-gray-50 last:border-b-0"
                >
                  {location}
                </button>
              ))}
            </div>
          )}

          {/* Remote Options Second */}
          {remoteOptions.length > 0 && (
            <div>
              <div className="px-3 py-2 text-xs font-medium text-gray-500 bg-gray-50 sticky top-0">
                Remote Options
              </div>
              {remoteOptions.map((location) => (
                <button
                  key={location}
                  onClick={() => handleSelect(location)}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-green-50 focus:bg-green-50 focus:outline-none border-b border-gray-50 last:border-b-0"
                >
                  {location}
                </button>
              ))}
            </div>
          )}

          {/* Regions & Countries Last */}
          {regions.length > 0 && (
            <div>
              <div className="px-3 py-2 text-xs font-medium text-gray-500 bg-gray-50 sticky top-0">
                Regions & Countries
              </div>
              {regions.map((location) => (
                <button
                  key={location}
                  onClick={() => handleSelect(location)}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-purple-50 focus:bg-purple-50 focus:outline-none border-b border-gray-50 last:border-b-0"
                >
                  {location}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
