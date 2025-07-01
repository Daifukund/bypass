import Link from "next/link";
import { Home, Search, ArrowLeft } from "lucide-react";

export default function NotFound() {
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
          {/* 404 Illustration */}
          <div className="mb-8">
            <div className="text-6xl sm:text-8xl font-bold text-gray-200 mb-4">404</div>
            <div className="text-4xl sm:text-5xl mb-4">🔍</div>
          </div>

          {/* Error Message */}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Page Not Found</h1>
          <p className="text-gray-600 mb-8 text-sm sm:text-base">
            Oops! The page you're looking for doesn't exist. It might have been moved, deleted, or
            you entered the wrong URL.
          </p>

          {/* Action Buttons */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 bg-black text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors text-sm sm:text-base"
              >
                <Home size={16} />
                Go Home
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 border border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors text-sm sm:text-base"
              >
                <Search size={16} />
                Dashboard
              </Link>
            </div>

            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center gap-2 text-gray-600 hover:text-gray-800 transition-colors text-sm"
            >
              <ArrowLeft size={16} />
              Go Back
            </button>
          </div>

          {/* Help Section */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-4">Still having trouble? We're here to help.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm">
              <Link
                href="mailto:nathan.douziech@gmail.com"
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                Contact Support
              </Link>
              <Link href="/#how" className="text-blue-600 hover:text-blue-800 transition-colors">
                How It Works
              </Link>
              <Link
                href="/#pricing"
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                Pricing
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
