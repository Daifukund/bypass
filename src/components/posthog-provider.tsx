"use client";

import { useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import posthog from "posthog-js";

function PostHogTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Only capture if PostHog is properly initialized
    if (pathname && posthog.__loaded) {
      posthog.capture("$pageview", {
        $current_url: `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`,
      });
    }
  }, [pathname, searchParams]);

  return null;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
      const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;

      console.log("🔍 PostHog Config:", {
        hasKey: !!posthogKey,
        keyPreview: posthogKey?.substring(0, 15) + "...",
        host: posthogHost,
      });

      if (!posthogKey) {
        console.warn("⚠️ PostHog: Missing NEXT_PUBLIC_POSTHOG_KEY");
        return;
      }

      try {
        posthog.init(posthogKey, {
          api_host: posthogHost,
          person_profiles: "identified_only",
          capture_pageview: false,
          // ✅ EU region specific settings
          cross_subdomain_cookie: false,
          secure_cookie: true,
          loaded: (posthog) => {
            console.log("✅ PostHog initialized successfully");
          },
        });
      } catch (error) {
        console.error("❌ PostHog initialization failed:", error);
      }
    }
  }, []);

  // Silence PostHog network errors
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Intercept all window errors
      window.addEventListener("error", (event) => {
        const errorMessage = event.message || event.error?.message || "";
        const source = event.filename || "";

        const isPostHogError =
          errorMessage.includes("Failed to fetch") &&
          (source.includes("posthog") ||
            source.includes("frame_ant") ||
            source.includes("module.js"));

        if (isPostHogError) {
          event.preventDefault(); // Suppress the error
          return false;
        }
      });

      // Also handle unhandled promise rejections
      window.addEventListener("unhandledrejection", (event) => {
        const errorMessage = event.reason?.message || String(event.reason);

        if (errorMessage.includes("Failed to fetch") && errorMessage.includes("posthog")) {
          event.preventDefault();
          return false;
        }
      });
    }
  }, []);

  return (
    <>
      <Suspense fallback={null}>
        <PostHogTracker />
      </Suspense>
      {children}
    </>
  );
}
