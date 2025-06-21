"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/components/supabase-provider";
import { useAppStore } from "@/stores/app-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  User,
  CreditCard,
  Calendar,
  Trash2,
  Crown,
  Mail,
  Phone,
  GraduationCap,
  Globe,
  Linkedin,
  Zap,
} from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const supabase = useSupabase();

  // Get all store values and functions
  const store = useAppStore();
  const {
    user: storeUser,
    profile: storeProfile,
    loading: storeLoading,
    emailCreditsUsed: storeEmailCreditsUsed,
    maxFreeCredits: storeMaxFreeCredits,
    isPremium: storeIsPremium,
    refreshProfile,
    setProfile,
    initializeUser,
    setUser,
  } = store;

  // Local state for user and profile as fallback
  const [localUser, setLocalUser] = useState<{
    id: string;
    email: string;
  } | null>(null);
  const [localProfile, setLocalProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    university: "",
    study_level: "",
    field_of_study: "",
    phone: "",
    linkedin: "",
    language: "English",
  });

  // Use store user if available, otherwise use local user
  const user = storeUser || localUser;
  const profile = storeProfile || localProfile;

  // Calculate credits and premium status from current profile
  const currentEmailCreditsUsed = profile?.email_credits || 0;
  const currentMaxFreeCredits = 5;
  const currentIsPremium = profile?.plan === "premium";
  const creditsRemaining = Math.max(
    0,
    currentMaxFreeCredits - currentEmailCreditsUsed,
  );

  // Initialize user data on component mount
  useEffect(() => {
    const initializeUserData = async () => {
      try {
        setPageLoading(true);
        setError(null);

        // Check if Supabase client is available
        if (!supabase) {
          setError("Authentication service not available");
          return;
        }

        // First, try to get user from Supabase auth
        const {
          data: { user: authUser },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !authUser) {
          router.push("/login");
          return;
        }

        // Set local user as fallback
        const userData = { id: authUser.id, email: authUser.email || "" };
        setLocalUser(userData);

        // Try to initialize app store user if not already done
        if (!storeUser && typeof initializeUser === "function") {
          try {
            await initializeUser(supabase);
          } catch (initError) {
            console.log(
              "Store initialization failed, continuing with local state",
            );
          }
        }

        // Fetch profile data
        const { data: profileData, error: profileError } = await supabase
          .from("users")
          .select("*")
          .eq("id", authUser.id)
          .single();

        if (profileError && profileError.code === "PGRST116") {
          // Profile doesn't exist, create it
          const { data: newProfile, error: createError } = await supabase
            .from("users")
            .insert({
              id: authUser.id,
              email: authUser.email,
              plan: "freemium",
              email_credits: 0,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .select()
            .single();

          if (!createError) {
            setLocalProfile(newProfile);
            // Try to update store if function is available
            if (typeof setProfile === "function") {
              try {
                setProfile(newProfile);
              } catch (setError) {
                console.log("Store update failed, continuing...");
              }
            }
          }
        } else if (!profileError) {
          setLocalProfile(profileData);
          // Try to update store if function is available and profile not already set
          if (!storeProfile && typeof setProfile === "function") {
            try {
              setProfile(profileData);
            } catch (setError) {
              console.log("Store update failed, continuing...");
            }
          }
        }
      } catch (error) {
        console.error("Error initializing user data:", error);
        setError("Failed to load profile data");
      } finally {
        setPageLoading(false);
      }
    };

    initializeUserData();
  }, [supabase, router, storeUser, storeProfile, initializeUser, setProfile]);

  // Initialize form data when profile loads
  useEffect(() => {
    if (profile) {
      const newFormData = {
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        university: profile.university || "",
        study_level: profile.study_level || "",
        field_of_study: profile.field_of_study || "",
        phone: profile.phone || "",
        linkedin: profile.linkedin || "",
        language: profile.language || "English",
      };
      setFormData(newFormData);
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user || !supabase) {
      setError("Unable to save profile. Please refresh the page.");
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update profile");
      }

      // Update local state with the returned profile
      setLocalProfile(result.profile);

      // Try to update store if function is available
      if (typeof setProfile === "function") {
        try {
          setProfile(result.profile);
        } catch (setError) {
          console.log("Store update failed, continuing...");
        }
      }

      // Refresh profile from store if function is available
      if (typeof refreshProfile === "function") {
        try {
          await refreshProfile(supabase);
        } catch (refreshError) {
          console.log("Profile refresh failed, continuing...");
        }
      }

      setIsEditing(false);
      console.log("✅ Profile updated successfully");
    } catch (error) {
      console.error("❌ Error updating profile:", error);
      setError("Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Cancel editing - reset form data to current profile
  const handleCancel = () => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        university: profile.university || "",
        study_level: profile.study_level || "",
        field_of_study: profile.field_of_study || "",
        phone: profile.phone || "",
        linkedin: profile.linkedin || "",
        language: profile.language || "English",
      });
    }
    setIsEditing(false);
  };

  const handleDeleteAccount = async () => {
    if (!user || !supabase) return;

    try {
      const response = await fetch("/api/profile", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete account");
      }

      // Sign out and redirect
      await supabase.auth.signOut();
      router.push("/");

      console.log("✅ Account deleted successfully");
    } catch (error) {
      console.error("❌ Error deleting account:", error);
      setError("Failed to delete account. Please try again.");
    }
  };

  // Show loading while initializing
  if (pageLoading || storeLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Show error if there's an error or no Supabase client
  if (error || !supabase) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-red-800 mb-2">Profile Error</h2>
          <p className="text-red-600 mb-4">
            {error || "Authentication service not available"}
          </p>
          <Button onClick={() => window.location.reload()}>Refresh Page</Button>
        </div>
      </div>
    );
  }

  // Show error if no user after loading
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Unable to load user data</p>
          <Button onClick={() => window.location.reload()}>Refresh Page</Button>
        </div>
      </div>
    );
  }

  const createdAt = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("fr-FR")
    : "N/A";

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
          <button
            onClick={() => setError(null)}
            className="text-red-600 underline text-sm mt-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-4">
          <div className="bg-indigo-100 p-3 rounded-full">
            <User className="h-8 w-8 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Profile Settings
            </h1>
            <p className="text-gray-600">
              Manage your account, plan, and email credits
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Personal Information
              </h3>
              {!isEditing ? (
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  size="sm"
                >
                  Edit Profile
                </Button>
              ) : (
                <div className="space-x-2">
                  <Button onClick={handleCancel} variant="outline" size="sm">
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={isSaving} size="sm">
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      first_name: e.target.value,
                    }))
                  }
                  disabled={!isEditing}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      last_name: e.target.value,
                    }))
                  }
                  disabled={!isEditing}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="university">University/School</Label>
                <Input
                  id="university"
                  value={formData.university}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      university: e.target.value,
                    }))
                  }
                  disabled={!isEditing}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="study_level">Study Level</Label>
                <Input
                  id="study_level"
                  value={formData.study_level}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      study_level: e.target.value,
                    }))
                  }
                  disabled={!isEditing}
                  placeholder="Bachelor, Master, PhD..."
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="field_of_study">Field of Study</Label>
                <Input
                  id="field_of_study"
                  value={formData.field_of_study}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      field_of_study: e.target.value,
                    }))
                  }
                  disabled={!isEditing}
                  placeholder="Finance, Marketing, Engineering..."
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  disabled={!isEditing}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="linkedin">LinkedIn URL</Label>
                <Input
                  id="linkedin"
                  value={formData.linkedin}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      linkedin: e.target.value,
                    }))
                  }
                  disabled={!isEditing}
                  placeholder="https://linkedin.com/in/yourprofile"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="language">Language</Label>
                <Input
                  id="language"
                  value={formData.language}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      language: e.target.value,
                    }))
                  }
                  disabled={!isEditing}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Account Info Sidebar */}
        <div className="space-y-6">
          {/* Account Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Account Information
            </h3>
            <div className="space-y-6">
              {/* Email Address */}
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-gray-100 p-2 rounded-lg">
                    <Mail className="h-4 w-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Email Address
                    </p>
                    <p className="text-sm text-gray-600">{user?.email}</p>
                  </div>
                </div>
              </div>

              {/* Current Plan */}
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className={`p-2 rounded-lg ${currentIsPremium ? "bg-yellow-100" : "bg-gray-100"}`}
                  >
                    {currentIsPremium ? (
                      <Crown className="h-4 w-4 text-yellow-600" />
                    ) : (
                      <CreditCard className="h-4 w-4 text-gray-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Current Plan
                    </p>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          currentIsPremium
                            ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                            : "bg-gray-100 text-gray-800 border border-gray-200"
                        }`}
                      >
                        {currentIsPremium ? "Premium" : "Freemium"}
                      </span>
                      {currentIsPremium && (
                        <Zap className="h-3 w-3 text-yellow-500" />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Email Credits */}
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className={`p-2 rounded-lg ${
                      currentIsPremium
                        ? "bg-green-100"
                        : creditsRemaining <= 1
                          ? "bg-red-100"
                          : creditsRemaining <= 2
                            ? "bg-yellow-100"
                            : "bg-blue-100"
                    }`}
                  >
                    <Mail
                      className={`h-4 w-4 ${
                        currentIsPremium
                          ? "text-green-600"
                          : creditsRemaining <= 1
                            ? "text-red-600"
                            : creditsRemaining <= 2
                              ? "text-yellow-600"
                              : "text-blue-600"
                      }`}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Email Credits
                    </p>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">
                        {currentIsPremium ? (
                          <span className="text-green-600 font-medium">
                            Unlimited
                          </span>
                        ) : (
                          <>
                            <span className="font-medium">
                              {currentEmailCreditsUsed}
                            </span>
                            <span className="text-gray-400">/</span>
                            <span>{currentMaxFreeCredits}</span>
                            <span className="text-gray-500">used</span>
                          </>
                        )}
                      </span>
                      {!currentIsPremium && creditsRemaining <= 2 && (
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            creditsRemaining === 0
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {creditsRemaining === 0
                            ? "No credits left"
                            : `${creditsRemaining} left`}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Created */}
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-gray-100 p-2 rounded-lg">
                    <Calendar className="h-4 w-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Account Created
                    </p>
                    <p className="text-sm text-gray-600">{createdAt}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Actions
            </h3>
            <div className="space-y-3">
              {!currentIsPremium && (
                <Button
                  className="w-full"
                  onClick={() => router.push("/upgrade")}
                >
                  <Crown className="h-4 w-4 mr-2" />
                  Upgrade to Premium
                </Button>
              )}

              <Button
                variant="destructive"
                className="w-full"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Delete Account
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete your account? This action cannot
              be undone.
            </p>
            <div className="flex space-x-3">
              <Button
                variant="destructive"
                onClick={handleDeleteAccount}
                className="flex-1"
              >
                Delete Account
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
