"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Search, Loader2, ChevronDown, ChevronUp, Zap, Globe } from "lucide-react";
import Link from "next/link";
import { useSearchStore } from "@/stores/search-store";
import { SearchProgress } from "@/components/forms/search-progress";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { LocationCombobox } from "@/components/ui/location-combobox";
import { Select } from "@/components/ui/select";
import { JOB_TYPES } from "@/constants/job-types";
import { IndustryCombobox } from "@/components/ui/industry-combobox";
import { JobPlatformsSelector } from "@/components/ui/job-platforms-selector";
import { COMPANY_SIZES } from "@/constants/company-sizes";
import { EXPERIENCE_LEVELS } from "@/constants/experience-levels";
import { LANGUAGES } from "@/constants/languages";
import { SalarySelector } from "@/components/ui/salary-selector";
import { KeywordsSelector } from "@/components/ui/keywords-selector";
import { ExcludeCompaniesSelector } from "@/components/ui/exclude-companies-selector";
import { FieldWithTooltip } from "@/components/ui/field-with-tooltip";
import posthog from "posthog-js";

// Define the criteria interface to match the store
interface SearchCriteria {
  jobTitle: string;
  location?: string;
  jobType?: string;
  industry?: string;
  jobPlatforms?: string;
  companySize?: string;
  experienceLevel?: string;
  keywords?: string[];
  language?: string;
  expectedSalary?: string;
  excludeCompanies?: string;
}

export default function CriteriaPage() {
  const router = useRouter();
  const {
    criteria: savedCriteria,
    setCriteria,
    setCompanies,
    startNewSearch,
    searchMode,
    setSearchMode,
  } = useSearchStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [targetProgress, setTargetProgress] = useState(0);

  // ✅ Initialize with saved criteria or empty form
  const [criteria, setCriteriaState] = useState<SearchCriteria>(() => ({
    jobTitle: savedCriteria?.jobTitle || "",
    location: savedCriteria?.location || "",
    jobType: savedCriteria?.jobType || "",
    industry: savedCriteria?.industry || "",
    jobPlatforms: savedCriteria?.jobPlatforms || "", // ✅ Now supported
    companySize: savedCriteria?.companySize || "",
    experienceLevel: savedCriteria?.experienceLevel || "",
    keywords: savedCriteria?.keywords || [],
    language: savedCriteria?.language || "",
    expectedSalary: savedCriteria?.expectedSalary || "",
    excludeCompanies: savedCriteria?.excludeCompanies || "", // ✅ Now supported
  }));

  // ✅ Check URL params to determine if this is a new search
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const isNewSearch = urlParams.get("new") === "true";

    if (isNewSearch) {
      // Clear the store and form when explicitly starting a new search
      startNewSearch();
      setCriteriaState({
        jobTitle: "",
        location: "",
        jobType: "",
        industry: "",
        jobPlatforms: "",
        companySize: "",
        experienceLevel: "",
        keywords: [],
        language: "",
        expectedSalary: "",
        excludeCompanies: "",
      });
    }
  }, [startNewSearch]);

  // Enhanced handleStartNewSearch function
  const handleStartNewSearch = () => {
    startNewSearch();
    setCriteriaState({
      jobTitle: "",
      location: "",
      jobType: "",
      industry: "",
      jobPlatforms: "",
      companySize: "",
      experienceLevel: "",
      keywords: [],
      language: "",
      expectedSalary: "",
      excludeCompanies: "",
    });
  };

  const handleInputChange = (field: keyof SearchCriteria, value: string | string[]) => {
    if (field === "keywords") {
      // Keywords are handled as array
      setCriteriaState((prev) => ({
        ...prev,
        [field]: value as string[],
      }));
    } else {
      setCriteriaState((prev) => ({
        ...prev,
        [field]: value as string,
      }));
    }
  };

  const showToast = (message: string, type: "success" | "error" = "error") => {
    // Only show alerts for errors, not success messages
    if (type === "error" && typeof window !== "undefined") {
      alert(`${type.toUpperCase()}: ${message}`);
    }
    console.log(`${type.toUpperCase()}: ${message}`);
  };

  // Much smoother animation with faster updates
  useEffect(() => {
    if (!showProgress) return;

    const interval = setInterval(() => {
      setTargetProgress((prev) => {
        const diff = targetProgress - prev;
        if (Math.abs(diff) < 0.1) return targetProgress;
        return prev + diff * 0.3; // ✅ Faster interpolation (was 0.1)
      });
    }, 30); // ✅ More frequent updates (was 50ms)

    return () => clearInterval(interval);
  }, [targetProgress, showProgress]);

  // Add useEffect to handle automatic redirect when API completes
  useEffect(() => {
    if (targetProgress >= 100 && showProgress) {
      // Small delay then redirect
      const timer = setTimeout(() => {
        setShowProgress(false);
        router.push("/companies");
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [targetProgress, showProgress, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Track when user starts a job search
    posthog.capture("job_search_started", {
      job_title: criteria.jobTitle,
      has_location: !!criteria.location,
      has_industry: !!criteria.industry,
    });

    setTargetProgress(0);
    setShowProgress(true);

    // ✅ Continuous micro-progress to prevent feeling stuck
    const microProgressInterval = setInterval(() => {
      setTargetProgress((prev) => {
        if (prev < 70) {
          // Only during API call
          return prev + 0.5; // Tiny increments every 100ms
        }
        return prev;
      });
    }, 100);

    try {
      setCriteria(criteria);
      // API call happens while micro-progress continues

      const response = await fetch("/api/companies/websearch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...criteria,
          searchMode, // Include the current search mode
        }),
      });
      clearInterval(microProgressInterval); // Stop micro-progress
      setTargetProgress(85); // Jump to near completion

      const result = await response.json();
      setTargetProgress(100);

      if (result.companies?.length > 0) {
        setCompanies(result.companies);
        showToast(`Found ${result.companies.length} companies matching your criteria`, "success");
      } else {
        // ✅ Enhanced error handling with recovery options
        clearInterval(microProgressInterval);
        setTargetProgress(0);
        setShowProgress(false);

        const errorMessage = result.message || "Unable to find companies matching your criteria";
        const isServiceError = result.error?.includes("temporarily unavailable");

        if (isServiceError) {
          const shouldRetry = window.confirm(
            `${errorMessage}\n\nWould you like to try again? This sometimes happens when our AI service is busy.`
          );
          if (shouldRetry) {
            // Retry the same search
            setTimeout(() => handleSubmit(e), 1000);
            return;
          }
        } else {
          const shouldAdjust = window.confirm(
            `${errorMessage}\n\nWould you like to adjust your search criteria? Try making your job title more general or removing some filters.`
          );
          if (shouldAdjust) {
            // Focus on job title field for easy editing
            const jobTitleInput = document.querySelector(
              'input[name="jobTitle"]'
            ) as HTMLInputElement;
            if (jobTitleInput) {
              jobTitleInput.focus();
            }
            return;
          }
        }

        showToast(errorMessage, "error");
      }
    } catch (error) {
      clearInterval(microProgressInterval);
      setTargetProgress(0);
      console.error("Error searching companies:", error);
      showToast("Network error. Please check your connection and try again.", "error");
    }
  };

  return (
    <div className="container mx-auto px-4 pt-0 py-3 max-w-4xl">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>

          {/* Add "Clear Form" button if there are existing criteria */}
          {savedCriteria && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleStartNewSearch}
              className="text-gray-600 hover:text-gray-900"
            >
              Clear Form
            </Button>
          )}
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Define Your Job Search Criteria</h1>
          {/* <p className="text-gray-600 text-sm">
            Fill in as much or as little as you want. The more you add, the better the results.
          </p> */}
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        {/* 🆕 Combined Header with Search Preferences and Search Mode */}
        <div className="p-3 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            {/* Left side - Search Preferences */}
            <div>
              <h2 className="text-lg font-semibold">Search Preferences</h2>
              {/* <p className="text-xs text-gray-600 mt-1">
                Only Job Title is required – everything else is optional
              </p> */}
            </div>

            {/* Right side - Search Mode */}
            <div className="flex flex-col sm:items-end">
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <h3 className="text-sm font-medium text-gray-900">Search Mode</h3>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {searchMode === "standard"
                      ? "Fast results using AI knowledge (3-5 seconds)"
                      : "Real-time web search for latest data (10-15 seconds)"}
                  </p>
                </div>

                <ToggleGroup
                  type="single"
                  value={searchMode}
                  onValueChange={(value) =>
                    value && setSearchMode(value as "standard" | "websearch")
                  }
                  className="bg-white"
                >
                  <ToggleGroupItem value="standard" className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    <span className="hidden sm:inline">Fast</span>
                  </ToggleGroupItem>
                  <ToggleGroupItem value="websearch" className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    <span className="hidden sm:inline">Web Search</span>
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 pb-24">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Job Title Field - UPDATED */}
            <FieldWithTooltip
              label="Job Title"
              tooltip="Be specific - use the exact job title you're targeting"
              required
              htmlFor="jobTitle"
            >
              <Input
                id="jobTitle"
                placeholder="Business Analyst, Sales Assistant, Marketing Coordinator, Data Analyst, etc."
                value={criteria.jobTitle}
                onChange={(e) => handleInputChange("jobTitle", e.target.value)}
                required
                className="w-full"
              />
            </FieldWithTooltip>

            {/* Location Field - UPDATED */}
            <FieldWithTooltip
              label="Location"
              tooltip="Try: City names, 'Remote', regions, or be specific like 'Remote - Europe only'"
              htmlFor="location"
            >
              <LocationCombobox
                value={criteria.location || ""}
                onChange={(value) => handleInputChange("location", value)}
                placeholder="San Francisco, Paris, London, Remote, etc."
              />
            </FieldWithTooltip>

            {/* Job Type and Industry - UPDATED */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FieldWithTooltip
                label="Job Type"
                tooltip="Choose the employment type that fits your availability"
                htmlFor="jobType"
              >
                <Select
                  value={criteria.jobType || ""}
                  onChange={(value) => handleInputChange("jobType", value)}
                  options={JOB_TYPES}
                  placeholder="Select job type..."
                />
              </FieldWithTooltip>

              <FieldWithTooltip
                label="Industry"
                tooltip="Type to search or browse popular industries"
                htmlFor="industry"
              >
                <IndustryCombobox
                  value={criteria.industry || ""}
                  onChange={(value) => handleInputChange("industry", value)}
                  placeholder="Finance, Marketing, Consulting, HR, IT, Legal, Sales, etc."
                />
              </FieldWithTooltip>
            </div>

            {/* Advanced Filters Toggle - More Visible */}
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50/50">
              <button
                type="button"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="flex items-center justify-between w-full text-left group hover:bg-white hover:border-blue-200 hover:shadow-sm transition-all duration-200 p-3 rounded-lg border border-transparent"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-full transition-colors ${showAdvancedFilters ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600 group-hover:bg-blue-50 group-hover:text-blue-600"}`}
                  >
                    <ChevronDown
                      className={`h-5 w-5 transition-transform ${showAdvancedFilters ? "rotate-180" : ""}`}
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-900">
                      {showAdvancedFilters ? "Hide Advanced Filters" : "Show Advanced Filters"}
                    </h3>
                    <p className="text-sm text-gray-600 mt-0.5">
                      {showAdvancedFilters
                        ? "Collapse additional search options"
                        : "Fine-tune your search with platforms, company size, experience level & more"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!showAdvancedFilters && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                      6 more filters
                    </span>
                  )}
                </div>
              </button>
            </div>

            {/* Advanced Filters - Collapsible */}
            {showAdvancedFilters && (
              <div className="space-y-3 animate-in slide-in-from-top-2 duration-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FieldWithTooltip
                    label="Job Platforms"
                    tooltip="Select multiple platforms to maximize your search coverage"
                    htmlFor="jobPlatforms"
                  >
                    <JobPlatformsSelector
                      value={criteria.jobPlatforms || ""}
                      onChange={(value) => handleInputChange("jobPlatforms", value)}
                    />
                  </FieldWithTooltip>

                  <FieldWithTooltip
                    label="Company Size"
                    tooltip="Choose based on your preferred work environment"
                    htmlFor="companySize"
                  >
                    <Select
                      value={criteria.companySize || ""}
                      onChange={(value) => handleInputChange("companySize", value)}
                      options={COMPANY_SIZES}
                      placeholder="Select company size..."
                    />
                  </FieldWithTooltip>

                  <FieldWithTooltip
                    label="Experience Level"
                    tooltip="Match your current career stage"
                    htmlFor="experienceLevel"
                  >
                    <Select
                      value={criteria.experienceLevel || ""}
                      onChange={(value) => handleInputChange("experienceLevel", value)}
                      options={EXPERIENCE_LEVELS}
                      placeholder="Select experience level..."
                    />
                  </FieldWithTooltip>

                  <FieldWithTooltip
                    label="Preferred Language"
                    tooltip="Choose your preferred working language"
                    htmlFor="language"
                  >
                    <Select
                      value={criteria.language || ""}
                      onChange={(value) => handleInputChange("language", value)}
                      options={LANGUAGES}
                      placeholder="Select preferred language..."
                    />
                  </FieldWithTooltip>

                  <FieldWithTooltip
                    label="Expected Salary"
                    tooltip="Optional - helps find roles matching your expectations"
                    htmlFor="expectedSalary"
                  >
                    <SalarySelector
                      value={criteria.expectedSalary || ""}
                      onChange={(value) => handleInputChange("expectedSalary", value)}
                    />
                  </FieldWithTooltip>
                </div>

                <FieldWithTooltip
                  label="Keywords"
                  tooltip="Add relevant keywords to refine your search"
                  htmlFor="keywords"
                >
                  <KeywordsSelector
                    value={criteria.keywords || []}
                    onChange={(value) => handleInputChange("keywords", value)}
                  />
                </FieldWithTooltip>

                <FieldWithTooltip
                  label="Exclude Companies"
                  tooltip="Specify companies or types to avoid in your search"
                  htmlFor="excludeCompanies"
                >
                  <ExcludeCompaniesSelector
                    value={criteria.excludeCompanies || ""}
                    onChange={(value) => handleInputChange("excludeCompanies", value)}
                  />
                </FieldWithTooltip>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Sticky CTA Button - Updated */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 z-50 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="hidden sm:block">
            <p className="text-sm text-gray-600 font-medium">Ready to find companies?</p>
            <p className="text-xs text-gray-500">
              {searchMode === "standard"
                ? "AI will search using knowledge base (faster)"
                : "AI will search the web for latest data (more accurate)"}
            </p>
          </div>
          <Button
            type="submit"
            size="lg"
            disabled={isLoading || !criteria.jobTitle.trim()}
            className="w-full sm:w-auto sm:min-w-[180px] bg-blue-600 hover:bg-blue-700 text-white"
            onClick={handleSubmit}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {searchMode === "standard" ? "Searching..." : "Web Searching..."}
              </>
            ) : (
              <>
                {searchMode === "standard" ? (
                  <Zap className="mr-2 h-4 w-4" />
                ) : (
                  <Globe className="mr-2 h-4 w-4" />
                )}
                Find Companies
              </>
            )}
          </Button>
        </div>
      </div>

      <SearchProgress
        isVisible={showProgress}
        apiProgress={targetProgress}
        searchMode={searchMode}
      />
    </div>
  );
}
