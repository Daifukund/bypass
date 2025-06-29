"use client";

import { useRouter } from "next/navigation";
import { useSearchStore } from "@/stores/search-store";
import { useAppStore } from "@/stores/app-store";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  User,
  MapPin,
  ExternalLink,
  Copy,
  Linkedin,
  AlertCircle,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSupabase } from "@/components/supabase-provider";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface UserProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  email_credits?: number;
  plan?: string;
}

export default function EmployeesPage() {
  const {
    selectedCompany,
    employees,
    selectedEmployee,
    setSelectedEmployee,
    criteria,
    linkedinPeopleSearchUrl,
  } = useSearchStore();
  const {
    user,
    profile,
    emailCreditsUsed,
    maxFreeCredits,
    isPremium,
    creditsRemaining,
    refreshProfile,
  } = useAppStore();

  const supabase = useSupabase();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [linkedinContent, setLinkedinContent] = useState("");
  const [showLinkedinPaste, setShowLinkedinPaste] = useState(false);
  const [isGeneratingLinkedInUrl, setIsGeneratingLinkedInUrl] = useState(false);
  const [extractionMessage, setExtractionMessage] = useState<string>("");
  const [extractionError, setExtractionError] = useState<string>("");

  // ✅ Better handling of direct navigation
  useEffect(() => {
    if (!selectedCompany && !criteria) {
      // No search data at all
      router.push("/criteria");
    } else if (!selectedCompany && criteria) {
      // Has criteria but no selected company
      router.push("/companies");
    }
  }, [selectedCompany, criteria, router]);

  // Get user and refresh profile data
  useEffect(() => {
    const initializeUser = async () => {
      if (!supabase) return;

      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error || !user) {
          router.push("/login");
          return;
        }

        // Use the app store's refreshProfile function to get latest data
        await refreshProfile(supabase);
      } catch (error) {
        console.error("Error initializing user:", error);
      }
    };

    initializeUser();
  }, [supabase, router, refreshProfile]);

  const handleSelectEmployee = async (employee: any) => {
    if (isLoading) return;

    // Check if user has credits before allowing selection
    if (!isPremium && emailCreditsUsed >= maxFreeCredits) {
      // Could show a modal or redirect to upgrade
      router.push("/upgrade");
      return;
    }

    setIsLoading(true);
    setSelectedEmployee(employee);

    // Navigate to emails page
    setTimeout(() => {
      router.push("/emails");
      setIsLoading(false);
    }, 300);
  };

  const getRelevanceColor = (score: string) => {
    switch (score.toLowerCase()) {
      case "perfect contact":
      case "perfect match":
        return "bg-green-100 text-green-800 border-green-200";
      case "good contact":
      case "good match":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "worth reaching out":
      case "potential match":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getLinkedInURL = () => {
    // Only return the AI-generated URL, no fallback
    return linkedinPeopleSearchUrl || "";
  };

  const handleLinkedInPaste = async () => {
    if (!linkedinContent.trim()) {
      setExtractionError("Please paste LinkedIn content first");
      return;
    }

    setIsLoading(true);
    setExtractionMessage("");
    setExtractionError("");

    try {
      console.log("🔍 Extracting employees from LinkedIn paste...");

      // Call API to extract employees from LinkedIn paste
      const response = await fetch("/api/employees/extract-from-paste", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: linkedinContent,
          companyName: selectedCompany?.name,
          location: criteria?.location,
        }),
      });

      const result = await response.json();

      console.log("📥 API Response:", result);

      if (!response.ok) {
        throw new Error(result.message || "Failed to extract employees");
      }

      if (result.success && result.employees && result.employees.length > 0) {
        // Transform API response to match frontend format
        const transformedEmployees = result.employees.map((emp: any) => ({
          id: emp.id,
          fullName: emp.name, // Map 'name' to 'fullName'
          jobTitle: emp.title, // Map 'title' to 'jobTitle'
          location: emp.location,
          linkedinUrl: emp.linkedinUrl,
          relevanceScore: emp.relevanceScore,
          source: emp.source,
        }));

        // Add extracted employees to existing list
        const { setEmployees } = useSearchStore.getState();
        const currentEmployees = useSearchStore.getState().employees;
        setEmployees([...currentEmployees, ...transformedEmployees]);

        // Show success message
        console.log(`✅ Successfully extracted ${result.employees.length} employees!`);

        setExtractionMessage(`✅ Successfully extracted ${result.employees.length} employees!`);
        setLinkedinContent("");

        // Auto-hide message after 3 seconds
        setTimeout(() => setExtractionMessage(""), 3000);
      } else {
        setExtractionError(
          "No employees found in the pasted content. Please make sure you copied the LinkedIn people search results correctly."
        );
      }
    } catch (error) {
      setExtractionError(
        `Error: ${error instanceof Error ? error.message : "Something went wrong"}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateLinkedInUrl = async () => {
    if (!selectedCompany || isGeneratingLinkedInUrl) return;

    setIsGeneratingLinkedInUrl(true);

    try {
      console.log("🔗 Generating LinkedIn URL for:", {
        companyName: selectedCompany.name,
        jobTitle: criteria?.jobTitle,
        location: criteria?.location,
      });

      const response = await fetch("/api/employees/generate-linkedin-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: selectedCompany.name,
          jobTitle: criteria?.jobTitle,
          location: criteria?.location,
        }),
      });

      // Log the full response for debugging
      console.log("📥 API Response Status:", response.status);
      console.log("📥 API Response OK:", response.ok);

      const data = await response.json();
      console.log("📥 API Response Data:", data);

      // Check if we got a LinkedIn URL (either from AI or fallback)
      if (data.linkedinUrl) {
        const { setLinkedinPeopleSearchUrl } = useSearchStore.getState();
        setLinkedinPeopleSearchUrl(data.linkedinUrl);
        console.log("✅ LinkedIn URL set:", data.linkedinUrl);

        // Show success message based on whether AI was used
        if (data.usedWebSearch) {
          console.log("🎉 AI-generated LinkedIn URL successfully created!");
        } else {
          console.log("⚠️ Using fallback LinkedIn URL (AI not available)");
        }
      } else {
        console.error("❌ No LinkedIn URL in response:", data);
        // You could add a toast notification here
      }
    } catch (error) {
      console.error("❌ Error generating LinkedIn URL:", error);
      // You could add a toast notification here
    } finally {
      setIsGeneratingLinkedInUrl(false);
    }
  };

  // Add this function to handle opening LinkedIn in a popup
  const handleOpenLinkedInPopup = () => {
    if (!linkedinPeopleSearchUrl) return;

    // Calculate popup dimensions (smaller window)
    const width = 1000;
    const height = 700;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;

    // Open LinkedIn in a popup window
    window.open(
      linkedinPeopleSearchUrl,
      "linkedin-search",
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
    );
  };

  if (!selectedCompany) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No company selected</p>
          <Button onClick={() => router.push("/companies")} className="mt-4">
            Back to Companies
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pb-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/companies"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Companies
        </Link>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Choose who you want to contact</h1>
          <p className="text-gray-600">
            We found the most relevant people at{" "}
            <span className="font-semibold">{selectedCompany.name}</span>. Click one to generate a
            personalized email.
          </p>
        </div>
      </div>

      {/* Credit Warning */}
      {!isPremium && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <div>
              <p className="text-yellow-800 font-medium">
                {emailCreditsUsed >= 5
                  ? "No email address credits remaining"
                  : `Only ${creditsRemaining} email address credit${creditsRemaining === 1 ? "" : "s"} remaining`}
              </p>
              <p className="text-yellow-700 text-sm">
                Each contact selection uses 1 credit to generate their email address.
                <Link href="/upgrade" className="ml-1 underline hover:no-underline">
                  Upgrade to Premium for unlimited access.
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Employee Cards Section */}
      {employees?.length > 0 ? (
        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-6">Recommended Contacts</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {employees.map((employee, index) => (
              <div
                key={employee.id || index}
                className={`
                  relative border rounded-xl p-6 hover:shadow-lg transition-all duration-200 cursor-pointer
                  ${selectedEmployee?.id === employee.id ? "ring-2 ring-blue-500 border-blue-200 bg-blue-50" : "hover:border-gray-300"}
                  ${isLoading ? "opacity-50 pointer-events-none" : ""}
                `}
                onClick={() => handleSelectEmployee(employee)}
              >
                {/* Employee Info */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-semibold text-lg">
                      {employee.fullName?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                  </div>

                  {/* Relevance Score Badge */}
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium border ${getRelevanceColor(employee.relevanceScore)}`}
                  >
                    {employee.relevanceScore}
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                      {employee.fullName}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-1">{employee.jobTitle}</p>
                  </div>

                  {/* Location */}
                  {employee.location && (
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="line-clamp-1">{employee.location}</span>
                    </div>
                  )}

                  {/* LinkedIn Link */}
                  {employee.linkedinUrl && (
                    <div className="flex items-center text-sm text-blue-600">
                      <Linkedin className="h-4 w-4 mr-1" />
                      <a
                        href={employee.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline line-clamp-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        View Profile
                      </a>
                    </div>
                  )}

                  {/* Credit Usage Info */}
                  {!isPremium && (
                    <div className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-200">
                      Uses 1 credit for email address generation
                    </div>
                  )}

                  {/* Contact Button */}
                  <Button
                    className="w-full mt-4"
                    size="sm"
                    disabled={!isPremium && emailCreditsUsed >= maxFreeCredits}
                  >
                    {!isPremium && emailCreditsUsed >= maxFreeCredits
                      ? "Upgrade Required"
                      : "Contact This Person"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No contacts found</h3>
          <p className="text-gray-600 mb-6">
            We couldn't find any employees automatically. Try using the LinkedIn paste tool below.
          </p>
        </div>
      )}

      {/* LinkedIn Paste Section */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Paste Your Own LinkedIn Search</h2>
        <p className="text-gray-600 mb-6">
          Not finding the right person? Generate an AI-powered LinkedIn search link or paste a
          LinkedIn "People" page here.
        </p>

        {/* Generate LinkedIn URL Button */}
        <div className="mb-6">
          <Button
            onClick={handleGenerateLinkedInUrl}
            disabled={isGeneratingLinkedInUrl}
            className="mb-4"
            variant="default"
          >
            {isGeneratingLinkedInUrl ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating LinkedIn Search Link...
              </>
            ) : (
              <>🔗 Generate LinkedIn Search Link</>
            )}
          </Button>

          {/* Show generated URL only after it's created */}
          {linkedinPeopleSearchUrl && (
            <div className="mt-4 p-4 bg-white border rounded-lg">
              <p className="text-sm text-gray-600 mb-3">
                ✅ LinkedIn search link generated successfully!
              </p>
              <div className="flex items-center space-x-2">
                <Button onClick={handleOpenLinkedInPopup} className="flex items-center space-x-2">
                  <Linkedin className="h-4 w-4" />
                  <span>View on LinkedIn</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigator.clipboard.writeText(linkedinPeopleSearchUrl)}
                  title="Copy URL"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Instructions - only show if LinkedIn URL is generated */}
        {linkedinPeopleSearchUrl && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">1. Open the LinkedIn search link above</p>
            <p className="text-sm text-gray-600 mb-2">
              2. On the LinkedIn page, press{" "}
              <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">Ctrl + A or ⌘ + A</kbd> then{" "}
              <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">Ctrl + C or ⌘ + C</kbd>
            </p>
            <p className="text-sm text-gray-600">
              3. Paste the content here:{" "}
              <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">Ctrl + V or ⌘ + V</kbd>
            </p>
          </div>
        )}

        {/* Paste Input - always show */}
        <div className="space-y-4">
          <textarea
            value={linkedinContent}
            onChange={(e) => setLinkedinContent(e.target.value)}
            placeholder="Paste LinkedIn page content here..."
            className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          <div className="flex space-x-2">
            <Button onClick={handleLinkedInPaste} disabled={!linkedinContent.trim() || isLoading}>
              {isLoading ? "Extracting..." : "Extract Employees"}
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                setLinkedinContent("");
                setShowLinkedinPaste(false);
              }}
            >
              Clear
            </Button>
          </div>
        </div>

        {extractionMessage && (
          <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
            {extractionMessage}
          </div>
        )}

        {extractionError && (
          <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
            {extractionError}
          </div>
        )}
      </div>
    </div>
  );
}
