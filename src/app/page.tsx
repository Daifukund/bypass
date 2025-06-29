"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Menu, X, TrendingUp, Mail, Clock } from "lucide-react";

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="bg-white text-gray-900">
      {/* Sticky Navbar */}
      <nav className="sticky top-0 z-50 bg-white border-b shadow-sm px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="text-xl font-bold">Bypass</div>

          {/* Desktop Navigation */}
          <ul className="hidden md:flex gap-6 text-sm font-medium">
            <li>
              <Link href="#how" className="hover:text-gray-600 transition-colors">
                How it Works
              </Link>
            </li>
            <li>
              <Link href="#pricing" className="hover:text-gray-600 transition-colors">
                Pricing
              </Link>
            </li>
            <li>
              <Link href="/login" className="hover:text-gray-600 transition-colors">
                Login
              </Link>
            </li>
            <li>
              <Link href="/signup" className="hover:text-gray-600 transition-colors">
                Sign Up
              </Link>
            </li>
          </ul>

          {/* Desktop CTA */}
          <Link
            href="/signup"
            className="hidden md:block bg-black text-white px-4 py-2 rounded-xl text-sm hover:bg-gray-800 transition-colors"
          >
            Start Free Trial
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t pt-4">
            <ul className="flex flex-col gap-4 text-sm font-medium">
              <li>
                <Link
                  href="#how"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 hover:text-gray-600 transition-colors"
                >
                  How it Works
                </Link>
              </li>
              <li>
                <Link
                  href="#pricing"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 hover:text-gray-600 transition-colors"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 hover:text-gray-600 transition-colors"
                >
                  Login
                </Link>
              </li>
              <li>
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 hover:text-gray-600 transition-colors"
                >
                  Sign Up
                </Link>
              </li>
            </ul>
            <Link
              href="/signup"
              onClick={() => setMobileMenuOpen(false)}
              className="block mt-4 bg-black text-white px-4 py-3 rounded-xl text-sm text-center hover:bg-gray-800 transition-colors"
            >
              Start Free Trial
            </Link>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="px-4 sm:px-6 py-12 sm:py-20 text-center max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 leading-tight">
          Get 3x More Interview Invitations by Bypassing Job Boards
        </h1>
        <p className="text-base sm:text-lg md:text-xl mb-6 text-gray-600 max-w-2xl mx-auto">
          90% of job applications get ignored. We fix that.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mb-4">
          <Link
            href="/signup"
            className="bg-black text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors min-h-[44px] flex items-center justify-center"
          >
            Get Started – No Credit Card Required
          </Link>
          <Link
            href="#demo"
            className="text-gray-600 hover:text-gray-800 py-3 underline underline-offset-4 min-h-[44px] flex items-center justify-center transition-colors"
          >
            See Demo
          </Link>
        </div>
        <p className="text-sm text-gray-500">No credit card required • 1,200+ students hired</p>

        {/* Before vs After Comparison */}
        <div className="mt-8 sm:mt-10 flex flex-col lg:flex-row gap-6 justify-center items-start max-w-6xl mx-auto">
          {/* Traditional Applications */}
          <div className="w-full lg:w-1/2">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-red-800 mb-4 text-center">
                This is what most applications get you
              </h3>
              <div className="space-y-3 text-sm text-gray-700">
                <p>
                  <span className="bg-yellow-200 px-1 rounded">Unfortunately</span>, after careful
                  consideration, we've decided to move forward with other candidates whose
                  qualifications more closely match the requirements of the position.
                </p>
                <p>
                  We have carefully reviewed your application and{" "}
                  <span className="bg-yellow-200 px-1 rounded">unfortunately</span>, we have decided
                  not to move forward with your application at this time.
                </p>
                <p>
                  <span className="bg-yellow-200 px-1 rounded">Unfortunately</span> we are unable to
                  provide feedback due to the high volume of applications received.
                </p>
                <p>
                  <span className="bg-yellow-200 px-1 rounded">Unfortunately</span>, we won't be
                  progressing your application to the next stage. We know this may be disappointing
                  but we really value your time and efforts.
                </p>
                <p>
                  After reviewing your application,{" "}
                  <span className="bg-yellow-200 px-1 rounded">unfortunately</span> we will not be
                  proceeding with your application at this time.
                </p>
              </div>
            </div>
          </div>

          {/* Bypass Results */}
          <div className="w-full lg:w-1/2">
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-green-800 mb-4 text-center">
                This is what Bypass users receive
              </h3>
              <div className="space-y-4 text-sm text-gray-700">
                <div>
                  <p className="mb-2">
                    Hi, we'd be happy to schedule an interview with you. Would Wednesday at 2:00 PM
                    work for you?
                  </p>
                  <p className="text-green-600 font-medium">✅ Interview Scheduled</p>
                </div>

                <div>
                  <p className="mb-2">
                    Let's have a quick call to discuss the role further. Does tomorrow around 11:30
                    AM suit you?
                  </p>
                  <p className="text-blue-600 font-medium">📞 Call Confirmed</p>
                </div>

                <div>
                  <p className="mb-2">
                    You can reach out to Julia and share your CV directly with her, she's leading
                    the recruitment for this position.
                  </p>
                  <p className="text-purple-600 font-medium">🎯 Referral Response</p>
                </div>

                <div>
                  <p className="mb-2">
                    Hey, got your message. Yes, we can definitely have a quick conversation. How
                    about sometime tomorrow morning?
                  </p>
                  <p className="text-orange-600 font-medium">📩 Fast Reply</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="bg-gray-50 py-12 sm:py-16 px-4 sm:px-6 text-center" id="trust">
        <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-8">
          Trusted by Students from Top Universities
        </h2>
        <div className="flex flex-wrap justify-center items-center gap-8 mb-8">
          <Image
            src="/universities/hec.svg"
            alt="HEC Paris"
            width={120}
            height={120}
            className="opacity-70 hover:opacity-100 transition-opacity w-20 sm:w-24 h-auto"
          />
          <Image
            src="/universities/bocconi.svg"
            alt="Bocconi"
            width={120}
            height={120}
            className="opacity-70 hover:opacity-100 transition-opacity w-20 sm:w-24 h-auto"
          />
          <Image
            src="/universities/lse.svg"
            alt="London School of Economics"
            width={120}
            height={120}
            className="opacity-70 hover:opacity-100 transition-opacity w-20 sm:w-24 h-auto"
          />
          <Image
            src="/universities/essec.svg"
            alt="ESSEC"
            width={120}
            height={120}
            className="opacity-70 hover:opacity-100 transition-opacity w-20 sm:w-24 h-auto"
          />
          <Image
            src="/universities/berkley.svg"
            alt="Berkley"
            width={120}
            height={120}
            className="opacity-70 hover:opacity-100 transition-opacity w-20 sm:w-24 h-auto"
          />
          <Image
            src="/universities/mit.svg"
            alt="MIT"
            width={120}
            height={120}
            className="opacity-70 hover:opacity-100 transition-opacity w-20 sm:w-24 h-auto"
          />
          <Image
            src="/universities/imperial.svg"
            alt="Imperial"
            width={120}
            height={120}
            className="opacity-70 hover:opacity-100 transition-opacity w-20 sm:w-24 h-auto"
          />
          <Image
            src="/universities/stanford.svg"
            alt="Stanford"
            width={120}
            height={120}
            className="opacity-70 hover:opacity-100 transition-opacity w-20 sm:w-24 h-auto"
          />
          <Image
            src="/universities/oxford.svg"
            alt="Oxford"
            width={120}
            height={120}
            className="opacity-70 hover:opacity-100 transition-opacity w-20 sm:w-24 h-auto"
          />
        </div>
        <p className="text-lg sm:text-xl font-semibold mb-8">
          Used by 1,200+ students to land jobs at LVMH, McKinsey, Goldman Sachs, Google, BCG, Amazon
          and more.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="text-3xl mb-2">📈</div>
            <div className="text-3xl font-bold text-green-600 mb-1">3.2x</div>
            <div className="text-sm text-gray-600">more interview invitations</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="text-3xl mb-2">📬</div>
            <div className="text-3xl font-bold text-blue-600 mb-1">67%</div>
            <div className="text-sm text-gray-600">response rate vs 2% on job boards</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="text-3xl mb-2">⏱️</div>
            <div className="text-3xl font-bold text-purple-600 mb-1">5 days</div>
            <div className="text-sm text-gray-600">avg time to first interview</div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 text-center" id="how">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">How it Works</h2>
        <div className="grid sm:grid-cols-3 gap-6 sm:gap-8 text-center max-w-6xl mx-auto">
          <div>
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🎯</span>
            </div>
            <div className="bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold mx-auto mb-3">
              1
            </div>
            <h3 className="font-bold text-xl mb-3">Target</h3>
            <p className="text-gray-600">
              Tell us your dream role and industry
              <br />→ AI finds 50+ hiring companies
            </p>
          </div>

          <div>
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🔍</span>
            </div>
            <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold mx-auto mb-3">
              2
            </div>
            <h3 className="font-bold text-xl mb-3">Connect</h3>
            <p className="text-gray-600">
              Pick companies
              <br />→ We find the right people
            </p>
          </div>

          <div>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">💬</span>
            </div>
            <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold mx-auto mb-3">
              3
            </div>
            <h3 className="font-bold text-xl mb-3">Contact</h3>
            <p className="text-gray-600">
              Get verified emails + personalized
              <br />
              messages that get replies
            </p>
          </div>
        </div>

        <div className="mt-8 p-5 bg-gray-50 rounded-xl max-w-3xl mx-auto">
          <p className="text-base">
            <span className="font-medium text-red-600">Traditional:</span> 3–6 months, 200+ apps
            <span className="mx-3 text-lg">VS</span>
            <span className="font-medium text-green-600">Bypass:</span> 2–3 weeks, 20 contacts
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-100 py-12 sm:py-16 px-4 sm:px-6" id="features">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-10">What You Get</h2>
        <div className="grid sm:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="font-semibold text-lg mb-2">🚀 Smart Company Discovery</h3>
            <p className="text-gray-600">
              Our AI identifies companies hiring for your profile—not just posting generic jobs.
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="font-semibold text-lg mb-2">🎯 Decision-Maker Detection</h3>
            <p className="text-gray-600">
              Skip HR. Get access to hiring managers, leads, and founders directly.
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="font-semibold text-lg mb-2">🤖 AI Message Crafting</h3>
            <p className="text-gray-600">
              Get personalized emails referencing company news, pain points, and projects.
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="font-semibold text-lg mb-2">📧 Verified Contact Data</h3>
            <p className="text-gray-600">85% accuracy. Real people, real results.</p>
          </div>
        </div>
      </section>

      {/* Demo */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 text-center" id="demo">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6">See It in Action</h2>
        <div className="mx-auto rounded-xl shadow-xl w-full max-w-3xl bg-gradient-to-br from-gray-50 to-gray-100 aspect-video flex items-center justify-center border">
          <div className="text-center">
            <div className="text-5xl mb-4">🎥</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Demo Video Coming Soon</h3>
            <p className="text-gray-600 mb-4">
              See how students get 3x more interviews in under 3 minutes
            </p>
            <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Recording in progress</span>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gray-50 py-12 sm:py-16 px-4 sm:px-6 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold mb-8">Student Results</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="text-4xl mb-3">🎯</div>
            <blockquote className="text-gray-700 mb-3 italic">
              "Got 3 interviews in one week using Bypass. Way better than sending 100+ applications
              on LinkedIn."
            </blockquote>
            <p className="text-sm font-medium text-gray-900">Sarah, HEC Paris</p>
            <p className="text-xs text-gray-500">Marketing Role at LVMH</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="text-4xl mb-3">⚡</div>
            <blockquote className="text-gray-700 mb-3 italic">
              "Landed my dream consulting job in 2 weeks. The personalized emails actually get
              responses."
            </blockquote>
            <p className="text-sm font-medium text-gray-900">Marcus, LSE</p>
            <p className="text-xs text-gray-500">Consultant at McKinsey</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="text-4xl mb-3">🚀</div>
            <blockquote className="text-gray-700 mb-3 italic">
              "Finally broke into tech! Bypass helped me connect directly with hiring managers
              instead of HR."
            </blockquote>
            <p className="text-sm font-medium text-gray-900">Emma, Berkeley</p>
            <p className="text-xs text-gray-500">Product Manager at Google</p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 text-center" id="pricing">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4">Pricing</h2>
        <p className="text-gray-600 mb-2">Free forever. Pay only if you need more credits.</p>
        <p className="text-sm text-green-600 font-medium mb-8">
          ✅ Most users get hired on the free plan
        </p>

        <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="border rounded-xl p-6 bg-white shadow-sm relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                Perfect for trying out Bypass
              </span>
            </div>
            <h3 className="text-xl font-semibold mb-4 mt-2">Free Plan</h3>
            <div className="mb-6">
              <div className="text-3xl font-bold">€0</div>
              <div className="text-sm text-gray-500">Forever</div>
            </div>
            <ul className="text-sm text-left space-y-4 mb-6">
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 bg-gray-100 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs">🏢</span>
                </div>
                <div>
                  <div className="font-medium text-gray-900">Company Searches</div>
                  <div className="text-gray-600">Limited (until 5 emails used)</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 bg-gray-100 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs">👤</span>
                </div>
                <div>
                  <div className="font-medium text-gray-900">Contact Searches</div>
                  <div className="text-gray-600">Limited (until 5 emails used)</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 bg-gray-100 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs">📧</span>
                </div>
                <div>
                  <div className="font-medium text-gray-900">Email Generations</div>
                  <div className="text-gray-600">5 Free Emails</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 bg-gray-100 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs">⚡</span>
                </div>
                <div>
                  <div className="font-medium text-gray-900">AI Customization</div>
                  <div className="text-gray-600">Limited</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 bg-gray-100 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs">💬</span>
                </div>
                <div>
                  <div className="font-medium text-gray-900">Support</div>
                  <div className="text-gray-600">Community</div>
                </div>
              </li>
            </ul>
            <Link
              href="/signup"
              className="block w-full bg-gray-100 text-gray-800 px-4 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              Get Started Free
            </Link>
            <p className="text-xs text-gray-500 mt-2">No credit card required</p>
          </div>

          <div className="border rounded-xl p-6 bg-black text-white shadow-lg relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-medium">
                ⚡ For serious job seekers
              </span>
            </div>
            <h3 className="text-xl font-semibold mb-4 mt-2">Premium — €9.99</h3>
            <div className="mb-6">
              <div className="text-3xl font-bold">€9.99</div>
              <div className="text-sm text-gray-300">per month</div>
            </div>
            <ul className="text-sm text-left space-y-4 mb-6">
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 bg-green-500 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs text-white">✓</span>
                </div>
                <div>
                  <div className="font-medium">Company Searches</div>
                  <div className="text-gray-300">Unlimited</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 bg-green-500 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs text-white">✓</span>
                </div>
                <div>
                  <div className="font-medium">Contact Searches</div>
                  <div className="text-gray-300">Unlimited</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 bg-green-500 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs text-white">✓</span>
                </div>
                <div>
                  <div className="font-medium">Email Generations</div>
                  <div className="text-gray-300">Unlimited</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 bg-green-500 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs text-white">✓</span>
                </div>
                <div>
                  <div className="font-medium">AI Customization</div>
                  <div className="text-gray-300">Advanced AI Messaging</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 bg-green-500 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs text-white">✓</span>
                </div>
                <div>
                  <div className="font-medium">Support</div>
                  <div className="text-gray-300">Priority Support</div>
                </div>
              </li>
            </ul>
            <Link
              href="/signup"
              className="block w-full bg-white text-black px-4 py-3 rounded-xl font-medium hover:bg-gray-100 transition-colors"
            >
              Upgrade to Premium
            </Link>
            <p className="text-xs text-gray-300 mt-2">30-day money-back guarantee</p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            💡 <strong>Pro tip:</strong> Most users get their first interview before upgrading
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="text-center py-16 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Ready to Skip the Job Board Queue?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Start finding decision-makers instead of applying to black holes
          </p>

          <Link
            href="/signup"
            className="inline-block bg-black text-white px-8 py-4 rounded-xl font-medium hover:bg-gray-800 transition-colors text-lg mb-4"
          >
            Start Now – No Credit Card Required
          </Link>

          <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
            <span>✅ Free forever</span>
            <span>✅ 5 free emails</span>
            <span>✅ 2-minute setup</span>
          </div>
        </div>
      </section>

      {/* Q&A */}
      <section className="bg-gray-100 py-12 sm:py-16 px-4 sm:px-6 max-w-5xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-center">
          Frequently Asked Questions
        </h2>
        <div className="space-y-6">
          {/* Most Important Questions First */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="font-semibold mb-2">Is this better than LinkedIn Premium?</h3>
            <p className="text-gray-600">
              LinkedIn shows you who's hiring. Bypass shows you who to contact and what to say.
              Plus, you're not competing with 500 other "InMail" messages. Our users get 67%
              response rates vs 2% on job boards.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="font-semibold mb-2">Can I try before buying?</h3>
            <p className="text-gray-600">
              Absolutely! Use Bypass completely free – no credit card, no commitment. You get 5
              email address generations. Most users get their first interview invitation before
              upgrading.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="font-semibold mb-2">How accurate are the email addresses?</h3>
            <p className="text-gray-600">
              85%+ accuracy rate. Real people, real emails, real results.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="font-semibold mb-2">
              What's the success rate? Do people actually get hired?
            </h3>
            <p className="text-gray-600">
              Our users get 3.2x more interview invitations and land jobs 2-3x faster than
              traditional methods. Over 1,200+ students have used Bypass to get hired at companies
              like McKinsey, LVMH, Google, and JPMorgan.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="font-semibold mb-2">Is this legal/ethical?</h3>
            <p className="text-gray-600">
              100% legal and ethical. We only use publicly available information and follow GDPR
              guidelines. Think of it as smart networking, not cold emailing. We're helping you
              connect professionally, not spam.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="font-semibold mb-2">How is this different from cold emailing?</h3>
            <p className="text-gray-600">
              Our AI crafts personalized messages that reference company news, recent projects, and
              pain points. It's not generic "I'm interested in opportunities" emails – it's
              intelligent, relevant outreach that gets responses.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="font-semibold mb-2">How long does it take to see results?</h3>
            <p className="text-gray-600">
              Most users get their first positive response within 48 hours. Average time to first
              interview is 5 days. Compare that to 3-6 months of traditional job searching.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="font-semibold mb-2">What if I don't get any responses?</h3>
            <p className="text-gray-600">
              We provide email templates, messaging tips, and support to maximize your success. If
              you're not getting responses, our team will help you optimize your approach. Most
              issues are easily fixable.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="font-semibold mb-2">Do you work for all industries?</h3>
            <p className="text-gray-600">
              Yes! Our AI works across all industries – tech, consulting, finance, marketing,
              healthcare, and more. We've helped students land jobs in startups, Fortune 500
              companies, and everything in between.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="font-semibold mb-2">What happens after I send the emails?</h3>
            <p className="text-gray-600">
              You'll typically get responses within 24-48 hours. Some will be interview invitations,
              others might be referrals or requests for more info. We provide guidance on how to
              handle each type of response to maximize your chances.
            </p>
          </div>
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">Still have questions?</p>
          <a
            href="mailto:nathan.douziech@gmail.com"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Email us!
          </a>
          <p className="text-sm text-gray-500 mt-2">We usually reply within 24 hours</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Main Footer Content */}
          <div className="grid sm:grid-cols-3 gap-8 mb-8">
            {/* Brand Column */}
            <div className="sm:col-span-1">
              <div className="text-xl font-bold mb-4">Bypass</div>
              <p className="text-sm text-gray-600 mb-4">
                Skip the job board queue. Connect directly with decision-makers.
              </p>
              <div className="flex gap-3">
                <Link
                  href="https://linkedin.com"
                  target="_blank"
                  className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </Link>
                <Link
                  href="https://instagram.com"
                  target="_blank"
                  className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.618 5.367 11.986 11.988 11.986s11.987-5.368 11.987-11.986C24.014 5.367 18.635.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.611-3.197-1.559-.748-.948-1.197-2.25-1.197-3.654 0-1.404.449-2.706 1.197-3.654.749-.948 1.9-1.559 3.197-1.559s2.448.611 3.197 1.559c.748.948 1.197 2.25 1.197 3.654 0 1.404-.449 2.706-1.197 3.654-.749.948-1.9 1.559-3.197 1.559z" />
                  </svg>
                </Link>
                <Link
                  href="https://tiktok.com"
                  target="_blank"
                  className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Product Column */}
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <Link href="#how" className="hover:text-gray-800 transition-colors">
                    How it Works
                  </Link>
                </li>
                <li>
                  <Link href="#pricing" className="hover:text-gray-800 transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#demo" className="hover:text-gray-800 transition-colors">
                    Demo
                  </Link>
                </li>
                <li>
                  <Link href="/signup" className="hover:text-gray-800 transition-colors">
                    Start Free
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support Column */}
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <a
                    href="mailto:nathan.douziech@gmail.com"
                    className="hover:text-gray-800 transition-colors"
                  >
                    Contact Us
                  </a>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-gray-800 transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-gray-800 transition-colors">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>Bypass • Trusted by 1,200+ students</span>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>47 students got interviews this week</span>
              </div>
            </div>
            <p className="text-sm text-gray-500">© 2025 Bypass. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
