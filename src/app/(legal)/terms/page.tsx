import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | Bypass',
  description: 'Terms of Service for Bypass - Learn about our terms and conditions.',
};

export default function TermsOfServicePage() {
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
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>
          
          <p className="text-lg text-gray-600 mb-8">
            Welcome to Bypass. By accessing our service, you agree to the following terms:
          </p>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Your Account</h2>
              <p className="text-gray-700">
                You are responsible for keeping your account credentials secure. You agree not to misuse the platform or spam contacts.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Our Service</h2>
              <p className="text-gray-700">
                We provide tools to discover companies and generate outreach emails. We do not guarantee job offers or responses.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Payments & Refunds</h2>
              <p className="text-gray-700">
                Premium subscriptions are billed monthly via Stripe. You may cancel anytime. No partial refunds are provided.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Data & Content</h2>
              <p className="text-gray-700">
                You retain rights to your own data. Emails generated via AI are provided "as is" and may be stored for analytics.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Acceptable Use</h2>
              <div className="text-gray-700 space-y-4">
                <p>You agree to use Bypass responsibly and ethically. You will not:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Send spam or unsolicited bulk emails</li>
                  <li>Use the service for illegal activities</li>
                  <li>Attempt to circumvent usage limits or security measures</li>
                  <li>Share your account credentials with others</li>
                  <li>Use the service to harass or harm others</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Service Availability</h2>
              <p className="text-gray-700">
                We strive to maintain high service availability but cannot guarantee 100% uptime. We may perform maintenance or updates that temporarily affect service availability.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Intellectual Property</h2>
              <p className="text-gray-700">
                Bypass and its features are protected by intellectual property laws. You may not copy, modify, or distribute our service without permission.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Limitation of Liability</h2>
              <p className="text-gray-700">
                Bypass is provided "as is" without warranties. We are not liable for any damages arising from your use of the service, including but not limited to lost opportunities or data.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Termination</h2>
              <p className="text-gray-700">
                We reserve the right to suspend or terminate accounts that abuse the system or violate laws. You may delete your account at any time from your profile settings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Changes to Terms</h2>
              <p className="text-gray-700">
                We may update these terms from time to time. We will notify users of significant changes via email or through the platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Contact</h2>
              <p className="text-gray-700">
                For questions about these terms, email us at:{" "}
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