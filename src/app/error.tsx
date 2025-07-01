"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCw, Home, AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console for debugging
    console.error("Application error:", error);

    // You can also log to an external service here
    // logErrorToService(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Simple Header */}
      <nav className="border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <Link href="/" className="text-xl font-bold text-gray-900">
            Bypass
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-gray-600 hover:text-gray-900 text-sm transition-colors"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="bg-black text-white px-4 py-2 rounded-xl text-sm hover:bg-gray-800 transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="text-center max-w-md mx-auto">
          {/* Error Illustration */}
          <div className="mb-8">
            <div className="w-20 h-20 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-10 h-10 text-red-600" />
            </div>
          </div>

          {/* Error Message */}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            Something went wrong
          </h1>
          <p className="text-gray-600 mb-8 text-sm sm:text-base">
            We encountered an unexpected error. This has been logged and our team will look into it.
          </p>

          {/* Error Details (only in development) */}
          {process.env.NODE_ENV === "development" && (
            <div className="mb-8 p-4 bg-gray-50 rounded-lg text-left">
              <h3 className="font-semibold text-sm text-gray-900 mb-2">
                Error Details (Dev Mode):
              </h3>
              <p className="text-xs text-gray-600 font-mono break-all">{error.message}</p>
              {error.digest && (
                <p className="text-xs text-gray-500 mt-2">Error ID: {error.digest}</p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={reset}
                className="inline-flex items-center justify-center gap-2 bg-black text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors text-sm sm:text-base"
              >
                <RefreshCw size={16} />
                Try Again
              </button>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 border border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors text-sm sm:text-base"
              >
                <Home size={16} />
                Go Home
              </Link>
            </div>
          </div>

          {/* Help Section */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-4">
              If this problem persists, please contact our support team.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm">
              <Link
                href="mailto:nathan.douziech@gmail.com"
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                Contact Support
              </Link>
              <Link
                href="/dashboard"
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Simple Footer */}
      <footer className="border-t border-gray-200 py-6 px-4">
        <div className="text-center text-sm text-gray-500">
          © 2025 Bypass. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
