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
  status: "Email sent" | "Not sent";
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
    hasCompletedOnboarding,
  } = useAppStore();

  const { setCriteria, startNewSearch } = useSearchStore();

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
    const newStatus = currentStatus === "Email sent" ? "pending" : "sent";
    setUpdatingStatus(emailId);

    try {
      const response = await fetch("/api/emails/update-status", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          emailId,
          status: newStatus,
        }),
      });

      if (response.ok) {
        // Update the local state
        setSearchHistory((prev) =>
          prev.map((record) =>
            record.id === emailId
              ? { ...record, status: newStatus === "sent" ? "Email sent" : "Not sent" }
              : record
          )
        );
      } else {
        console.error("Failed to update email status");
      }
    } catch (error) {
      console.error("Error updating email status:", error);
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
        const response = await fetch("/api/search-history");
        if (response.ok) {
          const data = await response.json();
          setSearchHistory(data.searchHistory || []);
        }
      } catch (error) {
        console.error("Error fetching search history:", error);
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
    ? `${profile.first_name} ${profile.last_name || ""}`.trim()
    : user?.email?.split("@")[0] || "User";

  const getProfileCompletionPercentage = () => {
    if (!profile) return 0;

    // 🆕 NEW: Core fields that count towards 100% completion
    const coreFields = [
      profile.first_name,
      profile.last_name,
      profile.university,
      profile.study_level,
      profile.field_of_study,
    ];

    const completedCoreFields = coreFields.filter((field) => field && field.trim() !== "").length;
    return Math.round((completedCoreFields / coreFields.length) * 100);
  };

  // 🆕 NEW: Calculate bonus completion percentage
  const getBonusCompletionPercentage = () => {
    if (!profile) return 0;

    const bonusFields = [
      profile.phone,
      profile.linkedin,
      profile.language,
      profile.personal_website,
      profile.bio_text,
    ];

    const completedBonusFields = bonusFields.filter((field) => field && field.trim() !== "").length;
    return Math.round((completedBonusFields / bonusFields.length) * 100);
  };

  const handleWelcomeModalClose = () => {
    setShowWelcomeModal(false);
    setHasCompletedOnboarding(true);
  };

  useEffect(() => {
    // Force onboarding check for users without a profile or very new users
    if (user && !showWelcomeModal) {
      const shouldShowOnboarding =
        !profile ||
        (profile.created_at &&
          new Date(profile.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)) ||
        !hasCompletedOnboarding;

      if (shouldShowOnboarding && !hasCompletedOnboarding) {
        console.log("🎯 Forcing onboarding modal for new user");
        setShowWelcomeModal(true);
      }
    }
  }, [user, profile, showWelcomeModal, hasCompletedOnboarding, setShowWelcomeModal]);

  // Add handler for Start New Search
  const handleStartNewSearch = () => {
    startNewSearch(); // Clear the Zustand store
    router.push("/criteria"); // Navigate to criteria page
  };

  const FeedbackBanner = () => {
    const [isVisible, setIsVisible] = useState(true);
    const [feedback, setFeedback] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isVisible) return null;

    const handleSubmitFeedback = async () => {
      if (!feedback.trim()) return;

      setIsSubmitting(true);
      try {
        // Create a mailto link
        const subject = encodeURIComponent("Bypass MVP Feedback");
        const body = encodeURIComponent(`User Feedback: ${feedback}\n\nFrom: ${user?.email}`);
        const mailtoLink = `mailto:nathan.douziech@gmail.com?subject=${subject}&body=${body}`;

        window.open(mailtoLink);
        alert("Email client opened with your feedback. Please send the email!");
        setIsVisible(false);
      } catch (error) {
        alert("Please email your feedback directly to nathan.douziech@gmail.com");
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="font-semibold text-blue-900 mb-2">🚀 Help us improve Bypass!</h4>
            <p className="text-blue-700 text-sm mb-3">
              You're using our MVP! Your feedback helps us build exactly what you need.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="What would make Bypass better for you?"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="flex-1 px-3 py-2 border border-blue-300 rounded-lg text-sm"
                onKeyPress={(e) => e.key === "Enter" && handleSubmitFeedback()}
              />
              <Button
                onClick={handleSubmitFeedback}
                disabled={isSubmitting || !feedback.trim()}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? "Sending..." : "Send"}
              </Button>
            </div>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="text-blue-400 hover:text-blue-600 ml-4"
          >
            ✕
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      <WelcomeModal
        isOpen={showWelcomeModal}
        onClose={handleWelcomeModalClose}
        userName={profile?.first_name || user?.email?.split("@")[0]}
      />

      <div className="space-y-6">
        {/* Compact Header with Status */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, {userName} 👋</h1>
            <p className="text-lg text-gray-600">Let's find your next opportunity!</p>
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
                  onClick={() => router.push("/profile")}
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
                      onClick={() => router.push("/upgrade")}
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
              <h2 className="text-xl font-semibold mb-2">🎯 Find Your Next Opportunity</h2>
              <p className="text-blue-100 text-sm">
                Discover companies actively hiring for your profile and get direct contact with
                decision makers.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-blue-50 font-semibold shadow-lg px-8 py-4 text-lg"
                onClick={handleStartNewSearch}
              >
                <Search className="mr-3 h-6 w-6" />
                Start New Search
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-blue-600 font-semibold px-8 py-4 text-lg"
                onClick={() => router.push("/find-email")}
              >
                <Mail className="mr-3 h-6 w-6" />
                Find Email Address
              </Button>
            </div>
          </div>
        </div>

        {/* Search History - Mobile-Responsive Version */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Search History</h3>
              {totalItems > 0 && (
                <div className="text-sm text-gray-500 hidden sm:block">
                  Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems} emails
                </div>
              )}
            </div>
            {/* Mobile count */}
            {totalItems > 0 && (
              <div className="text-sm text-gray-500 mt-2 sm:hidden">
                {totalItems} email{totalItems !== 1 ? "s" : ""}
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            {historyLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-500">Loading...</span>
              </div>
            ) : currentItems.length > 0 ? (
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block">
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
                            <div className="text-sm text-gray-900 font-mono">{record.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(record.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => updateEmailStatus(record.id, record.status)}
                              disabled={updatingStatus === record.id}
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full cursor-pointer transition-colors hover:opacity-80 ${
                                record.status === "Email sent"
                                  ? "bg-green-100 text-green-800 hover:bg-green-200"
                                  : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                              } ${updatingStatus === record.id ? "opacity-50" : ""}`}
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
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden divide-y divide-gray-200">
                  {currentItems.map((record) => (
                    <div key={record.id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {record.company}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            {new Date(record.date).toLocaleDateString()}
                          </div>
                        </div>
                        <button
                          onClick={() => updateEmailStatus(record.id, record.status)}
                          disabled={updatingStatus === record.id}
                          className={`ml-3 inline-flex px-2 py-1 text-xs font-semibold rounded-full cursor-pointer transition-colors hover:opacity-80 ${
                            record.status === "Email sent"
                              ? "bg-green-100 text-green-800 hover:bg-green-200"
                              : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                          } ${updatingStatus === record.id ? "opacity-50" : ""}`}
                          title="Click to toggle status"
                        >
                          {updatingStatus === record.id ? (
                            <div className="flex items-center gap-1">
                              <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin"></div>
                            </div>
                          ) : record.status === "Email sent" ? (
                            "✓"
                          ) : (
                            "○"
                          )}
                        </button>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <div className="text-sm text-gray-900">{record.contact}</div>
                          <div className="text-xs text-gray-500">{record.contact_title}</div>
                        </div>
                        <div className="text-sm text-gray-900 font-mono break-all bg-gray-50 px-2 py-1 rounded">
                          {record.email}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Mobile-Optimized Pagination */}
                {totalPages > 1 && (
                  <div className="px-4 sm:px-6 py-4 border-t border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between">
                      {/* Mobile: Simplified pagination */}
                      <div className="flex items-center gap-2 md:hidden">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                          className="h-8 px-2"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>

                        <span className="text-sm text-gray-700 px-2">
                          {currentPage} / {totalPages}
                        </span>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                          className="h-8 px-2"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Desktop: Full pagination */}
                      <div className="hidden md:flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
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
                          onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                          className="h-8"
                        >
                          Next
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>

                      <div className="text-sm text-gray-500 hidden md:block">
                        Page {currentPage} of {totalPages}
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🚀</div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  Ready to start your job search?
                </h3>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">
                  Click "Start New Search" above to find companies and contacts that match your
                  profile.
                </p>
                <Button onClick={handleStartNewSearch} size="lg" className="px-8 py-3">
                  Start Your First Search
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile-Optimized Pro Tip */}
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-200">
          <div className="p-4 sm:p-6">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-indigo-900 mb-2">
                  Pro Tip: Quality over Quantity
                </h3>
                <p className="text-indigo-700 text-sm leading-relaxed">
                  Instead of sending 100+ generic applications, focus on 10-20 highly targeted
                  contacts. Our AI helps you find the right people and craft personalized messages
                  that get responses.
                </p>
                {/* Mobile: Stack stats vertically, Desktop: Horizontal */}
                <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-indigo-600">
                  <span className="flex items-center gap-1">
                    <span>📈</span>
                    <span>3.2x more interviews</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span>⚡</span>
                    <span>67% response rate</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span>🎯</span>
                    <span>5 days to first interview</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <FeedbackBanner />
      </div>
    </>
  );
}
