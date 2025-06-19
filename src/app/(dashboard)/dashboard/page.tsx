"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/stores/app-store";
import { useSearchStore } from "@/stores/search-store";
import { Button } from "@/components/ui/button";
import { Search, TrendingUp, Mail, ChevronLeft, ChevronRight } from "lucide-react";
import { WelcomeModal } from "@/components/onboarding/welcome-modal";

interface SearchHistoryItem {
  id: string;
  company: string;
  contact: string;
  contact_title: string;
  email: string;
  date: string;
  status: 'Email sent' | 'Not sent';
}

export default function DashboardPage() {
  const router = useRouter();
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Use app store (already initialized by layout)
  const { 
    user, 
    profile, 
    emailCreditsUsed,
    maxFreeCredits,
    isPremium,
    creditsRemaining,
    showWelcomeModal,
    setShowWelcomeModal,
    setHasCompletedOnboarding,
    hasCompletedOnboarding
  } = useAppStore();

  const { setCriteria } = useSearchStore();

  // Pagination calculations
  const totalItems = searchHistory.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = searchHistory.slice(startIndex, endIndex);

  // Reset to page 1 when search history changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchHistory]);

  // Function to update email status
  const updateEmailStatus = async (emailId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Email sent' ? 'pending' : 'sent';
    setUpdatingStatus(emailId);
    
    try {
      const response = await fetch('/api/emails/update-status', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emailId,
          status: newStatus
        }),
      });

      if (response.ok) {
        // Update the local state
        setSearchHistory(prev => 
          prev.map(record => 
            record.id === emailId 
              ? { ...record, status: newStatus === 'sent' ? 'Email sent' : 'Not sent' }
              : record
          )
        );
      } else {
        console.error('Failed to update email status');
      }
    } catch (error) {
      console.error('Error updating email status:', error);
    } finally {
      setUpdatingStatus(null);
    }
  };

  // Simplified data fetching - only search history
  useEffect(() => {
    if (!user?.id) return;

    const fetchSearchHistory = async () => {
      setHistoryLoading(true);
      
      try {
        const response = await fetch('/api/search-history');
        if (response.ok) {
          const data = await response.json();
          setSearchHistory(data.searchHistory || []);
        }
      } catch (error) {
        console.error('Error fetching search history:', error);
        // Don't block the UI for non-critical data
      } finally {
        setHistoryLoading(false);
      }
    };

    fetchSearchHistory();
  }, [user?.id]);

  // Don't show loading screen - let layout handle auth
  if (!user) {
    return null; // Layout will redirect to login
  }

  const userName = profile?.first_name 
    ? `${profile.first_name} ${profile.last_name || ''}`.trim()
    : user?.email?.split('@')[0] || 'User';

  const getProfileCompletionPercentage = () => {
    if (!profile) return 0;
    
    const fields = [
      profile.first_name,
      profile.last_name,
      profile.university,
      profile.study_level,
      profile.field_of_study,
      profile.phone,
      profile.linkedin,
    ];
    
    const completedFields = fields.filter(field => field && field.trim() !== "").length;
    return Math.round((completedFields / fields.length) * 100);
  };

  const handleWelcomeModalClose = () => {
    setShowWelcomeModal(false);
    setHasCompletedOnboarding(true);
  };

  useEffect(() => {
    // Force onboarding check for users without a profile or very new users
    if (user && !showWelcomeModal) {
      const shouldShowOnboarding = !profile || 
        (profile.created_at && new Date(profile.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)) ||
        !hasCompletedOnboarding;
      
      if (shouldShowOnboarding && !hasCompletedOnboarding) {
        console.log('🎯 Forcing onboarding modal for new user');
        setShowWelcomeModal(true);
      }
    }
  }, [user, profile, showWelcomeModal, hasCompletedOnboarding, setShowWelcomeModal]);

  return (
    <>
      <WelcomeModal
        isOpen={showWelcomeModal}
        onClose={handleWelcomeModalClose}
        userName={profile?.first_name || user?.email?.split('@')[0]}
      />
      
      <div className="space-y-6">
        {/* Compact Header with Status */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {userName} 👋
            </h1>
            <p className="text-gray-600">
              Ready to skip the job board queue?
            </p>
          </div>

          {/* Compact Status Indicators */}
          <div className="flex items-center gap-3">
            {/* Profile Completion - Compact */}
            {getProfileCompletionPercentage() < 100 && (
              <div className="flex items-center gap-2 text-sm">
                <div className="w-8 h-8 relative">
                  <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="3"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="3"
                      strokeDasharray={`${getProfileCompletionPercentage()}, 100`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-700">
                      {getProfileCompletionPercentage()}%
                    </span>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-blue-600 hover:text-blue-700 p-0 h-auto font-medium"
                  onClick={() => router.push('/profile')}
                >
                  Complete profile
                </Button>
              </div>
            )}
            
            {/* Premium/Credits Status - Compact */}
            <div className="flex items-center gap-2">
              {isPremium ? (
                <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-full px-3 py-1">
                  <span className="text-yellow-600">✨</span>
                  <span className="text-sm font-medium text-yellow-800">Premium</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-3 py-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">
                    {creditsRemaining}/{maxFreeCredits} credits
                  </span>
                  {creditsRemaining <= 1 && (
                    <Button 
                      size="sm" 
                      className="h-6 px-2 text-xs ml-1"
                      onClick={() => router.push('/upgrade')}
                    >
                      Upgrade
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Action - Prominent */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold mb-2">
                🎯 Find Your Next Opportunity
              </h2>
              <p className="text-blue-100 text-sm">
                Discover companies actively hiring for your profile and get direct contact with decision makers.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg"
                className="bg-white text-blue-600 hover:bg-blue-50 font-semibold shadow-lg"
                onClick={() => router.push('/criteria')}
              >
                <Search className="mr-2 h-5 w-5" />
                Start New Search
              </Button>
              
              <Button 
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-blue-600 font-semibold"
                onClick={() => router.push('/find-email')}
              >
                <Mail className="mr-2 h-5 w-5" />
                Find Email Address
              </Button>
            </div>
          </div>
        </div>

        {/* Search History - With Pagination */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Search History</h3>
              {totalItems > 0 && (
                <div className="text-sm text-gray-500">
                  Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems} emails
                </div>
              )}
            </div>
          </div>
          
          <div className="overflow-x-auto">
            {historyLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-500">Loading...</span>
              </div>
            ) : currentItems.length > 0 ? (
              <>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Company
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentItems.map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {record.company}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{record.contact}</div>
                          <div className="text-sm text-gray-500">{record.contact_title}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 font-mono">
                            {record.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(record.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => updateEmailStatus(record.id, record.status)}
                            disabled={updatingStatus === record.id}
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full cursor-pointer transition-colors hover:opacity-80 ${
                              record.status === 'Email sent' 
                                ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                            } ${updatingStatus === record.id ? 'opacity-50' : ''}`}
                            title="Click to toggle status"
                          >
                            {updatingStatus === record.id ? (
                              <div className="flex items-center gap-1">
                                <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin"></div>
                                <span>Updating...</span>
                              </div>
                            ) : (
                              record.status
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                          className="h-8"
                        >
                          <ChevronLeft className="h-4 w-4 mr-1" />
                          Previous
                        </Button>
                        
                        <div className="flex items-center gap-1">
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <Button
                              key={page}
                              variant={currentPage === page ? "default" : "ghost"}
                              size="sm"
                              onClick={() => setCurrentPage(page)}
                              className="h-8 w-8 p-0"
                            >
                              {page}
                            </Button>
                          ))}
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                          className="h-8"
                        >
                          Next
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                      
                      <div className="text-sm text-gray-500">
                        Page {currentPage} of {totalPages}
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Mail className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No email addresses generated yet</h3>
                <p className="text-gray-500 mb-6">
                  Complete your first search and generate email addresses to see them here.
                </p>
                <Button onClick={() => router.push('/criteria')}>
                  Start Your First Search
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Pro Tip - Value-focused, not stats-focused */}
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-200">
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-indigo-900 mb-2">
                  Pro Tip: Quality over Quantity
                </h3>
                <p className="text-indigo-700 text-sm leading-relaxed">
                  Instead of sending 100+ generic applications, focus on 10-20 highly targeted contacts. 
                  Our AI helps you find the right people and craft personalized messages that get responses.
                </p>
                <div className="mt-3 flex items-center gap-4 text-xs text-indigo-600">
                  <span>📈 3.2x more interviews</span>
                  <span>⚡ 67% response rate</span>
                  <span>🎯 5 days to first interview</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}