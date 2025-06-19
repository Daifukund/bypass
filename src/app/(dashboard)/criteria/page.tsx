'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Search, Loader2, ChevronDown, ChevronUp, Zap, Globe } from 'lucide-react';
import Link from 'next/link';
import { useSearchStore } from '@/stores/search-store';
import { SearchProgress } from '@/components/forms/search-progress';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

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
  const { criteria: savedCriteria, setCriteria, setCompanies, startNewSearch, searchMode, setSearchMode } = useSearchStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  
  // ✅ Initialize with saved criteria or empty form
  const [criteria, setCriteriaState] = useState<SearchCriteria>(() => ({
    jobTitle: savedCriteria?.jobTitle || '',
    location: savedCriteria?.location || '',
    jobType: savedCriteria?.jobType || '',
    industry: savedCriteria?.industry || '',
    jobPlatforms: savedCriteria?.jobPlatforms || '', // ✅ Now supported
    companySize: savedCriteria?.companySize || '',
    experienceLevel: savedCriteria?.experienceLevel || '',
    keywords: savedCriteria?.keywords || [],
    language: savedCriteria?.language || '',
    expectedSalary: savedCriteria?.expectedSalary || '',
    excludeCompanies: savedCriteria?.excludeCompanies || '' // ✅ Now supported
  }));

  // ✅ Add "Start New Search" button
  const handleStartNewSearch = () => {
    startNewSearch();
    setCriteriaState({
      jobTitle: '',
      location: '',
      jobType: '',
      industry: '',
      jobPlatforms: '',
      companySize: '',
      experienceLevel: '',
      keywords: [],
      language: '',
      expectedSalary: '',
      excludeCompanies: ''
    });
  };

  const handleInputChange = (field: keyof SearchCriteria, value: string) => {
    if (field === 'keywords') {
      // Convert comma-separated string to array
      const keywordsArray = value.split(',').map(k => k.trim()).filter(k => k.length > 0);
      setCriteriaState(prev => ({
        ...prev,
        [field]: keywordsArray
      }));
    } else {
      setCriteriaState(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const showToast = (message: string, type: 'success' | 'error' = 'error') => {
    // Only show alerts for errors, not success messages
    if (type === 'error' && typeof window !== 'undefined') {
      alert(`${type.toUpperCase()}: ${message}`);
    }
    console.log(`${type.toUpperCase()}: ${message}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!criteria.jobTitle.trim()) {
      showToast('Please enter a job title', 'error');
      return;
    }
  
    setIsLoading(true);
    setShowProgress(true);
    
    try {
      // Store criteria in Zustand store
      setCriteria(criteria);
      
      // 🆕 Include search mode in API request
      const requestBody = {
        ...criteria,
        searchMode // Include the current search mode
      };
      
      // Call the API route to search for companies
      const response = await fetch('/api/companies/websearch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody), // 🆕 Send search mode
      });
  
      const result = await response.json();
  
      if (!response.ok) {
        // Handle different error types
        if (response.status === 503) {
          // Service unavailable (OpenAI failed)
          showToast('Our search service is temporarily unavailable. Please try again in a few minutes.', 'error');
        } else if (response.status === 400) {
          // Bad request (validation error)
          showToast(result.error || 'Please check your search criteria and try again.', 'error');
        } else {
          // Other errors
          showToast(result.error || 'Something went wrong. Please try again.', 'error');
        }
        setShowProgress(false);
        return;
      }
      
      if (result.companies && result.companies.length > 0) {
        // Store companies directly from API (no transformation needed)
        setCompanies(result.companies);
        
        showToast(`Found ${result.companies.length} companies matching your criteria`, 'success');
      } else {
        showToast('No companies found matching your criteria. Try adjusting your search preferences.', 'error');
        setShowProgress(false);
      }
    } catch (error) {
      console.error('Error searching companies:', error);
      showToast('Network error. Please check your connection and try again.', 'error');
      setShowProgress(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProgressComplete = () => {
    setShowProgress(false);
    router.push('/companies');
  };

  return (
    <div className="container mx-auto px-4 pt-0 py-3 max-w-4xl">
      {/* Header */}
      <div className="mb-4">
        <Link 
          href="/dashboard" 
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-2"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
        
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
                    {searchMode === 'standard' 
                      ? 'Fast results using AI knowledge (3-5 seconds)' 
                      : 'Real-time web search for latest data (10-15 seconds)'
                    }
                  </p>
                </div>
                
                <ToggleGroup 
                  type="single" 
                  value={searchMode} 
                  onValueChange={(value) => value && setSearchMode(value as 'standard' | 'websearch')}
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
            {/* Required Field */}
            <div className="space-y-1.5">
              <Label htmlFor="jobTitle" className="text-sm font-medium">
                Job Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="jobTitle"
                placeholder="Business Analyst, Sales Assistant, Audit Junior, Data Analyst, etc."
                value={criteria.jobTitle}
                onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                required
                className="w-full"
              />
            </div>

            {/* Location - Full Width */}
            <div className="space-y-1.5">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="San Francisco, Paris, London, Remote, etc."
                value={criteria.location || ''}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="w-full"
              />
            </div>

            {/* Job Type and Industry - Half Width Each */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="jobType">Job Type</Label>
                <Input
                  id="jobType"
                  placeholder="Internship, Full-time, Part-time, Freelance"
                  value={criteria.jobType || ''}
                  onChange={(e) => handleInputChange('jobType', e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  placeholder="Finance, Marketing, Consulting, HR, IT, Legal, Sales, etc."
                  value={criteria.industry || ''}
                  onChange={(e) => handleInputChange('industry', e.target.value)}
                />
              </div>
            </div>

            {/* Advanced Filters Toggle */}
            <div className="border-t border-gray-200 pt-3">
              <button
                type="button"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="flex items-center justify-between w-full text-left"
              >
                <h3 className="text-lg font-semibold text-gray-900">
                  {showAdvancedFilters ? 'Hide Advanced Filters' : 'Show Advanced Filters'}
                </h3>
                {showAdvancedFilters ? (
                  <ChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </button>
            </div>

            {/* Advanced Filters - Collapsible */}
            {showAdvancedFilters && (
              <div className="space-y-3 animate-in slide-in-from-top-2 duration-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="jobPlatforms">Job Platforms</Label>
                    <Input
                      id="jobPlatforms"
                      placeholder="LinkedIn, Indeed, Glassdoor, JobTeaser, etc."
                      value={criteria.jobPlatforms || ''}
                      onChange={(e) => handleInputChange('jobPlatforms', e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="companySize">Company Size</Label>
                    <Input
                      id="companySize"
                      placeholder="Startup (1–50), Scale-up (51–200), Corporate (1000+)"
                      value={criteria.companySize || ''}
                      onChange={(e) => handleInputChange('companySize', e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="experienceLevel">Experience Level</Label>
                    <Input
                      id="experienceLevel"
                      placeholder="Entry-level, Mid-level, Senior, Executive"
                      value={criteria.experienceLevel || ''}
                      onChange={(e) => handleInputChange('experienceLevel', e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="language">Preferred Language</Label>
                    <Input
                      id="language"
                      placeholder="English, French, German, Spanish, etc."
                      value={criteria.language || ''}
                      onChange={(e) => handleInputChange('language', e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="expectedSalary">Expected Salary</Label>
                    <Input
                      id="expectedSalary"
                      placeholder="e.g., €1500/month, $60K/year, Competitive"
                      value={criteria.expectedSalary || ''}
                      onChange={(e) => handleInputChange('expectedSalary', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="keywords">Keywords</Label>
                  <Input
                    id="keywords"
                    placeholder="Remote-first, No cold calling, Python, Sustainability, etc."
                    value={criteria.keywords?.join(', ') || ''}
                    onChange={(e) => handleInputChange('keywords', e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="excludeCompanies">Exclude Companies</Label>
                  <Input
                    id="excludeCompanies"
                    placeholder="Specific company names or types to avoid (e.g. Amazon, KPMG, Big 4, Call centers)"
                    value={criteria.excludeCompanies || ''}
                    onChange={(e) => handleInputChange('excludeCompanies', e.target.value)}
                  />
                </div>
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
              {searchMode === 'standard' 
                ? 'AI will search using knowledge base (faster)' 
                : 'AI will search the web for latest data (more accurate)'
              }
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
                {searchMode === 'standard' ? 'Searching...' : 'Web Searching...'}
              </>
            ) : (
              <>
                {searchMode === 'standard' ? (
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
        onComplete={handleProgressComplete}
      />
    </div>
  );
}