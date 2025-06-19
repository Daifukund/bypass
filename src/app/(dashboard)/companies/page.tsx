'use client';

import { useRouter } from 'next/navigation';
import { useSearchStore } from '@/stores/search-store';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Building2, MapPin, ExternalLink, Plus } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { EmployeeSearchProgress } from '@/components/forms/employee-search-progress';

export default function CompaniesPage() {
  const { companies, selectedCompany, setSelectedCompany, criteria, setEmployees, addManualCompany } = useSearchStore();
  const router = useRouter();
  const [loadingCompanyId, setLoadingCompanyId] = useState<string | null>(null);
  const [showProgress, setShowProgress] = useState(false);
  const [searchingCompanyName, setSearchingCompanyName] = useState<string>('');
  
  // 🆕 Add manual company modal state
  const [showAddCompany, setShowAddCompany] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');

  // ✅ Better handling of direct navigation
  useEffect(() => {
    if (!companies?.length && !criteria) {
      // No search data at all - redirect to criteria
      router.push('/criteria');
    } else if (!companies?.length && criteria) {
      // Has criteria but no companies - might need to research
      console.log('Has criteria but no companies - user might need to research');
    }
  }, [companies, criteria, router]);

  // ✅ Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      // State is automatically restored from localStorage
      console.log('Browser navigation - state restored from localStorage');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Remove the separate handleSelectCompany function
  // Replace with direct handleFindEmployees function
  const handleFindEmployees = async (company: any) => {
    if (loadingCompanyId) return; // Prevent multiple clicks
    
    setLoadingCompanyId(company.id);
    setSelectedCompany(company); // Set selected company for state management
    setSearchingCompanyName(company.name);
    setShowProgress(true);
    
    try {
      const response = await fetch('/api/employees/websearch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: company.name,
          companyId: company.id,
          jobTitle: criteria?.jobTitle,
          location: criteria?.location
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch employees');
      }
      
      const employeesData = await response.json();
      console.log('✅ Employee search result:', employeesData);
      
      // Save the employee results in Zustand
      setEmployees(employeesData.employees || []);
      
      // Don't navigate immediately - let the progress complete
      
    } catch (error) {
      console.error('❌ Error fetching employees:', error);
      setShowProgress(false);
      // Add toast notification here if you have one
    } finally {
      setLoadingCompanyId(null);
    }
  };

  const handleProgressComplete = () => {
    setShowProgress(false);
    router.push('/employees');
  };

  // 🆕 Add manual company handler
  const handleAddManualCompany = () => {
    if (!newCompanyName.trim()) return;
    
    addManualCompany(newCompanyName.trim());
    setNewCompanyName('');
    setShowAddCompany(false);
  };

  const getRelevanceColor = (score: string) => {
    switch (score.toLowerCase()) {
      case 'perfect match':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'good match':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'potential match':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'manual entry': // 🆕 Add manual entry styling
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  console.log('🔍 DEBUG Companies in frontend:', companies.map(c => ({ id: c.id, name: c.name })));

  if (!companies?.length) {
    return (
      <div className="container mx-auto px-4 pt-3 pb-8 max-w-2xl">
        <Link 
          href="/criteria" 
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Criteria
        </Link>
        
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
            <Building2 className="h-8 w-8 text-gray-400" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">No Companies Found</h1>
          <p className="text-gray-600 max-w-md mx-auto">
            We couldn't find any companies matching your criteria. This might be because:
          </p>
          <ul className="text-sm text-gray-500 space-y-1 max-w-md mx-auto">
            <li>• Your search criteria are too specific</li>
            <li>• The job market is limited in your location</li>
            <li>• Our search service is temporarily unavailable</li>
          </ul>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Button onClick={() => router.push('/criteria')} variant="default">
              Adjust Search Criteria
            </Button>
            <Button onClick={() => router.push('/dashboard')} variant="outline">
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pb-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <Link 
          href="/criteria" 
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Criteria
        </Link>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Companies Matching Your Search</h1>
              <p className="text-gray-600">
                Based on your criteria, we found these companies that are likely hiring now. Click "Find Employees" to continue.
              </p>
            </div>
            
            {/* 🆕 Add Company Button */}
            <Button
              onClick={() => setShowAddCompany(true)}
              variant="outline"
              className="flex items-center gap-2 shrink-0"
            >
              <Plus className="h-4 w-4" />
              Add Company
            </Button>
          </div>
        </div>
      </div>

      {/* 🆕 Add Company Modal */}
      {showAddCompany && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Add Company Manually</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                  placeholder="Enter company name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAddManualCompany();
                    }
                  }}
                />
              </div>
              <p className="text-sm text-gray-500">
                Location will be set to: {criteria?.location || 'Not specified'}
              </p>
            </div>
            
            <div className="flex gap-3 mt-6">
              <Button
                onClick={handleAddManualCompany}
                disabled={!newCompanyName.trim()}
                className="flex-1"
              >
                Add Company
              </Button>
              <Button
                onClick={() => {
                  setShowAddCompany(false);
                  setNewCompanyName('');
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Companies Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {companies.map((company) => (
          <div
            key={company.id}
            className={`
              relative border rounded-xl p-6 hover:shadow-lg transition-all duration-200
              ${loadingCompanyId === company.id ? 'opacity-75' : 'hover:border-gray-300'}
              ${company.relevanceScore === 'Manual Entry' ? 'border-purple-200 bg-purple-50' : ''}
            `}
          >
            {/* Company Logo/Initial */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg">
                  {company.logoUrl || company.name.charAt(0).toUpperCase()}
                </div>
              </div>
              
              {/* Relevance Score Badge */}
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRelevanceColor(company.relevanceScore)}`}>
                {company.relevanceScore}
              </span>
            </div>

            {/* Company Info */}
            <div className="space-y-3">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 line-clamp-1">
                  {company.name}
                </h2>
                <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                  {company.description}
                </p>
              </div>

              {/* Location */}
              {company.location && (
                <div className="flex items-center text-sm text-gray-500">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span className="line-clamp-1">{company.location}</span>
                </div>
              )}

              {/* Company URL */}
              {company.url && (
                <div className="flex items-center text-sm text-blue-600">
                  <ExternalLink className="h-4 w-4 mr-1" />
                  <a 
                    href={company.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:underline line-clamp-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Visit Website
                  </a>
                </div>
              )}

              {/* Find Employees Button */}
              <div className="pt-2">
                <Button 
                  size="sm" 
                  className="w-full"
                  disabled={loadingCompanyId !== null}
                  onClick={() => handleFindEmployees(company)}
                >
                  {loadingCompanyId === company.id ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Finding employees...
                    </>
                  ) : (
                    <>
                      Find Employees
                      <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <p className="text-sm text-gray-500 mt-8 text-center">
        Click "Find Employees" on any company to discover relevant contacts and start your outreach.
      </p>

      {/* Employee Search Progress */}
      <EmployeeSearchProgress 
        isVisible={showProgress} 
        companyName={searchingCompanyName}
        onComplete={handleProgressComplete}
      />
    </div>
  );
}