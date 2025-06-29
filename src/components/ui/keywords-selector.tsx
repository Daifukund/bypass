"use client";

import { useState, useEffect, useRef } from "react";
import { Tags, X, Plus, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { POPULAR_KEYWORDS } from "@/constants/keywords";

interface KeywordsSelectorProps {
  value: string[];
  onChange: (value: string[]) => void;
}

export function KeywordsSelector({ value, onChange }: KeywordsSelectorProps) {
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>(value || []);
  const [inputValue, setInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectedKeywords(value || []);
  }, [value]);

  // Filter keywords based on input and exclude already selected
  const filteredKeywords = POPULAR_KEYWORDS.filter(
    (keyword) =>
      keyword.toLowerCase().includes(inputValue.toLowerCase()) &&
      !selectedKeywords.includes(keyword)
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

  const addKeyword = (keyword: string) => {
    if (keyword.trim() && !selectedKeywords.includes(keyword.trim())) {
      const newKeywords = [...selectedKeywords, keyword.trim()];
      setSelectedKeywords(newKeywords);
      onChange(newKeywords);
      setInputValue("");
      setIsOpen(false);
    }
  };

  const removeKeyword = (keywordToRemove: string) => {
    const newKeywords = selectedKeywords.filter((k) => k !== keywordToRemove);
    setSelectedKeywords(newKeywords);
    onChange(newKeywords);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setIsOpen(newValue.length > 0);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      addKeyword(inputValue);
    } else if (e.key === "Backspace" && !inputValue && selectedKeywords.length > 0) {
      // Remove last keyword when backspace on empty input
      removeKeyword(selectedKeywords[selectedKeywords.length - 1]);
    }
  };

  const handleInputFocus = () => {
    if (inputValue) setIsOpen(true);
  };

  return (
    <div className="space-y-3">
      {/* Selected Keywords Tags */}
      {selectedKeywords.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedKeywords.map((keyword) => (
            <span
              key={keyword}
              className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
            >
              <Tags className="h-3 w-3" />
              {keyword}
              <button
                type="button"
                onClick={() => removeKeyword(keyword)}
                className="hover:bg-blue-200 rounded-full p-0.5 ml-1"
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
          <Tags className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            onFocus={handleInputFocus}
            placeholder={
              selectedKeywords.length > 0 ? "Add another keyword..." : "Type or select keywords..."
            }
            className="pl-10"
          />
        </div>

        {/* Dropdown with suggestions */}
        {isOpen && filteredKeywords.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border border-gray-200 bg-white shadow-lg"
          >
            <div className="px-3 py-2 text-xs font-medium text-gray-500 bg-gray-50 sticky top-0">
              Popular Keywords
            </div>
            {filteredKeywords.map((keyword) => (
              <button
                key={keyword}
                type="button"
                onClick={() => addKeyword(keyword)}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-50 last:border-b-0 flex items-center gap-2"
              >
                <Plus className="h-3 w-3 text-gray-400" />
                {keyword}
              </button>
            ))}

            {/* Custom keyword option */}
            {inputValue &&
              !filteredKeywords.some((k) => k.toLowerCase() === inputValue.toLowerCase()) && (
                <button
                  type="button"
                  onClick={() => addKeyword(inputValue)}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-blue-50 focus:bg-blue-50 focus:outline-none border-t border-gray-200 flex items-center gap-2 font-medium text-blue-600"
                >
                  <Plus className="h-3 w-3" />
                  Add "{inputValue}"
                </button>
              )}
          </div>
        )}
      </div>
    </div>
  );
}
