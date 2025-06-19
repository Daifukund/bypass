import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Bypass',
  description: 'Privacy Policy for Bypass - Learn how we collect, use, and protect your information.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <a href="/" className="text-2xl font-bold text-gray-900">
              Bypass
            </a>
            <nav className="flex space-x-8">
              <a href="/login" className="text-gray-600 hover:text-gray-900">
                Login
              </a>
              <a href="/signup" className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800">
                Sign up
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-lg max-w-none">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
          
          <p className="text-lg text-gray-600 mb-8">
            Bypass ("we", "us", or "our") respects your privacy. This Privacy Policy explains how we collect, use, and protect your information.
          </p>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Data We Collect</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Email and login info</li>
                <li>Job search criteria</li>
                <li>Interaction data (e.g. viewed companies, emails sent)</li>
                <li>Payment details (via Stripe)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Why We Collect It</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>To help you find job opportunities more efficiently</li>
                <li>To provide AI-powered features</li>
                <li>To improve the user experience</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Data Storage & Security</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>We use Supabase (EU-hosted PostgreSQL) to store your data securely</li>
                <li>We use OpenAI API to generate content, but do not store prompts permanently</li>
                <li>Stripe handles all payment processing — we do not store your card info</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Cookies & Analytics</h2>
              <p className="text-gray-700">
                We may use cookies for analytics purposes. You can disable cookies in your browser.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Your Rights</h2>
              <p className="text-gray-700 mb-4">You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Request access to your data</li>
                <li>Request deletion or correction</li>
                <li>Withdraw consent at any time</li>
              </ul>
              <p className="text-gray-700 mt-4">
                For any request, email us at:{" "}
                <a href="mailto:nathan.douziech@gmail.com" className="text-indigo-600 hover:text-indigo-500">
                  nathan.douziech@gmail.com
                </a>
              </p>
            </section>
          </div>

          <div className="border-t border-gray-200 pt-8 mt-12">
            <p className="text-sm text-gray-500">
              Last updated: June 2025
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Product</h3>
              <ul className="space-y-2">
                <li>
                  <a href="/#how-it-works" className="text-sm text-gray-600 hover:text-gray-900">
                    How It Works
                  </a>
                </li>
                <li>
                  <a href="/#pricing" className="text-sm text-gray-600 hover:text-gray-900">
                    Pricing
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <a href="/privacy" className="text-sm text-gray-600 hover:text-gray-900">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="/terms" className="text-sm text-gray-600 hover:text-gray-900">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Support</h3>
              <ul className="space-y-2">
                <li>
                  <a href="mailto:nathan.douziech@gmail.com" className="text-sm text-gray-600 hover:text-gray-900">
                    nathan.douziech@gmail.com
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-8 mt-8">
            <p className="text-sm text-gray-500 text-center">
              © 2025 Bypass. All rights reserved. • Trusted by 1,200+ students
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}