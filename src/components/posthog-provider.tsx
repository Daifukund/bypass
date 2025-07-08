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
      const originalError = console.error;
      console.error = (...args) => {
        const errorMessage = args[0]?.toString?.() || "";

        const posthogErrors = [
          "posthog",
          "ERR_BLOCKED_BY_CLIENT",
          "Failed to fetch",
          "eu.i.posthog.com",
        ];

        const isPostHogError = posthogErrors.some((error) =>
          errorMessage.toLowerCase().includes(error.toLowerCase())
        );

        if (!isPostHogError) {
          originalError(...args);
        }
      };
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
