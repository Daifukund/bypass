"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import posthog from "posthog-js";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window !== "undefined") {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
        person_profiles: "identified_only",
        capture_pageview: false, // We'll capture manually
        defaults: "2025-05-24", // Add this line from PostHog's recommendation
      });
    }
  }, []);

  useEffect(() => {
    // Capture pageview on route changes
    if (pathname) {
      posthog.capture("$pageview", {
        $current_url: `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`,
      });
    }
  }, [pathname, searchParams]);

  return <>{children}</>;
}
