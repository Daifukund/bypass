"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSupabase } from "@/components/supabase-provider";
import { useAppStore } from "@/stores/app-store";
import { Button } from "@/components/ui/button";
import { LogOut, User, CreditCard, HelpCircle, Home, Search, Mail, Menu, X } from "lucide-react";
import posthog from "posthog-js";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const supabase = useSupabase();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [localLoading, setLocalLoading] = useState(true);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);

  // Use global store
  const {
    user,
    profile,
    loading: storeLoading,
    emailCreditsUsed,
    maxFreeCredits,
    isPremium,
    creditsRemaining,
    setUser,
    setProfile,
    clearUser,
  } = useAppStore();

  // ✅ ALL HOOKS MUST BE AT THE TOP - NO CONDITIONAL HOOKS

  // Initialize user on mount - simplified approach
  useEffect(() => {
    const initializeAuth = async () => {
      if (!supabase) {
        console.log("⏳ Layout: Waiting for Supabase initialization...");
        return;
      }

      try {
        console.log("🔄 Layout: Checking authentication...");

        // Quick session check first
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session) {
          console.log("No valid session, redirecting to login");
          setLocalLoading(false);
          router.push("/login");
          return;
        }

        // Set basic user info immediately
        const basicUser = {
          id: session.user.id,
          email: session.user.email || "",
        };

        setUser(basicUser);
        console.log("✅ Layout: Basic user set");

        // 🆕 IDENTIFY USER IN POSTHOG
        posthog.identify(session.user.id, {
          email: session.user.email,
          user_id: session.user.id,
          first_seen: new Date().toISOString(),
        });

        // Load profile in background (non-blocking)
        let finalProfileData = null;
        try {
          const { data: profileData } = await supabase
            .from("users")
            .select("*")
            .eq("id", session.user.id)
            .single();

          if (profileData) {
            setProfile(profileData);
            finalProfileData = profileData; // Store for PostHog
            console.log("✅ Layout: Profile loaded", {
              created_at: profileData.created_at,
            });
          } else {
            console.log("⚠️ No profile found for user");
          }
        } catch (profileError) {
          console.warn("Profile loading failed, but continuing:", profileError);
          // Continue without profile - user can still use the app
        }

        // 🆕 UPDATE POSTHOG USER PROPERTIES (moved here, after profile loading)
        posthog.setPersonProperties({
          plan: finalProfileData?.plan ?? "freemium",
          email_credits_used: finalProfileData?.email_credits ?? 0,
          university: finalProfileData?.university ?? null,
          study_level: finalProfileData?.study_level ?? null,
          field_of_study: finalProfileData?.field_of_study ?? null,
          language: finalProfileData?.language ?? null,
          created_at: finalProfileData?.created_at ?? null,
          profile_completion: finalProfileData ? calculateProfileCompletion(finalProfileData) : 0,
          has_profile: !!finalProfileData,
        });
      } catch (error) {
        console.error("❌ Layout: Authentication check failed:", error);
        router.push("/login");
      } finally {
        setLocalLoading(false);
      }
    };

    initializeAuth();
  }, [supabase, router, setUser, setProfile]);

  // Handle auth state changes
  useEffect(() => {
    if (!supabase) return;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🔐 Auth state change:", event);
      if (event === "SIGNED_OUT" || !session) {
        clearUser();
        router.push("/login");
      } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        // Simple re-initialization without complex retry logic
        if (session.user) {
          setUser({ id: session.user.id, email: session.user.email || "" });
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, router, setUser, clearUser]);

  // 🆕 TRACK DASHBOARD ENTRY - MOVED TO TOP WITH OTHER HOOKS
  useEffect(() => {
    if (user && !sessionStartTime) {
      setSessionStartTime(Date.now());

      posthog.capture("dashboard_entered", {
        timestamp: new Date().toISOString(),
      });
    }
  }, [user, sessionStartTime]);

  // Debug info - always called
  useEffect(() => {
    console.log("🔍 Debug Info:", {
      user: !!user,
      profile: !!profile,
      storeLoading,
      localLoading,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20) + "...",
      hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    });
  }, [user, profile, storeLoading, localLoading]);

  // ✅ ALL HOOKS ARE NOW CALLED ABOVE THIS POINT

  const handleSignOut = async () => {
    if (!supabase) return;

    try {
      // 🆕 TRACK LOGOUT EVENT
      posthog.capture("user_logged_out", {
        session_duration: sessionStartTime ? Date.now() - sessionStartTime : 0,
        timestamp: new Date().toISOString(),
      });

      await supabase.auth.signOut();

      // 🆕 RESET POSTHOG USER
      posthog.reset();

      clearUser();
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Show loading screen
  if (localLoading) {
    console.log("🔄 Layout: Showing loading screen");
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
          <p className="mt-2 text-xs text-gray-500">Checking authentication...</p>

          <div className="mt-6">
            <button
              onClick={() => window.location.reload()}
              className="text-sm text-indigo-600 hover:text-indigo-500 underline"
            >
              Taking too long? Click to refresh
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If no user after loading, redirect to login
  if (!user) {
    console.log("❌ Layout: No user found, redirecting to login");
    router.push("/login");
    return null;
  }

  console.log("✅ Layout: Rendering with user:", user.email);

  const userName = profile?.first_name
    ? `${profile.first_name} ${profile.last_name || ""}`.trim()
    : user?.email?.split("@")[0] || "User";

  // Navigation items
  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Search", href: "/criteria", icon: Search },
    { name: "Find Email", href: "/find-email", icon: Mail },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/dashboard" className="flex items-center">
                <h1 className="text-xl font-bold text-gray-900">Bypass</h1>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Right side - Credits, Profile, Actions */}
            <div className="flex items-center space-x-4">
              {/* Credit Indicator */}
              <div className="hidden sm:block text-sm">
                {isPremium ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Premium
                  </span>
                ) : (
                  <span className="text-gray-600">
                    {creditsRemaining}/{maxFreeCredits} email addresses left
                  </span>
                )}
              </div>

              {/* Desktop Actions */}
              <div className="hidden md:flex items-center space-x-2">
                <Link href="/profile">
                  <Button variant="ghost" size="sm">
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </Button>
                </Link>

                {!isPremium && (
                  <Link href="/upgrade">
                    <Button variant="outline" size="sm">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Upgrade
                    </Button>
                  </Link>
                )}

                <Link href="/help">
                  <Button variant="ghost" size="sm">
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Help
                  </Button>
                </Link>

                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-3 space-y-1">
              {/* Credit Indicator Mobile */}
              <div className="px-4 py-2 border-b border-gray-200">
                <div className="text-sm">
                  {isPremium ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Premium Plan
                    </span>
                  ) : (
                    <span className="text-gray-600">
                      {creditsRemaining}/{maxFreeCredits} email addresses left
                    </span>
                  )}
                </div>
              </div>

              {/* Navigation Links */}
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              ))}

              {/* Mobile Actions */}
              <div className="border-t border-gray-200 pt-3 space-y-1">
                <Link
                  href="/profile"
                  className="flex items-center px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="mr-3 h-5 w-5" />
                  Profile
                </Link>

                {!isPremium && (
                  <Link
                    href="/upgrade"
                    className="flex items-center px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <CreditCard className="mr-3 h-5 w-5" />
                    Upgrade
                  </Link>
                )}

                <Link
                  href="/help"
                  className="flex items-center px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <HelpCircle className="mr-3 h-5 w-5" />
                  Help
                </Link>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleSignOut();
                  }}
                  className="flex items-center w-full px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <LogOut className="mr-3 h-5 w-5" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">{children}</div>
      </main>
    </div>
  );
}

// Helper function stays the same
const calculateProfileCompletion = (profileData: any) => {
  if (!profileData) return 0;

  const fields = [
    "first_name",
    "last_name",
    "university",
    "study_level",
    "field_of_study",
    "phone",
    "linkedin",
  ];
  const completedFields = fields.filter((field) => {
    const value = profileData[field];
    return value && typeof value === "string" && value.trim().length > 0;
  }).length;

  return Math.round((completedFields / fields.length) * 100);
};
