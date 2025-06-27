"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { useSupabase } from "@/components/supabase-provider";
import { useSearchParams } from "next/navigation";

// Create a separate component that uses useSearchParams
function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useSupabase();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  if (!supabase) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Connecting to authentication service...</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    const handleAuthCallback = async () => {
      if (!supabase) return;

      try {
        const type = searchParams.get("type");

        // Handle password recovery flow
        if (type === "recovery") {
          const { data, error } = await supabase.auth.exchangeCodeForSession(window.location.href);

          if (error) {
            console.error("Password recovery error:", error);
            setError(error.message);
            router.push(`/login?error=${encodeURIComponent(error.message)}`);
            return;
          }

          if (data.session) {
            // Redirect to dashboard with password reset flag
            router.push("/dashboard?password_reset=true");
          } else {
            setError("No session found for password reset");
            router.push("/login?error=Password reset failed");
          }
          return;
        }

        // Handle regular OAuth callback
        const { data, error } = await supabase.auth.exchangeCodeForSession(window.location.href);

        if (error) {
          console.error("Auth callback error:", error);
          setError(error.message);

          // Redirect to login with error message
          const loginUrl = new URL("/login", window.location.origin);
          loginUrl.searchParams.set("error", error.message);
          router.push(loginUrl.toString());
          return;
        }

        if (data.session) {
          // Check if user exists in your users table
          const { data: userProfile, error: profileError } = await supabase
            .from("users")
            .select("*")
            .eq("id", data.session.user.id)
            .single();

          // If user doesn't exist in users table, create profile
          if (profileError && profileError.code === "PGRST116") {
            console.log("Creating new user profile...");

            const newProfile = {
              id: data.session.user.id,
              email: data.session.user.email,
              first_name:
                data.session.user.user_metadata?.first_name ||
                data.session.user.user_metadata?.full_name?.split(" ")[0] ||
                "",
              last_name:
                data.session.user.user_metadata?.last_name ||
                data.session.user.user_metadata?.full_name?.split(" ").slice(1).join(" ") ||
                "",
              plan: "freemium",
              email_credits: 0,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };

            const { error: insertError } = await supabase.from("users").insert(newProfile);

            if (insertError) {
              console.error("Error creating user profile:", insertError);
              // Don't block login for profile creation errors
            } else {
              console.log("✅ User profile created successfully");
            }
          }

          // Successful authentication - redirect to dashboard
          console.log("🎯 Redirecting to dashboard after successful auth");
          const next = searchParams.get("next") ?? "/dashboard"; // Default to dashboard
          router.push(next);
        } else {
          // No session found
          setError("No session found");
          router.push("/login?error=Authentication failed - no session found");
        }
      } catch (err) {
        console.error("Callback handling error:", err);
        setError(err instanceof Error ? err.message : "An unexpected error occurred");
        router.push("/login?error=Authentication failed");
      } finally {
        setLoading(false);
      }
    };

    // Only run if we have search params (indicating OAuth callback)
    const code = searchParams.get("code");
    const errorParam = searchParams.get("error");
    const type = searchParams.get("type");

    if (errorParam) {
      setError(decodeURIComponent(errorParam));
      router.push(`/login?error=${encodeURIComponent(errorParam)}`);
      return;
    }

    if (code || type === "recovery") {
      handleAuthCallback();
    } else {
      // No code parameter, check if user is already authenticated
      if (!supabase) {
        router.push("/login");
        return;
      }

      supabase.auth.getSession().then(({ data: { session }, error }) => {
        if (error) {
          console.error("Session check error:", error);
          router.push("/login");
        } else if (session) {
          router.push("/dashboard");
        } else {
          router.push("/login");
        }
        setLoading(false);
      });
    }
  }, [router, searchParams, supabase]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Authentication Error</h3>
          <p className="mt-1 text-sm text-gray-500">{error}</p>
          <div className="mt-6">
            <button
              onClick={() => router.push("/login")}
              className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  const type = searchParams.get("type");
  const isPasswordReset = type === "recovery";

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          {loading
            ? isPasswordReset
              ? "Processing password reset..."
              : "Completing authentication..."
            : "Redirecting..."}
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          {isPasswordReset
            ? "Please wait while we verify your password reset request."
            : "Please wait while we set up your account."}
        </p>

        {/* Fallback if taking too long */}
        <div className="mt-6">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-sm text-indigo-600 hover:text-indigo-500"
          >
            Continue to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
        <h3 className="mt-2 text-sm font-medium text-gray-900">Loading...</h3>
        <p className="mt-1 text-sm text-gray-500">Preparing authentication...</p>
      </div>
    </div>
  );
}

// Main component with Suspense boundary
export default function CallbackPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CallbackContent />
    </Suspense>
  );
}
